import type { Id } from "../../../convex/_generated/dataModel";
import type {
  ExerciseType,
  PrimaryProgressMetric,
} from "../exercises/exercise-schema";
import type { CoreSkill, SkillTarget, SubSkill } from "../skills/taxonomy";

export type BlockType = "foundation" | "weakness_focus";

export type SessionType =
  | "standard"
  | "light"
  | "test"
  | "deload"
  | "maintenance";

export type SessionSlotType =
  | "warmup"
  | "primary"
  | "secondary"
  | "accessory"
  | "isolation"
  | "test"
  | "maintenance";

export type SessionIntensity = "low" | "moderate" | "high";

export type SessionReasonCode =
  | "USER_GOAL"
  | "WEAKNESS_PRIORITY"
  | "BLOCK_FOCUS"
  | "MAINTENANCE_DUE"
  | "RECENT_MISSED_SESSION"
  | "HIGH_RECENT_WORKLOAD"
  | "PROGRESSION_READY"
  | "DELOAD_WEEK"
  | "CONSISTENCY_RECOVERY";

export type ExerciseSelectionReasonCode =
  | "GOAL_MATCH"
  | "WEAKNESS_MATCH"
  | "BLOCK_FOCUS"
  | "SLOT_TYPE_MATCH"
  | "READINESS"
  | "PROGRESSION"
  | "MAINTENANCE"
  | "VARIETY"
  | "DEFAULT_FALLBACK";

export type SessionPurpose = {
  primaryFocus: SkillTarget;
  secondaryFocuses: SkillTarget[];
  sessionType: SessionType;
  intensity: SessionIntensity;
  estimatedMinutes: number;
  reasonCodes: SessionReasonCode[];
};

export type SessionSlot = {
  slotType: SessionSlotType;
  targetCoreSkillIds: CoreSkill[];
  targetSubSkillIds: SubSkill[];
  minDifficulty: number;
  maxDifficulty: number;
  estimatedMinutes: number;
  requiredMetricType?: PrimaryProgressMetric;
};

export type ExerciseSelectionScoreBreakdown = {
  goalMatch: number;
  weaknessMatch: number;
  blockRelevance: number;
  readiness: number;
  progressionNeed: number;
  maintenanceNeed: number;
  variety: number;
  penalties: number;
  total: number;
};

/** Minimal exercise fields required by the selection engine. */
export type ExerciseCandidate = {
  _id: Id<"exercises">;
  title: string;
  slug: string;
  coreSkillId: CoreSkill;
  subSkillIds: SubSkill[];
  exerciseType: ExerciseType;
  difficultyLevel: number;
  primaryProgressMetric: PrimaryProgressMetric;
  supportsBpm: boolean;
  defaultTargetBpm?: number;
  estimatedMinutes: number;
  isMvp: boolean;
  status: "active" | "deprecated" | "replaced";
};

export type SkillRatingSnapshot = {
  skillTarget: SkillTarget;
  rating: number;
  status: "weak" | "developing" | "stable" | "strong" | "maintenance";
};

export type UserProfileSnapshot = {
  primaryGoals: string[];
  focusCoreSkillIds: CoreSkill[];
  focusSubSkillIds: SubSkill[];
  availableDays: string[];
  sessionsPerWeek?: number;
  defaultSessionLengthMinutes: number;
  preferredIntensity: string;
};

export type BlockSnapshot = {
  blockType: BlockType;
  title: string;
  primaryGoal: string;
  focusCoreSkillIds: CoreSkill[];
  focusSubSkillIds: SubSkill[];
  supportCoreSkillIds: CoreSkill[];
  supportSubSkillIds: SubSkill[];
  intensity: string;
  currentWeek: number;
};

export type SessionExerciseItem = {
  exerciseId: Id<"exercises">;
  slotType: SessionSlotType;
  order: number;
  targetMetric: PrimaryProgressMetric;
  targetValue?: number;
  targetBpm?: number;
  sets?: number;
  durationMinutes: number;
  status: "pending";
  reasonCodes: ExerciseSelectionReasonCode[];
  scoreBreakdown: ExerciseSelectionScoreBreakdown;
};

export type BuiltSession = {
  title: string;
  goal: string;
  estimatedMinutes: number;
  sessionType: SessionType;
  exerciseItems: SessionExerciseItem[];
};

export type UserExerciseStateSnapshot = {
  exerciseId: Id<"exercises">;
  reliablePerformance?: {
    metric: string;
    value: number;
    unit: string;
  };
  peakPerformance?: {
    metric: string;
    value: number;
    unit: string;
  };
  recentVerdicts: Array<"nailed_it" | "nearly_there" | "needs_work">;
  consecutiveNailed: number;
  consecutiveNeedsWork: number;
  progressionReady: boolean;
  regressionRecommended: boolean;
};

export type InitialBlockSelection = {
  blockType: BlockType;
  title: string;
  primaryGoal: string;
  durationWeeks: number;
  focusCoreSkillIds: CoreSkill[];
  focusSubSkillIds: SubSkill[];
  supportCoreSkillIds: CoreSkill[];
  supportSubSkillIds: SubSkill[];
  intensity: string;
  deloadWeek?: number;
};
