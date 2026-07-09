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
  normalizeExerciseSeed,
} from "@/lib/admin/exercise-seed-zod";
import { formatSeedTs } from "@/lib/admin/format-seed-ts";
import { getConvexToken } from "@/lib/admin/get-convex-token";
import {
  formatDifficultyDistribution,
  inferDifficultyLevel,
} from "@/lib/admin/infer-difficulty";
import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";
import { validateExercise } from "@/lib/exercises/validate-exercise";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  primarySkillSlug: z.string().min(1),
  secondarySkillSlugs: z.array(z.string()).default([]),
  /** Omit or null to auto-infer from library gaps (mid-heavy 4–8 curve). */
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
});

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

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

    const [summaries, skills] = await Promise.all([
      fetchQuery(api.exercises.listExerciseSummaries, {}, { token }),
      fetchQuery(api.skills.listSkills, {}, { token }),
    ]);

    const skillsForPrompt = skills.map((s) => ({
      name: s.name,
      slug: nameToSlug(s.name),
      description: s.description,
      category: s.category,
    }));

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
        body.primarySkillSlug,
      );
      difficultyInferred = true;
    }
    const difficultyDistribution = formatDifficultyDistribution(
      summaries,
      body.primarySkillSlug,
    );

    const { system, prompt } = buildDrillPrompt({
      primarySkillSlug: body.primarySkillSlug,
      secondarySkillSlugs: body.secondarySkillSlugs,
      difficultyLevel,
      difficultyInferred,
      difficultyDistribution,
      exerciseType: body.exerciseType,
      targetBpm: body.targetBpm,
      direction: body.direction,
      existingDrills: summaries,
      skills: skillsForPrompt,
      priorExerciseJson: body.priorExercise
        ? JSON.stringify(body.priorExercise, null, 2)
        : undefined,
      refineInstruction: body.refineInstruction,
    });

    const model: GatewayModelId =
      (body.model as GatewayModelId | undefined) ??
      DEFAULT_DRILL_GENERATOR_MODEL;

    let generated = await generateCandidate(model, system, prompt);
    let exercise: ExerciseSeed;
    let validationError: string | null = null;

    try {
      exercise = validateExercise(normalizeExerciseSeed(generated.exercise));
    } catch (err) {
      validationError = err instanceof Error ? err.message : String(err);
      generated = await generateCandidate(
        model,
        system,
        prompt,
        validationError,
      );
      try {
        exercise = validateExercise(normalizeExerciseSeed(generated.exercise));
        validationError = null;
      } catch (err2) {
        validationError = err2 instanceof Error ? err2.message : String(err2);
        return NextResponse.json(
          {
            error: "Generated drill failed validation after repair pass",
            validationError,
            briefMarkdown: generated.briefMarkdown,
            qualityScore: recomputeQualityTotal(generated.qualityScore),
            redFlags: generated.redFlags,
            missingFields: generated.missingFields,
            reviewerChecklist: generated.reviewerChecklist,
            refinePrompt: generated.refinePrompt,
            validationStatus: "failed" as const,
            rawExercise: generated.exercise,
          },
          { status: 422 },
        );
      }
    }

    // Pin difficulty to the requested/inferred level so the model cannot drift.
    if (exercise.difficultyLevel !== difficultyLevel) {
      try {
        exercise = validateExercise({
          ...exercise,
          difficultyLevel,
        });
      } catch (err) {
        const pinError = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            error: "Generated drill failed validation after difficulty pin",
            validationError: pinError,
            briefMarkdown: generated.briefMarkdown,
            qualityScore: recomputeQualityTotal(generated.qualityScore),
            redFlags: generated.redFlags,
            missingFields: generated.missingFields,
            reviewerChecklist: generated.reviewerChecklist,
            refinePrompt: generated.refinePrompt,
            validationStatus: "failed" as const,
            rawExercise: { ...exercise, difficultyLevel },
          },
          { status: 422 },
        );
      }
    }

    const qualityScore = recomputeQualityTotal(generated.qualityScore);

    const isFirstForSkill = !summaries.some(
      (s) => s.primarySkillSlug === exercise.primarySkillId,
    );

    return NextResponse.json({
      exercise,
      briefMarkdown: generated.briefMarkdown,
      seedTs: formatSeedTs(exercise, { isFirstForSkill }),
      qualityScore,
      redFlags: generated.redFlags,
      missingFields: generated.missingFields,
      reviewerChecklist: generated.reviewerChecklist,
      refinePrompt: generated.refinePrompt,
      validationStatus: "passed" as const,
      description: exercise.description,
      difficultyLevel,
      difficultyInferred,
      difficultyDistribution,
      isFirstForSkill,
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
