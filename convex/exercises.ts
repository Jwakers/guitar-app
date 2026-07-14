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
  exerciseMetadataPatchValidator,
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
    const exercise = await ctx.db.get("exercises", args.id);
    if (!exercise) {
      return null;
    }
    const { adminNotes: _adminNotes, ...publicExercise } = exercise;
    return publicExercise;
  },
});

export type AdminNote = { id: string; text: string };

type LegacyAdminNotes = string | string[] | AdminNote[] | undefined;

function newAdminNoteId(): string {
  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isAdminNoteObject(value: unknown): value is AdminNote {
  return (
    typeof value === "object" &&
    value !== null &&
    "text" in value &&
    typeof (value as AdminNote).text === "string"
  );
}

/**
 * Normalize stored admin notes to { id, text }[].
 * Trims each note and drops blanks. Legacy string / string[] get stable
 * `legacy:N` ids for display until the next write upgrades them to real ids.
 */
function normalizeAdminNotes(
  value: LegacyAdminNotes,
  options: { assignStableLegacyIds?: boolean } = {},
): AdminNote[] {
  const { assignStableLegacyIds = false } = options;

  if (value === undefined) return [];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return [];
    return [
      {
        id: assignStableLegacyIds ? "legacy:0" : newAdminNoteId(),
        text: trimmed,
      },
    ];
  }

  if (!Array.isArray(value)) return [];

  if (value.length > 0 && isAdminNoteObject(value[0])) {
    return (value as AdminNote[])
      .map((note) => {
        const text = note.text.trim();
        const id =
          typeof note.id === "string" && note.id.trim() !== ""
            ? note.id
            : newAdminNoteId();
        return { id, text };
      })
      .filter((note) => note.text !== "");
  }

  const texts = (value as string[])
    .map((note) => (typeof note === "string" ? note.trim() : ""))
    .filter((note) => note !== "");

  return texts.map((text, index) => ({
    id: assignStableLegacyIds ? `legacy:${index}` : newAdminNoteId(),
    text,
  }));
}

/**
 * Super-user only: load admin review notes for an exercise.
 */
export const getExerciseAdminNotes = query({
  args: { id: v.id("exercises") },
  returns: v.array(
    v.object({
      id: v.string(),
      text: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);
    const exercise = await ctx.db.get("exercises", args.id);
    if (!exercise) {
      return [];
    }
    // Legacy shapes get deterministic legacy:N ids for this read; writes upgrade.
    return normalizeAdminNotes(
      exercise.adminNotes as LegacyAdminNotes,
      { assignStableLegacyIds: true },
    );
  },
});

/**
 * Super-user only: append an admin review note.
 */
export const addExerciseAdminNote = mutation({
  args: {
    id: v.id("exercises"),
    note: v.string(),
  },
  returns: v.object({
    id: v.id("exercises"),
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    const trimmed = args.note.trim();
    if (trimmed === "") {
      throw new Error("Admin note cannot be empty");
    }

    const exercise = await ctx.db.get("exercises", args.id);
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    const current = normalizeAdminNotes(
      exercise.adminNotes as LegacyAdminNotes,
    );
    const nextNotes: AdminNote[] = [
      ...current,
      { id: newAdminNoteId(), text: trimmed },
    ];
    await ctx.db.patch("exercises", args.id, {
      adminNotes: nextNotes,
      updatedAt: Date.now(),
    });

    return { id: args.id, count: nextNotes.length };
  },
});

/**
 * Super-user only: remove an admin review note by stable note id.
 */
export const removeExerciseAdminNote = mutation({
  args: {
    id: v.id("exercises"),
    noteId: v.string(),
  },
  returns: v.object({
    id: v.id("exercises"),
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    const exercise = await ctx.db.get("exercises", args.id);
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    const raw = exercise.adminNotes as LegacyAdminNotes;
    // Match ids from getExerciseAdminNotes (legacy:N) before upgrading.
    const current = normalizeAdminNotes(raw, { assignStableLegacyIds: true });
    const nextNotes = current
      .filter((note) => note.id !== args.noteId)
      .map((note) =>
        note.id.startsWith("legacy:")
          ? { id: newAdminNoteId(), text: note.text }
          : note,
      );

    if (nextNotes.length === current.length) {
      throw new Error("Admin note not found");
    }

    const {
      _id: _docId,
      _creationTime: _created,
      adminNotes: _removed,
      ...withoutNotes
    } = exercise;

    if (nextNotes.length === 0) {
      await ctx.db.replace("exercises", args.id, {
        ...withoutNotes,
        updatedAt: Date.now(),
      });
      return { id: args.id, count: 0 };
    }

    await ctx.db.patch("exercises", args.id, {
      adminNotes: nextNotes,
      updatedAt: Date.now(),
    });

    return { id: args.id, count: nextNotes.length };
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

/**
 * Super-user only: patch exercise metadata without touching slug or tabData.
 */
export const updateExerciseMetadata = mutation({
  args: {
    id: v.id("exercises"),
    patch: exerciseMetadataPatchValidator,
  },
  returns: v.object({
    id: v.id("exercises"),
    version: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireSuperUser(ctx);

    const exercise = await ctx.db.get("exercises", args.id);
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    const nextVersion = exercise.version + 1;
    const {
      defaultTargetBpm,
      microDrillJustification,
      replacedBySlug,
      ...required
    } = args.patch;

    const nextDoc = {
      title: required.title,
      slug: exercise.slug,
      description: required.description,
      purpose: required.purpose,
      targetWeaknesses: required.targetWeaknesses,
      minimumCleanStandard: required.minimumCleanStandard,
      measurementInstructions: required.measurementInstructions,
      coachingNotes: required.coachingNotes,
      coreSkillId: required.coreSkillId,
      subSkillIds: required.subSkillIds,
      trainingAttributes: required.trainingAttributes,
      difficultyLevel: required.difficultyLevel,
      exerciseType: required.exerciseType,
      primaryProgressMetric: required.primaryProgressMetric,
      supportsBpm: required.supportsBpm,
      ...(defaultTargetBpm !== undefined ? { defaultTargetBpm } : {}),
      successCriteria: required.successCriteria,
      commonMistakes: required.commonMistakes,
      progressionRule: required.progressionRule,
      regressionRule: required.regressionRule,
      tabData: exercise.tabData,
      patternType: required.patternType,
      ...(microDrillJustification !== undefined
        ? { microDrillJustification }
        : {}),
      feedbackSchema: required.feedbackSchema,
      estimatedMinutes: required.estimatedMinutes,
      isMvp: required.isMvp,
      version: nextVersion,
      status: required.status,
      ...(replacedBySlug !== undefined ? { replacedBySlug } : {}),
      updatedAt: Date.now(),
      ...(exercise.adminNotes !== undefined
        ? {
            adminNotes: normalizeAdminNotes(
              exercise.adminNotes as LegacyAdminNotes,
            ),
          }
        : {}),
    };

    await ctx.db.replace("exercises", args.id, nextDoc);

    return {
      id: args.id,
      version: nextVersion,
    };
  },
});
