import type { TrainingVerdict } from "./reliable-performance";

export const SKILL_RATING_WINDOW = 10;
export const MAX_RATING_DELTA = 6;
export const CONFIDENCE_BASELINE = 0.5;
export const MAINTENANCE_INACTIVITY_DAYS = 21;
const BLEND_PREVIOUS = 0.65;
const BLEND_WINDOW = 0.35;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const VERDICT_BASE_SCORE: Record<TrainingVerdict, number> = {
  nailed_it: 85,
  nearly_there: 65,
  needs_work: 50,
};

export type SkillRatingLogSnapshot = {
  date: number;
  trainingVerdict: TrainingVerdict;
  objectiveResult: {
    metric: string;
    targetValue?: number;
    actualValue?: number;
  };
};

export type SkillRatingStatus =
  | "weak"
  | "developing"
  | "stable"
  | "strong"
  | "maintenance";

export type RecomputedSkillRating = {
  rating: number;
  status: SkillRatingStatus;
  confidence: number;
  trend7Day: number;
  trend30Day: number;
  lastTrainedAt?: number;
};

export function logPerformanceScore(log: SkillRatingLogSnapshot): number {
  let score = VERDICT_BASE_SCORE[log.trainingVerdict];
  const { metric, targetValue, actualValue } = log.objectiveResult;

  if (
    metric === "clean_bpm" &&
    targetValue !== undefined &&
    targetValue > 0 &&
    actualValue !== undefined
  ) {
    const ratio = Math.min(1.2, actualValue / targetValue);
    score = score * 0.6 + ratio * 100 * 0.4;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function weightedWindowScore(logs: SkillRatingLogSnapshot[]): number {
  const sorted = [...logs]
    .sort((a, b) => b.date - a.date)
    .slice(0, SKILL_RATING_WINDOW);

  if (sorted.length === 0) {
    return 0;
  }

  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 0; i < sorted.length; i++) {
    const weight = 1 / (1 + i * 0.15);
    weightedSum += logPerformanceScore(sorted[i]!) * weight;
    weightTotal += weight;
  }

  return weightedSum / weightTotal;
}

export function computeRatingFromLogs(
  logs: SkillRatingLogSnapshot[],
  previousRating: number,
): number {
  if (logs.length === 0) {
    return previousRating;
  }

  const windowScore = weightedWindowScore(logs);
  const blended = BLEND_PREVIOUS * previousRating + BLEND_WINDOW * windowScore;

  return Math.max(
    previousRating - MAX_RATING_DELTA,
    Math.min(previousRating + MAX_RATING_DELTA, Math.round(blended)),
  );
}

export function deriveStatus(
  rating: number,
  options?: { lastTrainedAt?: number; now?: number },
): SkillRatingStatus {
  let status: SkillRatingStatus;
  if (rating <= 40) status = "weak";
  else if (rating <= 55) status = "developing";
  else if (rating <= 70) status = "stable";
  else status = "strong";

  const { lastTrainedAt, now } = options ?? {};
  if (
    status === "strong" &&
    lastTrainedAt !== undefined &&
    now !== undefined &&
    now - lastTrainedAt >= MAINTENANCE_INACTIVITY_DAYS * MS_PER_DAY
  ) {
    return "maintenance";
  }

  return status;
}

export function deriveConfidence(logCount: number): number {
  return Math.min(0.9, CONFIDENCE_BASELINE + logCount * 0.03);
}

export function computeTrend(
  logs: SkillRatingLogSnapshot[],
  previousRating: number,
  now: number,
  days: number,
): number {
  const cutoff = now - days * MS_PER_DAY;
  const olderLogs = logs.filter((log) => log.date < cutoff);

  if (olderLogs.length === 0) {
    return 0;
  }

  const currentRating = computeRatingFromLogs(logs, previousRating);
  const olderRating = computeRatingFromLogs(olderLogs, previousRating);

  return currentRating - olderRating;
}

export function recomputeSkillRating(input: {
  logs: SkillRatingLogSnapshot[];
  previousRating: number;
  now: number;
}): RecomputedSkillRating {
  const { logs, previousRating, now } = input;
  const rating = computeRatingFromLogs(logs, previousRating);

  const lastTrainedAt =
    logs.length > 0 ? Math.max(...logs.map((log) => log.date)) : undefined;

  return {
    rating,
    status: deriveStatus(rating, { lastTrainedAt, now }),
    confidence: deriveConfidence(logs.length),
    trend7Day: computeTrend(logs, previousRating, now, 7),
    trend30Day: computeTrend(logs, previousRating, now, 30),
    lastTrainedAt,
  };
}
