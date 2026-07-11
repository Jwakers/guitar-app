import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { SessionExerciseItem } from "./sessionLifecycle";

export type LogExerciseResultInput = {
  userId: Id<"users">;
  session: Doc<"practiceSessions">;
  order: number;
  trainingVerdict?: "nailed_it" | "nearly_there" | "needs_work";
  actualBpm?: number;
  peakBpmAttempted?: number;
};

export type LogExerciseResultOutcome = {
  logId: Id<"exerciseLogs"> | null;
  created: boolean;
};

function findSessionItem(
  session: Doc<"practiceSessions">,
  order: number,
): SessionExerciseItem {
  const item = session.exerciseItems.find((i) => i.order === order);
  if (!item) {
    throw new Error("Exercise item not found");
  }
  return item;
}

export async function findExistingExerciseLog(
  ctx: MutationCtx,
  sessionId: Id<"practiceSessions">,
  exerciseId: Id<"exercises">,
  sessionItemOrder: number,
): Promise<Doc<"exerciseLogs"> | null> {
  const logs = await ctx.db
    .query("exerciseLogs")
    .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
    .collect();

  return (
    logs.find(
      (log) =>
        log.exerciseId === exerciseId &&
        log.sessionItemOrder === sessionItemOrder,
    ) ?? null
  );
}

export function buildObjectiveResult(
  exercise: Doc<"exercises">,
  sessionItem: SessionExerciseItem,
  actualBpm?: number,
): Doc<"exerciseLogs">["objectiveResult"] {
  if (
    exercise.primaryProgressMetric === "clean_bpm" &&
    actualBpm !== undefined
  ) {
    return {
      metric: "clean_bpm",
      targetValue: sessionItem.targetBpm,
      actualValue: actualBpm,
      unit: "bpm",
    };
  }

  return {
    metric: exercise.primaryProgressMetric,
    targetValue: sessionItem.targetValue,
    actualValue: actualBpm,
    unit: undefined,
  };
}

export function buildFeedbackResponses(
  trainingVerdict?: "nailed_it" | "nearly_there" | "needs_work",
  actualBpm?: number,
  peakBpmAttempted?: number,
): Doc<"exerciseLogs">["feedbackResponses"] {
  const responses: Doc<"exerciseLogs">["feedbackResponses"] = [];

  if (actualBpm !== undefined) {
    responses.push({
      questionId: "actual_bpm",
      value: actualBpm,
      category: "objective",
    });
  }

  if (trainingVerdict !== undefined) {
    responses.push({
      questionId: "training_verdict",
      value: trainingVerdict,
      category: "subjective",
    });
  }

  if (peakBpmAttempted !== undefined && peakBpmAttempted !== actualBpm) {
    responses.push({
      questionId: "peak_bpm_attempted",
      value: peakBpmAttempted,
      category: "objective",
    });
  }

  return responses;
}

export async function isPersonalBestBpm(
  ctx: MutationCtx,
  userId: Id<"users">,
  exerciseId: Id<"exercises">,
  actualBpm: number,
): Promise<boolean> {
  const priorLogs = await ctx.db
    .query("exerciseLogs")
    .withIndex("by_userId_exerciseId", (q) =>
      q.eq("userId", userId).eq("exerciseId", exerciseId),
    )
    .collect();

  const priorPeak = priorLogs.reduce((max, log) => {
    if (log.objectiveResult.metric !== "clean_bpm") return max;
    const value = log.objectiveResult.actualValue;
    return value !== undefined && value > max ? value : max;
  }, 0);

  return actualBpm > priorPeak;
}

export async function applyLogExerciseResult(
  ctx: MutationCtx,
  input: LogExerciseResultInput,
): Promise<LogExerciseResultOutcome> {
  const sessionItem = findSessionItem(input.session, input.order);
  const exercise = await ctx.db.get("exercises", sessionItem.exerciseId);
  if (!exercise) {
    throw new Error("Exercise not found");
  }

  const existing = await findExistingExerciseLog(
    ctx,
    input.session._id,
    sessionItem.exerciseId,
    input.order,
  );
  if (existing) {
    return { logId: existing._id, created: false };
  }

  const now = Date.now();
  const objectiveResult = buildObjectiveResult(
    exercise,
    sessionItem,
    input.actualBpm,
  );
  const feedbackResponses = buildFeedbackResponses(
    input.trainingVerdict,
    input.actualBpm,
    input.peakBpmAttempted,
  );

  const isPersonalBest =
    input.actualBpm !== undefined &&
    exercise.primaryProgressMetric === "clean_bpm"
      ? await isPersonalBestBpm(
          ctx,
          input.userId,
          sessionItem.exerciseId,
          input.actualBpm,
        )
      : false;

  const logId = await ctx.db.insert("exerciseLogs", {
    userId: input.userId,
    sessionId: input.session._id,
    sessionItemOrder: input.order,
    exerciseId: sessionItem.exerciseId,
    coreSkillId: exercise.coreSkillId,
    subSkillIds: exercise.subSkillIds,
    trainingAttributes: exercise.trainingAttributes,
    date: now,
    trainingVerdict: input.trainingVerdict ?? "nearly_there",
    objectiveResult,
    feedbackResponses,
    isPersonalBest,
    createdAt: now,
  });

  return { logId, created: true };
}
