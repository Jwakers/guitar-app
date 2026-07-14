import { generateText, Output, type GatewayModelId } from "ai";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import {
  DEFAULT_DRILL_GENERATOR_MODEL,
  type DrillGeneratorModel,
} from "@/lib/admin/ai-models";
import { buildDrillPrompt } from "@/lib/admin/build-drill-prompt";
import {
  drillGeneratorOutputSchema,
} from "@/lib/admin/exercise-seed-zod";
import { getConvexToken } from "@/lib/admin/get-convex-token";
import {
  formatDifficultyDistribution,
  inferDifficultyLevel,
} from "@/lib/admin/infer-difficulty";
import {
  formatSubSkillDistribution,
  inferSubSkillIds,
} from "@/lib/admin/infer-sub-skills";
import {
  formatTrainingAttributeDistribution,
  inferTrainingAttributes,
} from "@/lib/admin/infer-training-attributes";
import type { TaxonomyConstraints } from "@/lib/admin/pin-exercise-taxonomy";
import {
  shouldAttemptLlmRepair,
  validateGeneratedDrill,
} from "@/lib/admin/validate-generated-drill";
import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";
import {
  CORE_SKILLS,
  SUB_SKILLS,
  TRAINING_ATTRIBUTES,
  coreSkillRequiresSubSkills,
  subSkillBelongsToCoreSkill,
  subSkillCanDriveStandaloneGeneration,
} from "@/lib/skills/taxonomy";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z
  .object({
    coreSkillId: z.enum(CORE_SKILLS),
    subSkillIds: z.array(z.enum(SUB_SKILLS)).default([]),
    trainingAttributes: z.array(z.enum(TRAINING_ATTRIBUTES)).default([]),
    /** Omit or null to auto-infer from library gaps (start-heavy 1–4 curve). */
    difficultyLevel: z.number().int().min(1).max(10).nullable().optional(),
    exerciseType: z.enum([
      "warmup",
      "primary",
      "secondary",
      "accessory",
      "isolation",
      "test",
    ]),
    targetBpm: z.number().positive().optional(),
    direction: z.string().optional(),
    priorExercise: z.unknown().optional(),
    refineInstruction: z.string().optional(),
    /** AI Gateway model id — typed as GatewayModelId in code; validated as string at the edge. */
    model: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    for (const subSkillId of data.subSkillIds) {
      if (!subSkillBelongsToCoreSkill(subSkillId, data.coreSkillId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `sub-skill "${subSkillId}" is not allowed under core skill "${data.coreSkillId}"`,
          path: ["subSkillIds"],
        });
      }
    }
    if (
      data.subSkillIds.length > 0 &&
      !subSkillCanDriveStandaloneGeneration(data.subSkillIds)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "subSkillIds cannot consist only of cross-cutting technique tags (palm_muting, fret_hand_muting, release_control)",
        path: ["subSkillIds"],
      });
    }
  });

function recomputeQualityTotal(
  score: z.infer<typeof drillGeneratorOutputSchema>["qualityScore"],
) {
  const total =
    score.clearTrainingPurpose +
    score.measurableOutcome +
    score.mechanicalUsefulness +
    score.appropriateDifficulty +
    score.progressionRegressionQuality +
    score.coachingQuality;
  return { ...score, total };
}

function validationFailureResponse(
  error: string,
  validationError: string,
  generated: z.infer<typeof drillGeneratorOutputSchema>,
  patternType: string,
  rawExercise: unknown,
  taxonomyPinned: boolean,
  pinnedFields: string[],
) {
  return NextResponse.json(
    {
      error,
      validationError,
      briefMarkdown: generated.briefMarkdown,
      qualityScore: recomputeQualityTotal(generated.qualityScore),
      patternType,
      redFlags: generated.redFlags,
      missingFields: generated.missingFields,
      reviewerChecklist: generated.reviewerChecklist,
      refinePrompt: generated.refinePrompt,
      validationStatus: "failed" as const,
      rawExercise,
      taxonomyPinned,
      pinnedFields,
    },
    { status: 422 },
  );
}

async function generateCandidate(
  model: DrillGeneratorModel,
  system: string,
  prompt: string,
  repairNote?: string,
) {
  const fullPrompt = repairNote
    ? `${prompt}\n\n## Validation repair pass\nThe previous candidate failed validation:\n${repairNote}\nFix the exercise object so it passes validateExercise / validateTabData. Keep the same training intent.`
    : prompt;

  // Plain creator/model string → Vercel AI Gateway (AI_GATEWAY_API_KEY).
  const { output } = await generateText({
    model,
    system,
    prompt: fullPrompt,
    output: Output.object({ schema: drillGeneratorOutputSchema }),
  });

  if (!output) {
    throw new Error("Model returned no structured output");
  }

  return output;
}

export async function POST(request: Request) {
  try {
    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        { error: "AI_GATEWAY_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const token = await getConvexToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await fetchQuery(api.users.getCurrentUser, {}, { token });
    if (!user || user.isSuperUser !== true) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = requestSchema.parse(await request.json());

    const summaries = await fetchQuery(
      api.exercises.listExerciseSummaries,
      {},
      { token },
    );

    let subSkillIds = body.subSkillIds;
    let subSkillIdsInferred = false;
    if (
      subSkillIds.length === 0 &&
      coreSkillRequiresSubSkills(body.coreSkillId)
    ) {
      subSkillIds = inferSubSkillIds(summaries, body.coreSkillId);
      subSkillIdsInferred = true;
    }
    const subSkillDistribution = formatSubSkillDistribution(
      summaries,
      body.coreSkillId,
    );

    let difficultyLevel: number;
    let difficultyInferred: boolean;
    if (
      typeof body.difficultyLevel === "number" &&
      Number.isInteger(body.difficultyLevel)
    ) {
      difficultyLevel = body.difficultyLevel;
      difficultyInferred = false;
    } else {
      difficultyLevel = inferDifficultyLevel(
        summaries,
        body.coreSkillId,
        subSkillIds,
      );
      difficultyInferred = true;
    }
    const difficultyDistribution = formatDifficultyDistribution(
      summaries,
      body.coreSkillId,
      subSkillIds,
    );

    let trainingAttributes: (typeof TRAINING_ATTRIBUTES)[number][];
    let trainingAttributesInferred: boolean;
    if (body.trainingAttributes.length > 0) {
      trainingAttributes = body.trainingAttributes;
      trainingAttributesInferred = false;
    } else {
      trainingAttributes = inferTrainingAttributes(
        summaries,
        body.coreSkillId,
        subSkillIds,
      );
      trainingAttributesInferred = true;
    }
    const trainingAttributeDistribution = formatTrainingAttributeDistribution(
      summaries,
      body.coreSkillId,
      subSkillIds,
    );

    const { system, prompt } = buildDrillPrompt({
      coreSkillId: body.coreSkillId,
      subSkillIds,
      subSkillIdsInferred,
      subSkillDistribution,
      trainingAttributes,
      trainingAttributesInferred,
      trainingAttributeDistribution,
      difficultyLevel,
      difficultyInferred,
      difficultyDistribution,
      exerciseType: body.exerciseType,
      targetBpm: body.targetBpm,
      direction: body.direction,
      existingDrills: summaries,
      priorExerciseJson: body.priorExercise
        ? JSON.stringify(body.priorExercise, null, 2)
        : undefined,
      refineInstruction: body.refineInstruction,
    });

    const model: GatewayModelId =
      (body.model as GatewayModelId | undefined) ??
      DEFAULT_DRILL_GENERATOR_MODEL;

    let generated = await generateCandidate(model, system, prompt);

    const taxonomyConstraints: TaxonomyConstraints = {
      coreSkillId: body.coreSkillId,
      subSkillIds,
    };

    let taxonomyPinned = false;
    let pinnedFields: string[] = [];

    let validation = validateGeneratedDrill(
      generated.exercise,
      taxonomyConstraints,
    );
    taxonomyPinned = validation.taxonomyPinned || taxonomyPinned;
    pinnedFields = [...new Set([...pinnedFields, ...validation.pinnedFields])];

    if (
      !validation.ok &&
      shouldAttemptLlmRepair(validation.validationError)
    ) {
      generated = await generateCandidate(
        model,
        system,
        prompt,
        validation.validationError,
      );
      validation = validateGeneratedDrill(
        generated.exercise,
        taxonomyConstraints,
      );
      taxonomyPinned = validation.taxonomyPinned || taxonomyPinned;
      pinnedFields = [...new Set([...pinnedFields, ...validation.pinnedFields])];
    }

    if (!validation.ok) {
      return validationFailureResponse(
        shouldAttemptLlmRepair(validation.validationError)
          ? "Generated drill failed validation after repair pass"
          : "Generated drill failed validation",
        validation.validationError,
        generated,
        generated.patternType ?? generated.exercise.patternType,
        validation.rawExercise,
        taxonomyPinned,
        pinnedFields,
      );
    }

    let exercise: ExerciseSeed = validation.exercise;

    // Pin difficulty to the requested/inferred level so the model cannot drift.
    if (exercise.difficultyLevel !== difficultyLevel) {
      const difficultyValidation = validateGeneratedDrill(
        { ...exercise, difficultyLevel },
        taxonomyConstraints,
      );
      if (!difficultyValidation.ok) {
        return validationFailureResponse(
          "Generated drill failed validation after difficulty pin",
          difficultyValidation.validationError,
          generated,
          generated.patternType ?? exercise.patternType,
          difficultyValidation.rawExercise,
          taxonomyPinned,
          pinnedFields,
        );
      }
      exercise = difficultyValidation.exercise;
    }

    const trainingAttributesMatch =
      exercise.trainingAttributes.length === trainingAttributes.length &&
      trainingAttributes.every((attribute) =>
        exercise.trainingAttributes.includes(attribute),
      );
    if (!trainingAttributesMatch) {
      const attributeValidation = validateGeneratedDrill(
        { ...exercise, trainingAttributes },
        taxonomyConstraints,
      );
      if (!attributeValidation.ok) {
        return validationFailureResponse(
          "Generated drill failed validation after training attribute pin",
          attributeValidation.validationError,
          generated,
          generated.patternType ?? exercise.patternType,
          attributeValidation.rawExercise,
          taxonomyPinned,
          pinnedFields,
        );
      }
      exercise = attributeValidation.exercise;
    }

    const qualityScore = recomputeQualityTotal(generated.qualityScore);

    return NextResponse.json({
      exercise,
      briefMarkdown: generated.briefMarkdown,
      qualityScore,
      patternType: generated.patternType ?? exercise.patternType,
      redFlags: generated.redFlags,
      missingFields: generated.missingFields,
      reviewerChecklist: generated.reviewerChecklist,
      refinePrompt: generated.refinePrompt,
      validationStatus: "passed" as const,
      description: exercise.description,
      taxonomyPinned,
      pinnedFields,
      subSkillIds,
      subSkillIdsInferred,
      subSkillDistribution,
      difficultyLevel,
      difficultyInferred,
      difficultyDistribution,
      trainingAttributes,
      trainingAttributesInferred,
      trainingAttributeDistribution,
    });
  } catch (err) {
    console.error("generate-drill failed", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
