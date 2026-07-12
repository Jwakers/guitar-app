import type { Id } from "../_generated/dataModel";
import {
  CORE_SKILL_DEFINITIONS,
  coreSkillLabel,
  isCoreSkill,
  isSubSkill,
  subSkillLabel,
  SUB_SKILL_DEFINITIONS,
} from "../../src/lib/skills/taxonomy";
import { formatDateInTimezone } from "../../src/lib/training-engine/dates";

export const RECENT_ACTIVITY_LIMIT = 10;
export const RELIABLE_PERFORMANCE_LIMIT = 10;
export const PERSONAL_BESTS_LIMIT = 20;

export type ProgressObjectiveResult = {
  metric: string;
  targetValue?: number;
  actualValue?: number;
  unit?: string;
};

export type ProgressTrainingVerdict =
  | "nailed_it"
  | "nearly_there"
  | "needs_work";

export type ProgressLogInput = {
  exerciseId: Id<"exercises">;
  date: number;
  trainingVerdict: ProgressTrainingVerdict;
  objectiveResult: ProgressObjectiveResult;
  isPersonalBest: boolean;
};

export type PerformanceSnapshot = {
  metric: string;
  value: number;
  unit: string;
};

export type ProgressExerciseStateInput = {
  exerciseId: Id<"exercises">;
  reliablePerformance?: PerformanceSnapshot & { calculatedAt?: number };
  peakPerformance?: PerformanceSnapshot & { achievedAt?: number };
  lastPractisedAt?: number;
  updatedAt: number;
};

export type ProgressSkillStatus =
  | "weak"
  | "developing"
  | "stable"
  | "strong"
  | "maintenance";

export type ProgressSkillRatingInput = {
  skillTargetKey: string;
  rating: number;
  status: ProgressSkillStatus;
  trend7Day?: number;
  trend30Day?: number;
};

export type ProgressSessionInput = {
  date: string;
  estimatedMinutes: number;
};

export type BuildProgressOverviewInput = {
  weekStartDate: string;
  todayDate: string;
  timezone: string;
  skillRatings: ProgressSkillRatingInput[];
  logs: ProgressLogInput[];
  exerciseStates: ProgressExerciseStateInput[];
  completedSessionsThisWeek: ProgressSessionInput[];
  exerciseTitles: Record<string, string>;
};

export type ProgressOverview = {
  weekStartDate: string;
  todayDate: string;
  sessionRollup: {
    sessionsCompleted: number;
    totalMinutes: number;
    personalBestsThisWeek: number;
  };
  skills: Array<{
    skillTargetKey: string;
    label: string;
    rating: number;
    status: ProgressSkillStatus;
    trend7Day?: number;
    trend30Day?: number;
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
  recentActivity: Array<{
    exerciseId: Id<"exercises">;
    exerciseTitle: string;
    date: number;
    trainingVerdict: ProgressTrainingVerdict;
    objectiveResult: ProgressObjectiveResult;
    isPersonalBest: boolean;
  }>;
};

export function labelFromSkillTargetKey(skillTargetKey: string): string {
  const colon = skillTargetKey.indexOf(":");
  if (colon === -1) return skillTargetKey;

  const kind = skillTargetKey.slice(0, colon);
  const id = skillTargetKey.slice(colon + 1);

  if (kind === "core" && isCoreSkill(id)) {
    return coreSkillLabel(id);
  }
  if (kind === "sub" && isSubSkill(id)) {
    return subSkillLabel(id);
  }
  return id.replace(/_/g, " ");
}

function skillSortOrder(skillTargetKey: string): number {
  const colon = skillTargetKey.indexOf(":");
  if (colon === -1) return 999;

  const kind = skillTargetKey.slice(0, colon);
  const id = skillTargetKey.slice(colon + 1);

  if (kind === "core" && isCoreSkill(id)) {
    return CORE_SKILL_DEFINITIONS[id].sortOrder;
  }
  if (kind === "sub" && isSubSkill(id)) {
    return 100 + SUB_SKILL_DEFINITIONS[id].sortOrder;
  }
  return 999;
}

function exerciseTitle(
  exerciseId: Id<"exercises">,
  exerciseTitles: Record<string, string>,
): string {
  return exerciseTitles[exerciseId] ?? "Unknown exercise";
}

export function toPerformanceSnapshot(
  performance?: PerformanceSnapshot & {
    calculatedAt?: number;
    achievedAt?: number;
  },
): PerformanceSnapshot | undefined {
  if (!performance) return undefined;
  return {
    metric: performance.metric,
    value: performance.value,
    unit: performance.unit,
  };
}

function isDateInWeek(
  dateMs: number,
  weekStartDate: string,
  todayDate: string,
  timezone: string,
): boolean {
  const dateString = formatDateInTimezone(dateMs, timezone);
  return dateString >= weekStartDate && dateString <= todayDate;
}

export function buildProgressOverview(
  input: BuildProgressOverviewInput,
): ProgressOverview {
  const {
    weekStartDate,
    todayDate,
    timezone,
    skillRatings,
    logs,
    exerciseStates,
    completedSessionsThisWeek,
    exerciseTitles,
  } = input;

  const personalBests = logs
    .filter((log) => log.isPersonalBest)
    .sort((a, b) => b.date - a.date)
    .slice(0, PERSONAL_BESTS_LIMIT)
    .map((log) => ({
      exerciseId: log.exerciseId,
      exerciseTitle: exerciseTitle(log.exerciseId, exerciseTitles),
      date: log.date,
      trainingVerdict: log.trainingVerdict,
      objectiveResult: log.objectiveResult,
    }));

  const personalBestsThisWeek = logs.filter(
    (log) =>
      log.isPersonalBest &&
      isDateInWeek(log.date, weekStartDate, todayDate, timezone),
  ).length;

  const recentActivity = [...logs]
    .sort((a, b) => b.date - a.date)
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((log) => ({
      exerciseId: log.exerciseId,
      exerciseTitle: exerciseTitle(log.exerciseId, exerciseTitles),
      date: log.date,
      trainingVerdict: log.trainingVerdict,
      objectiveResult: log.objectiveResult,
      isPersonalBest: log.isPersonalBest,
    }));

  const reliablePerformance = exerciseStates
    .filter(
      (state) =>
        state.reliablePerformance !== undefined ||
        state.peakPerformance !== undefined,
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

  const skills = [...skillRatings]
    .map((rating) => ({
      skillTargetKey: rating.skillTargetKey,
      label: labelFromSkillTargetKey(rating.skillTargetKey),
      rating: rating.rating,
      status: rating.status,
      trend7Day: rating.trend7Day,
      trend30Day: rating.trend30Day,
    }))
    .sort(
      (a, b) =>
        skillSortOrder(a.skillTargetKey) - skillSortOrder(b.skillTargetKey),
    );

  const totalMinutes = completedSessionsThisWeek.reduce(
    (sum, session) => sum + session.estimatedMinutes,
    0,
  );

  return {
    weekStartDate,
    todayDate,
    sessionRollup: {
      sessionsCompleted: completedSessionsThisWeek.length,
      totalMinutes,
      personalBestsThisWeek,
    },
    skills,
    personalBests,
    reliablePerformance,
    recentActivity,
  };
}
