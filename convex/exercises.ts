import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { ALL_EXERCISES } from "../seed/exercises/index";
import { requireSuperUser } from "./lib/auth";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a skill name to the slug format used in seed files. */
function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

const exerciseTypeValidator = v.union(
  v.literal("warmup"),
  v.literal("primary"),
  v.literal("secondary"),
  v.literal("accessory"),
  v.literal("isolation"),
  v.literal("test"),
);

const primaryProgressMetricValidator = v.union(
  v.literal("clean_bpm"),
  v.literal("accuracy_score"),
  v.literal("timing_consistency"),
  v.literal("control_score"),
  v.literal("clean_reps"),
  v.literal("endurance_duration"),
  v.literal("noise_control"),
  v.literal("comfort_score"),
);

const exerciseStatusValidator = v.union(
  v.literal("active"),
  v.literal("deprecated"),
  v.literal("replaced"),
);

const tabDataValidator = v.object({
  tuning: v.array(v.string()),
  capo: v.optional(v.number()),
  tempo: v.number(),
  timeSignature: v.object({ beats: v.number(), beatValue: v.number() }),
  bars: v.array(
    v.object({
      beats: v.array(
        v.object({
          duration: v.union(
            v.literal("whole"),
            v.literal("half"),
            v.literal("quarter"),
            v.literal("eighth"),
            v.literal("sixteenth"),
          ),
          tuplet: v.optional(v.number()),
          notes: v.array(
            v.object({
              string: v.union(
                v.literal(1),
                v.literal(2),
                v.literal(3),
                v.literal(4),
                v.literal(5),
                v.literal(6),
              ),
              fret: v.number(),
              finger: v.optional(
                v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
              ),
              technique: v.optional(
                v.union(
                  v.literal("picked"),
                  v.literal("hammer_on"),
                  v.literal("pull_off"),
                  v.literal("slide"),
                  v.literal("bend"),
                  v.literal("release"),
                  v.literal("vibrato"),
                  v.literal("mute"),
                  v.literal("harmonic"),
                ),
              ),
              targetPitch: v.optional(v.string()),
            }),
          ),
          picking: v.optional(
            v.union(
              v.literal("down"),
              v.literal("up"),
              v.literal("alternate"),
              v.literal("economy"),
              v.literal("sweep"),
            ),
          ),
          accent: v.optional(v.boolean()),
          rest: v.optional(v.boolean()),
        }),
      ),
    }),
  ),
  displayHints: v.optional(
    v.object({
      showPicking: v.optional(v.boolean()),
      showAccents: v.optional(v.boolean()),
      showFingering: v.optional(v.boolean()),
      loopStartBar: v.optional(v.number()),
      loopEndBar: v.optional(v.number()),
    }),
  ),
});

const feedbackSchemaValidator = v.array(
  v.object({
    id: v.string(),
    label: v.string(),
    type: v.union(
      v.literal("segmented"),
      v.literal("rating"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("choice"),
    ),
    required: v.boolean(),
    options: v.optional(
      v.array(v.object({ id: v.string(), label: v.string() })),
    ),
    followUpRules: v.optional(
      v.array(
        v.object({ ifOptionId: v.string(), showQuestionId: v.string() }),
      ),
    ),
  }),
);

async function resolveSkillSlugs(
  ctx: MutationCtx,
  primarySkillId: string,
  secondarySkillIds: string[],
): Promise<{
  primarySkillId: Id<"skills">;
  secondarySkillIds: Id<"skills">[];
}> {
  const skills = await ctx.db.query("skills").collect();
  const skillBySlug = new Map<string, Id<"skills">>();
  for (const skill of skills) {
    skillBySlug.set(nameToSlug(skill.name), skill._id);
  }

  const primary = skillBySlug.get(primarySkillId);
  if (!primary) {
    throw new Error(
      `No skill found for primarySkillId slug "${primarySkillId}". Run skills:seedSkills first.`,
    );
  }

  const secondary: Id<"skills">[] = [];
  for (const slug of secondarySkillIds) {
    const id = skillBySlug.get(slug);
    if (!id) {
      throw new Error(`No skill found for secondarySkillId slug "${slug}".`);
    }
    secondary.push(id);
  }

  return { primarySkillId: primary, secondarySkillIds: secondary };
}

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
      exerciseType: v.union(
        v.literal("warmup"),
        v.literal("primary"),
        v.literal("secondary"),
        v.literal("accessory"),
        v.literal("isolation"),
        v.literal("test"),
      ),
      primaryProgressMetric: v.union(
        v.literal("clean_bpm"),
        v.literal("accuracy_score"),
        v.literal("timing_consistency"),
        v.literal("control_score"),
        v.literal("clean_reps"),
        v.literal("endurance_duration"),
        v.literal("noise_control"),
        v.literal("comfort_score"),
      ),
      supportsBpm: v.boolean(),
      defaultTargetBpm: v.optional(v.number()),
      estimatedMinutes: v.number(),
      isMvp: v.boolean(),
      primarySkillId: v.id("skills"),
      primarySkillName: v.string(),
      primarySkillSlug: v.string(),
      skillSortOrder: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const [exercises, skills] = await Promise.all([
      ctx.db.query("exercises").collect(),
      ctx.db.query("skills").collect(),
    ]);

    const skillById = new Map(skills.map((s) => [s._id, s]));

    return exercises
      .map((ex) => {
        const skill = skillById.get(ex.primarySkillId);
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
          primarySkillId: ex.primarySkillId,
          primarySkillName: skill?.name ?? "Unknown",
          primarySkillSlug: skill ? nameToSlug(skill.name) : "unknown",
          skillSortOrder: skill?.sortOrder ?? Number.MAX_SAFE_INTEGER,
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
      primarySkillId: v.id("skills"),
      secondarySkillIds: v.array(v.id("skills")),
      difficultyLevel: v.number(),
      exerciseType: v.union(
        v.literal("warmup"),
        v.literal("primary"),
        v.literal("secondary"),
        v.literal("accessory"),
        v.literal("isolation"),
        v.literal("test"),
      ),
      primaryProgressMetric: v.union(
        v.literal("clean_bpm"),
        v.literal("accuracy_score"),
        v.literal("timing_consistency"),
        v.literal("control_score"),
        v.literal("clean_reps"),
        v.literal("endurance_duration"),
        v.literal("noise_control"),
        v.literal("comfort_score"),
      ),
      supportsBpm: v.boolean(),
      defaultTargetBpm: v.optional(v.number()),
      successCriteria: v.array(v.string()),
      commonMistakes: v.array(v.string()),
      progressionRule: v.string(),
      regressionRule: v.string(),
      tabData: v.object({
        tuning: v.array(v.string()),
        capo: v.optional(v.number()),
        tempo: v.number(),
        timeSignature: v.object({ beats: v.number(), beatValue: v.number() }),
        bars: v.array(
          v.object({
            beats: v.array(
              v.object({
                duration: v.union(
                  v.literal("whole"),
                  v.literal("half"),
                  v.literal("quarter"),
                  v.literal("eighth"),
                  v.literal("sixteenth"),
                ),
                tuplet: v.optional(v.number()),
                notes: v.array(
                  v.object({
                    string: v.union(
                      v.literal(1),
                      v.literal(2),
                      v.literal(3),
                      v.literal(4),
                      v.literal(5),
                      v.literal(6),
                    ),
                    fret: v.number(),
                    finger: v.optional(
                      v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
                    ),
                    technique: v.optional(
                      v.union(
                        v.literal("picked"),
                        v.literal("hammer_on"),
                        v.literal("pull_off"),
                        v.literal("slide"),
                        v.literal("bend"),
                        v.literal("release"),
                        v.literal("vibrato"),
                        v.literal("mute"),
                        v.literal("harmonic"),
                      ),
                    ),
                    targetPitch: v.optional(v.string()),
                  }),
                ),
                picking: v.optional(
                  v.union(
                    v.literal("down"),
                    v.literal("up"),
                    v.literal("alternate"),
                    v.literal("economy"),
                    v.literal("sweep"),
                  ),
                ),
                accent: v.optional(v.boolean()),
                rest: v.optional(v.boolean()),
              }),
            ),
          }),
        ),
        displayHints: v.optional(
          v.object({
            showPicking: v.optional(v.boolean()),
            showAccents: v.optional(v.boolean()),
            showFingering: v.optional(v.boolean()),
            loopStartBar: v.optional(v.number()),
            loopEndBar: v.optional(v.number()),
          }),
        ),
      }),
      feedbackSchema: v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          type: v.union(
            v.literal("segmented"),
            v.literal("rating"),
            v.literal("number"),
            v.literal("boolean"),
            v.literal("choice"),
          ),
          required: v.boolean(),
          options: v.optional(
            v.array(v.object({ id: v.string(), label: v.string() })),
          ),
          followUpRules: v.optional(
            v.array(
              v.object({ ifOptionId: v.string(), showQuestionId: v.string() }),
            ),
          ),
        }),
      ),
      estimatedMinutes: v.number(),
      isMvp: v.boolean(),
      version: v.number(),
      status: v.union(
        v.literal("active"),
        v.literal("deprecated"),
        v.literal("replaced"),
      ),
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
// Seed mutation
// ---------------------------------------------------------------------------

/**
 * Idempotent exercise seed migration.
 *
 * Resolution strategy for skill slugs:
 *   - Load all skills; build slug → Id map via normalising the skill name.
 *   - Throw if a required slug has no match (prevents silent data corruption).
 *
 * Idempotency strategy per exercise:
 *   - Same slug, same or higher version → skip.
 *   - Same slug, lower version → patch all fields + bump updatedAt.
 *   - Slug not found → insert.
 *
 * Run once: npx convex run exercises:seedExercises
 */
export const seedExercises = internalMutation({
  args: {},
  returns: v.object({
    inserted: v.number(),
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    // Build slug → Id<"skills"> lookup
    const skills = await ctx.db.query("skills").collect();
    const skillBySlug = new Map<string, (typeof skills)[0]["_id"]>();
    for (const skill of skills) {
      skillBySlug.set(nameToSlug(skill.name), skill._id);
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const now = Date.now();

    for (const exercise of ALL_EXERCISES) {
      // Resolve skill slugs to DB IDs
      const primarySkillId = skillBySlug.get(exercise.primarySkillId);
      if (!primarySkillId) {
        throw new Error(
          `seedExercises: no skill found for primarySkillId slug "${exercise.primarySkillId}". ` +
            `Run skills:seedSkills first.`,
        );
      }

      const secondarySkillIds: (typeof skills)[0]["_id"][] = [];
      for (const slug of exercise.secondarySkillIds) {
        const id = skillBySlug.get(slug);
        if (!id) {
          throw new Error(
            `seedExercises: no skill found for secondarySkillId slug "${slug}" ` +
              `(exercise: "${exercise.slug}"). Run skills:seedSkills first.`,
          );
        }
        secondarySkillIds.push(id);
      }

      // Check for existing record
      const existing = await ctx.db
        .query("exercises")
        .withIndex("by_slug", (q) => q.eq("slug", exercise.slug))
        .unique();

      const payload = {
        title: exercise.title,
        slug: exercise.slug,
        description: exercise.description,
        purpose: exercise.purpose,
        targetWeaknesses: exercise.targetWeaknesses,
        minimumCleanStandard: exercise.minimumCleanStandard,
        measurementInstructions: exercise.measurementInstructions,
        coachingNotes: exercise.coachingNotes,
        primarySkillId,
        secondarySkillIds,
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
        feedbackSchema: exercise.feedbackSchema,
        estimatedMinutes: exercise.estimatedMinutes,
        isMvp: exercise.isMvp,
        version: exercise.version,
        status: exercise.status,
        replacedBySlug: exercise.replacedBySlug,
        updatedAt: now,
      };

      if (!existing) {
        await ctx.db.insert("exercises", payload);
        inserted++;
      } else if (existing.version < exercise.version) {
        await ctx.db.patch(existing._id, payload);
        updated++;
      } else {
        skipped++;
      }
    }

    return { inserted, updated, skipped };
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
      primarySkillSlug: v.string(),
      primarySkillName: v.string(),
    }),
  ),
  handler: async (ctx) => {
    await requireSuperUser(ctx);

    const [exercises, skills] = await Promise.all([
      ctx.db.query("exercises").collect(),
      ctx.db.query("skills").collect(),
    ]);

    const skillById = new Map(skills.map((s) => [s._id, s]));

    return exercises
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((ex) => {
        const skill = skillById.get(ex.primarySkillId);
        return {
          _id: ex._id,
          title: ex.title,
          slug: ex.slug,
          purpose: ex.purpose,
          difficultyLevel: ex.difficultyLevel,
          exerciseType: ex.exerciseType,
          primarySkillSlug: skill ? nameToSlug(skill.name) : "unknown",
          primarySkillName: skill?.name ?? "Unknown",
        };
      });
  },
});

/**
 * Upserts a generated exercise candidate for DB testing.
 * Does not write to the git seed library — human paste + review still required.
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
    primarySkillId: v.string(),
    secondarySkillIds: v.array(v.string()),
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

    const { primarySkillId, secondarySkillIds } = await resolveSkillSlugs(
      ctx,
      args.primarySkillId,
      args.secondarySkillIds,
    );

    const now = Date.now();
    const payload = {
      title: args.title,
      slug: args.slug,
      description: args.description,
      purpose: args.purpose,
      targetWeaknesses: args.targetWeaknesses,
      minimumCleanStandard: args.minimumCleanStandard,
      measurementInstructions: args.measurementInstructions,
      coachingNotes: args.coachingNotes,
      primarySkillId,
      secondarySkillIds,
      difficultyLevel: args.difficultyLevel,
      exerciseType: args.exerciseType,
      primaryProgressMetric: args.primaryProgressMetric,
      supportsBpm: args.supportsBpm,
      defaultTargetBpm: args.defaultTargetBpm,
      successCriteria: args.successCriteria,
      commonMistakes: args.commonMistakes,
      progressionRule: args.progressionRule,
      regressionRule: args.regressionRule,
      tabData: args.tabData,
      feedbackSchema: args.feedbackSchema,
      estimatedMinutes: args.estimatedMinutes,
      isMvp: args.isMvp,
      version: args.version,
      status: args.status,
      replacedBySlug: args.replacedBySlug,
      updatedAt: now,
    };

    const existing = await ctx.db
      .query("exercises")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!existing) {
      const id = await ctx.db.insert("exercises", payload);
      return { id, action: "inserted" as const };
    }

    await ctx.db.patch(existing._id, payload);
    return { id: existing._id, action: "updated" as const };
  },
});
