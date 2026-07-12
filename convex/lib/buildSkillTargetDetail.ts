import type { Id } from "../_generated/dataModel";
import {
  labelFromSkillTargetKey,
  type ProgressObjectiveResult,
  type ProgressSkillStatus,
  type ProgressTrainingVerdict,
  RELIABLE_PERFORMANCE_LIMIT,
  toPerformanceSnapshot,
} from "./buildProgressOverview";

export const SKILL_TARGET_RECENT_LIMIT = 10;
export const SKILL_TARGET_PB_LIMIT = 20;

export type SkillTargetLogInput = {
  exerciseId: Id<"exercises">;
  date: number;
  trainingVerdict: ProgressTrainingVerdict;
  objectiveResult: ProgressObjectiveResult;
  isPersonalBest: boolean;
};

export type SkillTargetExerciseStateInput = {
  exerciseId: Id<"exercises">;
  reliablePerformance?: {
    metric: string;
    value: number;
    unit: string;
    calculatedAt?: number;
  };
  peakPerformance?: {
    metric: string;
    value: number;
    unit: string;
    achievedAt?: number;
  };
  lastPractisedAt?: number;
  updatedAt: number;
};

export type SkillTargetRatingInput = {
  skillTargetKey: string;
  rating: number;
  status: ProgressSkillStatus;
  confidence: number;
  trend7Day?: number;
  trend30Day?: number;
  lastTrainedAt?: number;
};

export type BuildSkillTargetDetailInput = {
  skillTargetKey: string;
  rating: SkillTargetRatingInput | null;
  logs: SkillTargetLogInput[];
  exerciseStates: SkillTargetExerciseStateInput[];
  exerciseTitles: Record<string, string>;
};

export type SkillTargetDetail = {
  skillTargetKey: string;
  label: string;
  rating: number | null;
  status: ProgressSkillStatus | null;
  confidence: number | null;
  trend7Day?: number;
  trend30Day?: number;
  lastTrainedAt?: number;
  recentActivity: Array<{
    exerciseId: Id<"exercises">;
    exerciseTitle: string;
    date: number;
    trainingVerdict: ProgressTrainingVerdict;
    objectiveResult: ProgressObjectiveResult;
    isPersonalBest: boolean;
  }>;
  personalBests: Array<{
    exerciseId: Id<"exercises">;
    exerciseTitle: string;
    date: number;
    trainingVerdict: ProgressTrainingVerdict;
    objectiveResult: ProgressObjectiveResult;
  }>;
  reliablePerformance: Array<{
    exerciseId: Id<"exercises">;
    exerciseTitle: string;
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
    lastPractisedAt?: number;
  }>;
};

function exerciseTitle(
  exerciseId: Id<"exercises">,
  exerciseTitles: Record<string, string>,
): string {
  return exerciseTitles[exerciseId] ?? "Unknown exercise";
}

export function buildSkillTargetDetail(
  input: BuildSkillTargetDetailInput,
): SkillTargetDetail {
  const { skillTargetKey, rating, logs, exerciseStates, exerciseTitles } =
    input;

  const recentActivity = [...logs]
    .sort((a, b) => b.date - a.date)
    .slice(0, SKILL_TARGET_RECENT_LIMIT)
    .map((log) => ({
      exerciseId: log.exerciseId,
      exerciseTitle: exerciseTitle(log.exerciseId, exerciseTitles),
      date: log.date,
      trainingVerdict: log.trainingVerdict,
      objectiveResult: log.objectiveResult,
      isPersonalBest: log.isPersonalBest,
    }));

  const personalBests = logs
    .filter((log) => log.isPersonalBest)
    .sort((a, b) => b.date - a.date)
    .slice(0, SKILL_TARGET_PB_LIMIT)
    .map((log) => ({
      exerciseId: log.exerciseId,
      exerciseTitle: exerciseTitle(log.exerciseId, exerciseTitles),
      date: log.date,
      trainingVerdict: log.trainingVerdict,
      objectiveResult: log.objectiveResult,
    }));

  const practisedExerciseIds = new Set(logs.map((log) => log.exerciseId));

  const reliablePerformance = exerciseStates
    .filter(
      (state) =>
        practisedExerciseIds.has(state.exerciseId) &&
        (state.reliablePerformance !== undefined ||
          state.peakPerformance !== undefined),
    )
    .sort((a, b) => {
      const aTime = a.lastPractisedAt ?? a.updatedAt;
      const bTime = b.lastPractisedAt ?? b.updatedAt;
      return bTime - aTime;
    })
    .slice(0, RELIABLE_PERFORMANCE_LIMIT)
    .map((state) => ({
      exerciseId: state.exerciseId,
      exerciseTitle: exerciseTitle(state.exerciseId, exerciseTitles),
      reliablePerformance: toPerformanceSnapshot(state.reliablePerformance),
      peakPerformance: toPerformanceSnapshot(state.peakPerformance),
      lastPractisedAt: state.lastPractisedAt,
    }));

  return {
    skillTargetKey,
    label: labelFromSkillTargetKey(skillTargetKey),
    rating: rating?.rating ?? null,
    status: rating?.status ?? null,
    confidence: rating?.confidence ?? null,
    trend7Day: rating?.trend7Day,
    trend30Day: rating?.trend30Day,
    lastTrainedAt: rating?.lastTrainedAt,
    recentActivity,
    personalBests,
    reliablePerformance,
  };
}
