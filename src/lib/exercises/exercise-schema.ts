import type { FeedbackQuestion } from "./feedback-schema";
import type { TabData } from "../tabs/internal-schema";
import type {
  CoreSkill,
  SubSkill,
  TrainingAttribute,
} from "../skills/taxonomy";

export type ExerciseType =
  | "warmup"
  | "primary"
  | "secondary"
  | "accessory"
  | "isolation"
  | "test";

export type PrimaryProgressMetric =
  | "clean_bpm"
  | "accuracy_score"
  | "timing_consistency"
  | "control_score"
  | "clean_reps"
  | "endurance_duration"
  | "noise_control"
  | "comfort_score";

export type ExerciseStatus = "active" | "deprecated" | "replaced";

export const PATTERN_TYPES = [
  "micro_drill",
  "standard_loop",
  "musical_sequence",
  "benchmark",
] as const;

export type PatternType = (typeof PATTERN_TYPES)[number];

/**
 * Authoring and migration payload shape for exercises.
 *
 * Differences from the persisted Convex `exercises` table:
 * - `updatedAt` is omitted; it is stamped at insertion time.
 *
 * Exercises are not stored as TypeScript files in the repo. They are authored
 * in dev Convex (drill generator) and promoted via `pnpm migrate:exercises`.
 */
export type ExerciseSeed = {
  title: string;
  slug: string;
  description: string;

  purpose: string;
  targetWeaknesses: string[];
  minimumCleanStandard: string;
  measurementInstructions: string;
  coachingNotes: string[];

  coreSkillId: CoreSkill;
  subSkillIds: SubSkill[];
  trainingAttributes: TrainingAttribute[];

  difficultyLevel: number;
  exerciseType: ExerciseType;

  primaryProgressMetric: PrimaryProgressMetric;
  supportsBpm: boolean;
  defaultTargetBpm?: number;

  successCriteria: string[];
  commonMistakes: string[];
  progressionRule: string;
  regressionRule: string;

  tabData: TabData;
  patternType: PatternType;
  microDrillJustification?: string;

  feedbackSchema: FeedbackQuestion[];

  estimatedMinutes: number;
  isMvp: boolean;

  version: number;
  status: ExerciseStatus;
  replacedBySlug?: string;
};
