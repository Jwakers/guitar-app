import { z } from "zod";

const tabNoteSchema = z.object({
  string: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  fret: z.number().int().min(0).max(24),
  finger: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
    .nullable()
    .optional(),
  technique: z
    .enum([
      "picked",
      "hammer_on",
      "pull_off",
      "slide",
      "bend",
      "release",
      "vibrato",
      "mute",
      "harmonic",
    ])
    .nullable()
    .optional(),
  targetPitch: z.string().nullable().optional(),
});

const tabBeatSchema = z.object({
  duration: z.enum(["whole", "half", "quarter", "eighth", "sixteenth"]),
  notes: z.array(tabNoteSchema),
  tuplet: z.number().int().min(2).nullable().optional(),
  picking: z
    .enum(["down", "up", "alternate", "economy", "sweep"])
    .nullable()
    .optional(),
  accent: z.boolean().nullable().optional(),
  rest: z.boolean().nullable().optional(),
});

const tabDataSchema = z.object({
  tuning: z.array(z.string()).length(6),
  capo: z.number().int().min(0).nullable().optional(),
  tempo: z.number().positive(),
  timeSignature: z.object({
    beats: z.number().int().positive(),
    beatValue: z.number().int().positive(),
  }),
  bars: z
    .array(
      z.object({
        beats: z.array(tabBeatSchema).min(1),
      }),
    )
    .min(1),
  displayHints: z
    .object({
      showPicking: z.boolean().nullable().optional(),
      showAccents: z.boolean().nullable().optional(),
      showFingering: z.boolean().nullable().optional(),
      loopStartBar: z.number().int().min(0).nullable().optional(),
      loopEndBar: z.number().int().min(0).nullable().optional(),
    })
    .nullable()
    .optional(),
});

const feedbackOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const feedbackQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["segmented", "rating", "number", "boolean", "choice"]),
  required: z.boolean(),
  options: z.array(feedbackOptionSchema).nullable().optional(),
  followUpRules: z
    .array(
      z.object({
        ifOptionId: z.string().min(1),
        showQuestionId: z.string().min(1),
      }),
    )
    .nullable()
    .optional(),
});

export const exerciseSeedZodSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  description: z.string().min(1),
  purpose: z.string().min(1),
  targetWeaknesses: z.array(z.string().min(1)).min(1),
  minimumCleanStandard: z.string().min(1),
  measurementInstructions: z.string().min(1),
  coachingNotes: z.array(z.string().min(1)).min(1),
  primarySkillId: z.string().min(1),
  secondarySkillIds: z.array(z.string()),
  difficultyLevel: z.number().int().min(1).max(10),
  exerciseType: z.enum([
    "warmup",
    "primary",
    "secondary",
    "accessory",
    "isolation",
    "test",
  ]),
  primaryProgressMetric: z.enum([
    "clean_bpm",
    "accuracy_score",
    "timing_consistency",
    "control_score",
    "clean_reps",
    "endurance_duration",
    "noise_control",
    "comfort_score",
  ]),
  supportsBpm: z.boolean(),
  defaultTargetBpm: z.number().positive().nullable().optional(),
  successCriteria: z.array(z.string().min(1)).min(1),
  commonMistakes: z.array(z.string().min(1)).min(1),
  progressionRule: z.string().min(1),
  regressionRule: z.string().min(1),
  tabData: tabDataSchema,
  feedbackSchema: z.array(feedbackQuestionSchema).min(1),
  estimatedMinutes: z.number().positive(),
  isMvp: z.boolean(),
  version: z.number().int().min(1),
  status: z.enum(["active", "deprecated", "replaced"]),
  replacedBySlug: z.string().min(1).nullable().optional(),
});

export const qualityScoreZodSchema = z.object({
  clearTrainingPurpose: z.number().int().min(0).max(5),
  measurableOutcome: z.number().int().min(0).max(5),
  mechanicalUsefulness: z.number().int().min(0).max(5),
  appropriateDifficulty: z.number().int().min(0).max(5),
  progressionRegressionQuality: z.number().int().min(0).max(5),
  coachingQuality: z.number().int().min(0).max(5),
  total: z.number().int().min(0).max(30),
});

export const drillGeneratorOutputSchema = z.object({
  exercise: exerciseSeedZodSchema,
  briefMarkdown: z.string().min(1),
  qualityScore: qualityScoreZodSchema,
  redFlags: z.array(z.string()),
  missingFields: z.array(z.string()),
  reviewerChecklist: z.array(z.string()).min(1),
  refinePrompt: z.string().min(1),
});

export type DrillGeneratorOutput = z.infer<typeof drillGeneratorOutputSchema>;
export type QualityScore = z.infer<typeof qualityScoreZodSchema>;

/**
 * Strip nullish optional fields so validateExercise / Convex payloads stay clean.
 */
export function normalizeExerciseSeed(
  raw: z.infer<typeof exerciseSeedZodSchema>,
) {
  const notes = (beat: z.infer<typeof tabBeatSchema>) => ({
    duration: beat.duration,
    notes: beat.notes.map((n) => ({
      string: n.string,
      fret: n.fret,
      ...(n.finger != null ? { finger: n.finger } : {}),
      ...(n.technique != null ? { technique: n.technique } : {}),
      ...(n.targetPitch != null ? { targetPitch: n.targetPitch } : {}),
    })),
    ...(beat.tuplet != null ? { tuplet: beat.tuplet } : {}),
    ...(beat.picking != null ? { picking: beat.picking } : {}),
    ...(beat.accent != null ? { accent: beat.accent } : {}),
    ...(beat.rest != null ? { rest: beat.rest } : {}),
  });

  const displayHints = raw.tabData.displayHints;
  const cleanedHints =
    displayHints == null
      ? undefined
      : {
          ...(displayHints.showPicking != null
            ? { showPicking: displayHints.showPicking }
            : {}),
          ...(displayHints.showAccents != null
            ? { showAccents: displayHints.showAccents }
            : {}),
          ...(displayHints.showFingering != null
            ? { showFingering: displayHints.showFingering }
            : {}),
          ...(displayHints.loopStartBar != null
            ? { loopStartBar: displayHints.loopStartBar }
            : {}),
          ...(displayHints.loopEndBar != null
            ? { loopEndBar: displayHints.loopEndBar }
            : {}),
        };

  return {
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    purpose: raw.purpose,
    targetWeaknesses: raw.targetWeaknesses,
    minimumCleanStandard: raw.minimumCleanStandard,
    measurementInstructions: raw.measurementInstructions,
    coachingNotes: raw.coachingNotes,
    primarySkillId: raw.primarySkillId,
    secondarySkillIds: raw.secondarySkillIds,
    difficultyLevel: raw.difficultyLevel,
    exerciseType: raw.exerciseType,
    primaryProgressMetric: raw.primaryProgressMetric,
    supportsBpm: raw.supportsBpm,
    ...(raw.defaultTargetBpm != null
      ? { defaultTargetBpm: raw.defaultTargetBpm }
      : {}),
    successCriteria: raw.successCriteria,
    commonMistakes: raw.commonMistakes,
    progressionRule: raw.progressionRule,
    regressionRule: raw.regressionRule,
    tabData: {
      tuning: raw.tabData.tuning,
      ...(raw.tabData.capo != null ? { capo: raw.tabData.capo } : {}),
      tempo: raw.tabData.tempo,
      timeSignature: raw.tabData.timeSignature,
      bars: raw.tabData.bars.map((bar) => ({
        beats: bar.beats.map(notes),
      })),
      ...(cleanedHints && Object.keys(cleanedHints).length > 0
        ? { displayHints: cleanedHints }
        : {}),
    },
    feedbackSchema: raw.feedbackSchema.map((q) => ({
      id: q.id,
      label: q.label,
      type: q.type,
      required: q.required,
      ...(q.options != null ? { options: q.options } : {}),
      ...(q.followUpRules != null ? { followUpRules: q.followUpRules } : {}),
    })),
    estimatedMinutes: raw.estimatedMinutes,
    isMvp: raw.isMvp,
    version: raw.version,
    status: raw.status,
    ...(raw.replacedBySlug != null
      ? { replacedBySlug: raw.replacedBySlug }
      : {}),
  };
}
