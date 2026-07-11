import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  recomputeExerciseStateFromLogs,
  type ExerciseLogSnapshot,
} from "../../src/lib/training-engine/reliable-performance";
import type { UserExerciseStateSnapshot } from "../../src/lib/training-engine/types";

export function exerciseLogToSnapshot(
  log: Doc<"exerciseLogs">,
): ExerciseLogSnapshot {
  return {
    date: log.date,
    trainingVerdict: log.trainingVerdict,
    objectiveResult: {
      metric: log.objectiveResult.metric,
      actualValue: log.objectiveResult.actualValue,
    },
  };
}

export function userExerciseStateToSnapshot(
  state: Doc<"userExerciseState">,
): UserExerciseStateSnapshot {
  return {
    exerciseId: state.exerciseId,
    reliablePerformance: state.reliablePerformance,
    peakPerformance: state.peakPerformance,
    recentVerdicts: state.recentVerdicts,
    consecutiveNailed: state.consecutiveNailed,
    consecutiveNeedsWork: state.consecutiveNeedsWork,
    progressionReady: state.progressionReady,
    regressionRecommended: state.regressionRecommended,
  };
}

export async function loadUserExerciseStates(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Map<Id<"exercises">, UserExerciseStateSnapshot>> {
  const states = await ctx.db
    .query("userExerciseState")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const map = new Map<Id<"exercises">, UserExerciseStateSnapshot>();
  for (const state of states) {
    map.set(state.exerciseId, userExerciseStateToSnapshot(state));
  }
  return map;
}

export async function recomputeExerciseState(
  ctx: MutationCtx,
  userId: Id<"users">,
  exerciseId: Id<"exercises">,
  now: number,
): Promise<Id<"userExerciseState">> {
  const exercise = await ctx.db.get("exercises", exerciseId);
  if (!exercise) {
    throw new Error("Exercise not found");
  }

  const logs = await ctx.db
    .query("exerciseLogs")
    .withIndex("by_userId_exerciseId", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId),
    )
    .collect();

  const recomputed = recomputeExerciseStateFromLogs(
    logs.map(exerciseLogToSnapshot),
    now,
  );

  const reliablePerformance = recomputed.reliablePerformance
    ? {
        metric: recomputed.reliablePerformance.metric,
        value: recomputed.reliablePerformance.value,
        unit: recomputed.reliablePerformance.unit,
        calculatedAt: recomputed.reliablePerformance.calculatedAt ?? now,
      }
    : undefined;

  const peakPerformance = recomputed.peakPerformance
    ? {
        metric: recomputed.peakPerformance.metric,
        value: recomputed.peakPerformance.value,
        unit: recomputed.peakPerformance.unit,
        achievedAt: recomputed.peakPerformance.achievedAt ?? now,
      }
    : undefined;

  const existing = await ctx.db
    .query("userExerciseState")
    .withIndex("by_userId_exerciseId", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId),
    )
    .unique();

  const lastPractisedAt =
    logs.length > 0
      ? Math.max(...logs.map((log) => log.date))
      : existing?.lastPractisedAt;

  const fields = {
    coreSkillId: exercise.coreSkillId,
    subSkillIds: exercise.subSkillIds,
    reliablePerformance,
    peakPerformance,
    lastPractisedAt,
    recentVerdicts: recomputed.recentVerdicts,
    consecutiveNailed: recomputed.consecutiveNailed,
    consecutiveNeedsWork: recomputed.consecutiveNeedsWork,
    progressionReady: recomputed.progressionReady,
    regressionRecommended: recomputed.regressionRecommended,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch("userExerciseState", existing._id, fields);
    return existing._id;
  }

  return await ctx.db.insert("userExerciseState", {
    userId,
    exerciseId,
    currentLevel: 1,
    masteryStatus: "learning",
    ...fields,
  });
}
