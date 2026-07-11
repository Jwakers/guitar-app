import { computeNextTargetBpm } from "./reliable-performance";
import type {
  ExerciseCandidate,
  SessionExerciseItem,
  SessionType,
  UserExerciseStateSnapshot,
} from "./types";
import type { ExerciseSelectionReasonCode } from "./types";
import type { ExerciseSelectionScoreBreakdown } from "./types";

export type GenerateTargetsOptions = {
  sessionType: SessionType;
  userState?: UserExerciseStateSnapshot;
};

export function generateTargets(
  exercise: ExerciseCandidate,
  options: GenerateTargetsOptions,
): Pick<
  SessionExerciseItem,
  "targetMetric" | "targetValue" | "targetBpm" | "durationMinutes"
> {
  const durationMinutes = Math.min(exercise.estimatedMinutes, 15);
  const result: Pick<
    SessionExerciseItem,
    "targetMetric" | "targetValue" | "targetBpm" | "durationMinutes"
  > = {
    targetMetric: exercise.primaryProgressMetric,
    durationMinutes,
  };

  if (exercise.supportsBpm) {
    const reliableBpm =
      options.userState?.reliablePerformance?.metric === "clean_bpm"
        ? options.userState.reliablePerformance.value
        : undefined;
    const baseBpm = reliableBpm ?? exercise.defaultTargetBpm;

    if (baseBpm !== undefined) {
      result.targetBpm = computeNextTargetBpm({
        reliableBpm: baseBpm,
        sessionType: options.sessionType,
        progressionReady: options.userState?.progressionReady ?? false,
        regressionRecommended:
          options.userState?.regressionRecommended ?? false,
      });
    }
  }

  return result;
}

export function reasonCodesFromScore(
  breakdown: ExerciseSelectionScoreBreakdown,
): ExerciseSelectionReasonCode[] {
  const codes: ExerciseSelectionReasonCode[] = ["SLOT_TYPE_MATCH"];
  if (breakdown.weaknessMatch >= 0.5) codes.push("WEAKNESS_MATCH");
  if (breakdown.blockRelevance >= 0.7) codes.push("BLOCK_FOCUS");
  if (breakdown.goalMatch >= 0.7) codes.push("GOAL_MATCH");
  if (codes.length === 1) codes.push("DEFAULT_FALLBACK");
  return codes;
}
