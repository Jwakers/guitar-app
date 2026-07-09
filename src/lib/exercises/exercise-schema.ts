import type { FeedbackQuestion } from "./feedback-schema";
import type { TabData } from "../tabs/internal-schema";

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

/**
 * Shape used in seed files.
 *
 * Differences from the Convex `exercises` table:
 * - `primarySkillId` / `secondarySkillIds` are string slugs, not `Id<"skills">`.
 *   They are resolved to DB IDs during the seeding mutation.
 * - `updatedAt` is omitted; it is stamped at insertion time.
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

  primarySkillId: string;
  secondarySkillIds: string[];

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

  feedbackSchema: FeedbackQuestion[];

  estimatedMinutes: number;
  isMvp: boolean;

  version: number;
  status: ExerciseStatus;
  replacedBySlug?: string;
};
