import type { ExerciseCandidate, SessionExerciseItem } from "./types";
import type { ExerciseSelectionReasonCode } from "./types";
import type { ExerciseSelectionScoreBreakdown } from "./types";

export function generateTargets(
  exercise: ExerciseCandidate,
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

  if (exercise.supportsBpm && exercise.defaultTargetBpm !== undefined) {
    result.targetBpm = exercise.defaultTargetBpm;
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
