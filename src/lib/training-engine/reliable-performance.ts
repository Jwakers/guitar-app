import type { SessionType } from "./types";

export const BPM_PROGRESSION_STEP = 5;
export const BPM_REGRESSION_STEP = 5;
export const DELOAD_INTENSITY_FACTOR = 0.85;
export const RECENT_VERDICTS_WINDOW = 5;
export const RELIABLE_LOG_WINDOW = 5;
export const MIN_BPM = 20;
export const MAX_BPM = 300;

export type TrainingVerdict = "nailed_it" | "nearly_there" | "needs_work";

export type ExerciseLogSnapshot = {
  date: number;
  trainingVerdict: TrainingVerdict;
  objectiveResult: {
    metric: string;
    actualValue?: number;
  };
};

export type PerformanceMetric = {
  metric: string;
  value: number;
  unit: string;
  calculatedAt?: number;
  achievedAt?: number;
};

export type ProgressionSignalInput = {
  recentVerdicts: TrainingVerdict[];
  consecutiveNailed: number;
  consecutiveNeedsWork: number;
};

export type ProgressionSignal = {
  progressionReady: boolean;
  regressionRecommended: boolean;
};

export type ComputeNextTargetBpmInput = {
  reliableBpm: number;
  sessionType: SessionType;
  progressionReady: boolean;
  regressionRecommended: boolean;
};

export type RecomputedExerciseState = {
  reliablePerformance?: PerformanceMetric;
  peakPerformance?: PerformanceMetric;
  recentVerdicts: TrainingVerdict[];
  consecutiveNailed: number;
  consecutiveNeedsWork: number;
  progressionReady: boolean;
  regressionRecommended: boolean;
};

function clampBpm(bpm: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

function cleanBpmFromLog(log: ExerciseLogSnapshot): number | undefined {
  if (log.objectiveResult.metric !== "clean_bpm") {
    return undefined;
  }
  const value = log.objectiveResult.actualValue;
  return value !== undefined ? value : undefined;
}

function isReliableVerdict(verdict: TrainingVerdict): boolean {
  return verdict === "nailed_it" || verdict === "nearly_there";
}

export function deriveReliableBpm(logs: ExerciseLogSnapshot[]): number | undefined {
  const sorted = [...logs].sort((a, b) => b.date - a.date);
  const reliableValues = sorted
    .filter((log) => isReliableVerdict(log.trainingVerdict))
    .map(cleanBpmFromLog)
    .filter((value): value is number => value !== undefined)
    .slice(0, RELIABLE_LOG_WINDOW);

  if (reliableValues.length === 0) {
    return undefined;
  }

  const sortedValues = [...reliableValues].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 0) {
    return Math.round((sortedValues[mid - 1]! + sortedValues[mid]!) / 2);
  }
  return sortedValues[mid]!;
}

export function derivePeakBpm(logs: ExerciseLogSnapshot[]): number | undefined {
  let peak: number | undefined;
  for (const log of logs) {
    const bpm = cleanBpmFromLog(log);
    if (bpm !== undefined && (peak === undefined || bpm > peak)) {
      peak = bpm;
    }
  }
  return peak;
}

export function deriveRecentVerdicts(
  logs: ExerciseLogSnapshot[],
): TrainingVerdict[] {
  return [...logs]
    .sort((a, b) => b.date - a.date)
    .slice(0, RECENT_VERDICTS_WINDOW)
    .map((log) => log.trainingVerdict);
}

export function countConsecutiveVerdict(
  verdicts: TrainingVerdict[],
  target: TrainingVerdict,
): number {
  let count = 0;
  for (const verdict of verdicts) {
    if (verdict !== target) break;
    count++;
  }
  return count;
}

export function evaluateProgressionSignal(
  input: ProgressionSignalInput,
): ProgressionSignal {
  return {
    progressionReady: input.consecutiveNailed >= 1,
    regressionRecommended: input.consecutiveNeedsWork >= 1,
  };
}

export function computeNextTargetBpm(input: ComputeNextTargetBpmInput): number {
  let target = input.reliableBpm;

  if (input.regressionRecommended) {
    target -= BPM_REGRESSION_STEP;
  } else if (input.progressionReady) {
    target += BPM_PROGRESSION_STEP;
  }

  if (input.sessionType === "light" || input.sessionType === "deload") {
    target = Math.round(target * DELOAD_INTENSITY_FACTOR);
  }

  return clampBpm(target);
}

export function recomputeExerciseStateFromLogs(
  logs: ExerciseLogSnapshot[],
  now: number,
): RecomputedExerciseState {
  const reliableBpm = deriveReliableBpm(logs);
  const peakBpm = derivePeakBpm(logs);
  const recentVerdicts = deriveRecentVerdicts(logs);
  const consecutiveNailed = countConsecutiveVerdict(recentVerdicts, "nailed_it");
  const consecutiveNeedsWork = countConsecutiveVerdict(
    recentVerdicts,
    "needs_work",
  );
  const { progressionReady, regressionRecommended } = evaluateProgressionSignal({
    recentVerdicts,
    consecutiveNailed,
    consecutiveNeedsWork,
  });

  return {
    reliablePerformance:
      reliableBpm !== undefined
        ? {
            metric: "clean_bpm",
            value: reliableBpm,
            unit: "bpm",
            calculatedAt: now,
          }
        : undefined,
    peakPerformance:
      peakBpm !== undefined
        ? {
            metric: "clean_bpm",
            value: peakBpm,
            unit: "bpm",
            achievedAt: now,
          }
        : undefined,
    recentVerdicts,
    consecutiveNailed,
    consecutiveNeedsWork,
    progressionReady,
    regressionRecommended,
  };
}
