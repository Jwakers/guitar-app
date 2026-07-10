import { v } from "convex/values";
import {
  CORE_SKILLS,
  SUB_SKILLS,
  TRAINING_ATTRIBUTES,
} from "../../src/lib/skills/taxonomy";

export const exerciseTypeValidator = v.union(
  v.literal("warmup"),
  v.literal("primary"),
  v.literal("secondary"),
  v.literal("accessory"),
  v.literal("isolation"),
  v.literal("test"),
);

export const primaryProgressMetricValidator = v.union(
  v.literal("clean_bpm"),
  v.literal("accuracy_score"),
  v.literal("timing_consistency"),
  v.literal("control_score"),
  v.literal("clean_reps"),
  v.literal("endurance_duration"),
  v.literal("noise_control"),
  v.literal("comfort_score"),
);

export const exerciseStatusValidator = v.union(
  v.literal("active"),
  v.literal("deprecated"),
  v.literal("replaced"),
);

export const coreSkillValidator = v.union(
  ...CORE_SKILLS.map((id) => v.literal(id)),
);

export const subSkillValidator = v.union(
  ...SUB_SKILLS.map((id) => v.literal(id)),
);

export const trainingAttributeValidator = v.union(
  ...TRAINING_ATTRIBUTES.map((id) => v.literal(id)),
);

export const patternTypeValidator = v.union(
  v.literal("micro_drill"),
  v.literal("standard_loop"),
  v.literal("musical_sequence"),
  v.literal("benchmark"),
);

export const tabDataValidator = v.object({
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
              articulationFromPrevious: v.optional(
                v.union(
                  v.literal("picked"),
                  v.literal("hammer_on"),
                  v.literal("pull_off"),
                  v.literal("slide"),
                ),
              ),
              technique: v.optional(
                v.union(
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

export const feedbackSchemaValidator = v.array(
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

/** ExerciseSeed-shaped payload for authoring and migration (no Convex metadata). */
export const exerciseSeedValidator = v.object({
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
});
