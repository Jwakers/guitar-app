import type { Doc } from "../_generated/dataModel";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export type UpsertAction = "inserted" | "updated" | "skipped";

export function buildExerciseDocument(exercise: ExerciseSeed, updatedAt: number) {
  return {
    title: exercise.title,
    slug: exercise.slug,
    description: exercise.description,
    purpose: exercise.purpose,
    targetWeaknesses: exercise.targetWeaknesses,
    minimumCleanStandard: exercise.minimumCleanStandard,
    measurementInstructions: exercise.measurementInstructions,
    coachingNotes: exercise.coachingNotes,
    coreSkillId: exercise.coreSkillId,
    subSkillIds: exercise.subSkillIds,
    trainingAttributes: exercise.trainingAttributes,
    difficultyLevel: exercise.difficultyLevel,
    exerciseType: exercise.exerciseType,
    primaryProgressMetric: exercise.primaryProgressMetric,
    supportsBpm: exercise.supportsBpm,
    defaultTargetBpm: exercise.defaultTargetBpm,
    successCriteria: exercise.successCriteria,
    commonMistakes: exercise.commonMistakes,
    progressionRule: exercise.progressionRule,
    regressionRule: exercise.regressionRule,
    tabData: exercise.tabData,
    patternType: exercise.patternType,
    microDrillJustification: exercise.microDrillJustification,
    feedbackSchema: exercise.feedbackSchema,
    estimatedMinutes: exercise.estimatedMinutes,
    isMvp: exercise.isMvp,
    version: exercise.version,
    status: exercise.status,
    replacedBySlug: exercise.replacedBySlug,
    adminNotes: exercise.adminNotes,
    updatedAt,
  };
}

type UpsertOptions = {
  /**
   * Dev authoring: always write regardless of version comparison.
   * Migration: false — skip when target version is same or newer.
   */
  forceOverwrite?: boolean;
  dryRun?: boolean;
};

export async function upsertExerciseBySlug(
  ctx: MutationCtx,
  exercise: ExerciseSeed,
  options: UpsertOptions = {},
): Promise<{ action: UpsertAction; id?: Id<"exercises"> }> {
  const now = Date.now();
  const payload = buildExerciseDocument(exercise, now);

  const existing = await ctx.db
    .query("exercises")
    .withIndex("by_slug", (q) => q.eq("slug", exercise.slug))
    .unique();

  if (!existing) {
    if (options.dryRun) {
      return { action: "inserted" };
    }
    const id = await ctx.db.insert("exercises", payload);
    return { action: "inserted", id };
  }

  if (
    !options.forceOverwrite &&
    existing.version >= exercise.version
  ) {
    return { action: "skipped", id: existing._id };
  }

  if (options.dryRun) {
    return { action: "updated", id: existing._id };
  }

  await ctx.db.patch(existing._id, payload);
  return { action: "updated", id: existing._id };
}

export function exerciseDocToSeed(doc: Doc<"exercises">): ExerciseSeed {
  const { _id, _creationTime, updatedAt, ...seed } = doc;
  return seed;
}
