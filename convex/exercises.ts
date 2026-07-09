import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { requireSuperUser } from "./lib/auth";
import {
  coreSkillValidator,
  exerciseSeedValidator,
  exerciseStatusValidator,
  exerciseTypeValidator,
  feedbackSchemaValidator,
  patternTypeValidator,
  primaryProgressMetricValidator,
  subSkillValidator,
  tabDataValidator,
  trainingAttributeValidator,
} from "./lib/exerciseValidators";
import {
  exerciseDocToSeed,
  upsertExerciseBySlug,
} from "./lib/upsertExercise";
import {
  CORE_SKILL_DEFINITIONS,
  coreSkillLabel,
  subSkillLabel,
  trainingAttributeLabel,
} from "../src/lib/skills/taxonomy";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const listExercises = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("exercises"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      difficultyLevel: v.number(),
      exerciseType: exerciseTypeValidator,
      primaryProgressMetric: primaryProgressMetricValidator,
      supportsBpm: v.boolean(),
      defaultTargetBpm: v.optional(v.number()),
      estimatedMinutes: v.number(),
      isMvp: v.boolean(),
      coreSkillId: coreSkillValidator,
      coreSkillName: v.string(),
      subSkillIds: v.array(subSkillValidator),
      subSkillNames: v.array(v.string()),
      trainingAttributes: v.array(trainingAttributeValidator),
      trainingAttributeNames: v.array(v.string()),
      skillSortOrder: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exercises").collect();

    return exercises
      .map((ex) => {
        return {
          _id: ex._id,
          _creationTime: ex._creationTime,
          title: ex.title,
          slug: ex.slug,
          description: ex.description,
          difficultyLevel: ex.difficultyLevel,
          exerciseType: ex.exerciseType,
          primaryProgressMetric: ex.primaryProgressMetric,
          supportsBpm: ex.supportsBpm,
          defaultTargetBpm: ex.defaultTargetBpm,
          estimatedMinutes: ex.estimatedMinutes,
          isMvp: ex.isMvp,
          coreSkillId: ex.coreSkillId,
          coreSkillName: coreSkillLabel(ex.coreSkillId),
          subSkillIds: ex.subSkillIds,
          subSkillNames: ex.subSkillIds.map(subSkillLabel),
          trainingAttributes: ex.trainingAttributes,
          trainingAttributeNames: ex.trainingAttributes.map(trainingAttributeLabel),
          skillSortOrder: CORE_SKILL_DEFINITIONS[ex.coreSkillId].sortOrder,
        };
      })
      .sort((a, b) => {
        if (a.skillSortOrder !== b.skillSortOrder) {
          return a.skillSortOrder - b.skillSortOrder;
        }
        if (a.difficultyLevel !== b.difficultyLevel) {
          return a.difficultyLevel - b.difficultyLevel;
        }
        return a.title.localeCompare(b.title);
      });
  },
});

export const getExercise = query({
  args: { id: v.id("exercises") },
  returns: v.union(
    v.object({
      _id: v.id("exercises"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      purpose: v.string(),
      targetWeaknesses: v.array(v.string()),
      minimumCleanStandard: v.string(),
      measurementInstructions: v.string(),
      coachingNotes: v.array(v.string()),
      coreSkillId: coreSkillValidator,
      subSkillIds: v.array(subSkillValidator),
      trainingAttributes: v.array(trainingAttributeValidator),
      difficultyLevel: v.number(),
      exerciseType: exerciseTypeValidator,
      primaryProgressMetric: primaryProgressMetricValidator,
      supportsBpm: v.boolean(),
      defaultTargetBpm: v.optional(v.number()),
      successCriteria: v.array(v.string()),
      commonMistakes: v.array(v.string()),
      progressionRule: v.string(),
      regressionRule: v.string(),
      tabData: tabDataValidator,
      patternType: patternTypeValidator,
      microDrillJustification: v.optional(v.string()),
      feedbackSchema: feedbackSchemaValidator,
      estimatedMinutes: v.number(),
      isMvp: v.boolean(),
      version: v.number(),
      status: exerciseStatusValidator,
      replacedBySlug: v.optional(v.string()),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get("exercises", args.id);
  },
});

// ---------------------------------------------------------------------------
// Dev → prod migration (internal only)
// ---------------------------------------------------------------------------

/**
 * Export active exercises from this deployment for migration.
 * Identity: slug + version (not Convex _id).
 *
 * Run on dev: CONVEX_DEPLOY_KEY=dev:... npx convex run exercises:exportExerciseSeeds
 */
export const exportExerciseSeeds = internalQuery({
  args: {},
  returns: v.array(exerciseSeedValidator),
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exercises").collect();
    return exercises
      .filter((ex) => ex.status === "active")
      .map((ex) => exerciseDocToSeed(ex))
      .sort((a, b) => a.slug.localeCompare(b.slug));
  },
});

/**
 * Idempotent import keyed on slug + version.
 * Skips when target has same or newer version; patches when source is newer.
 *
 * Run on prod: CONVEX_DEPLOY_KEY=prod:... npx convex run exercises:importExerciseSeeds '{"exercises":[...]}'
 */
export const importExerciseSeeds = internalMutation({
  args: {
    exercises: v.array(exerciseSeedValidator),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({
    inserted: v.number(),
    updated: v.number(),
    skipped: v.number(),
    rejected: v.number(),
  }),
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let rejected = 0;
    const dryRun = args.dryRun ?? false;

    for (const exercise of args.exercises) {
      try {
        const result = await upsertExerciseBySlug(ctx, exercise, { dryRun });
        if (result.action === "inserted") inserted++;
        else if (result.action === "updated") updated++;
        else skipped++;
      } catch (error) {
        rejected++;
        console.error("importExerciseSeeds rejected exercise", {
          slug: exercise.slug,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { inserted, updated, skipped, rejected };
  },
});

// ---------------------------------------------------------------------------
// Super-user admin APIs
// ---------------------------------------------------------------------------

export const listExerciseSummaries = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("exercises"),
      title: v.string(),
      slug: v.string(),
      purpose: v.string(),
      difficultyLevel: v.number(),
      exerciseType: exerciseTypeValidator,
      coreSkillId: coreSkillValidator,
      coreSkillName: v.string(),
      subSkillIds: v.array(subSkillValidator),
      subSkillNames: v.array(v.string()),
      trainingAttributes: v.array(trainingAttributeValidator),
    }),
  ),
  handler: async (ctx) => {
    await requireSuperUser(ctx);

    const exercises = await ctx.db.query("exercises").collect();

    return exercises
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((ex) => {
        return {
          _id: ex._id,
          title: ex.title,
          slug: ex.slug,
          purpose: ex.purpose,
          difficultyLevel: ex.difficultyLevel,
          exerciseType: ex.exerciseType,
          coreSkillId: ex.coreSkillId,
          coreSkillName: coreSkillLabel(ex.coreSkillId),
          subSkillIds: ex.subSkillIds,
          subSkillNames: ex.subSkillIds.map(subSkillLabel),
          trainingAttributes: ex.trainingAttributes,
        };
      });
  },
});

/**
 * Upserts a generated exercise candidate in the dev authoring environment.
 * Always overwrites by slug (version bump is the author's responsibility).
 */
export const saveGeneratedExercise = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    purpose: v.string(),
    targetWeaknesses: v.array(v.string()),
    minimumCleanStandard: v.string(),
    measurementInstructions: v.string(),
    coachingNotes: v.array(v.string()),
    coreSkillId: coreSkillValidator,
    subSkillIds: v.array(subSkillValidator),
    trainingAttributes: v.array(trainingAttributeValidator),
    difficultyLevel: v.number(),
    exerciseType: exerciseTypeValidator,
    primaryProgressMetric: primaryProgressMetricValidator,
    supportsBpm: v.boolean(),
    defaultTargetBpm: v.optional(v.number()),
    successCriteria: v.array(v.string()),
    commonMistakes: v.array(v.string()),
    progressionRule: v.string(),
    regressionRule: v.string(),
    tabData: tabDataValidator,
    patternType: patternTypeValidator,
    microDrillJustification: v.optional(v.string()),
    feedbackSchema: feedbackSchemaValidator,
    estimatedMinutes: v.number(),
    isMvp: v.boolean(),
    version: v.number(),
    status: exerciseStatusValidator,
    replacedBySlug: v.optional(v.string()),
  },
  returns: v.object({
    id: v.id("exercises"),
    action: v.union(v.literal("inserted"), v.literal("updated")),
  }),
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    const result = await upsertExerciseBySlug(ctx, args, {
      forceOverwrite: true,
    });

    if (!result.id) {
      throw new Error("Failed to save exercise");
    }

    const action =
      result.action === "inserted"
        ? ("inserted" as const)
        : ("updated" as const);

    return {
      id: result.id,
      action,
    };
  },
});
