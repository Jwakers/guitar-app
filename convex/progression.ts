import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireCurrentUser } from "./lib/auth";
import {
  assertEntitlement,
  getUserEntitlements,
} from "./lib/subscriptions";
import { FREE_SKILL_EXERCISE_HISTORY_LIMIT } from "../src/lib/subscriptions/entitlements";
import { buildSkillTargetDetail } from "./lib/buildSkillTargetDetail";
import {
  loadLogsForSkillTarget,
  parseSkillTargetKey,
  recomputeSkillRatingForTarget,
} from "./lib/recomputeSkillRatings";
import { trainingVerdict } from "./lib/sessionValidators";
import {
  coreSkillValidator,
  subSkillValidator,
} from "./lib/exerciseValidators";

const objectiveResultValidator = v.object({
  metric: v.string(),
  targetValue: v.optional(v.number()),
  actualValue: v.optional(v.number()),
  unit: v.optional(v.string()),
});

const skillTargetDetailValidator = v.object({
  skillTargetKey: v.string(),
  label: v.string(),
  rating: v.union(v.number(), v.null()),
  status: v.union(
    v.literal("weak"),
    v.literal("developing"),
    v.literal("stable"),
    v.literal("strong"),
    v.literal("maintenance"),
    v.null(),
  ),
  confidence: v.union(v.number(), v.null()),
  trend7Day: v.optional(v.number()),
  trend30Day: v.optional(v.number()),
  lastTrainedAt: v.optional(v.number()),
  recentActivity: v.array(
    v.object({
      exerciseId: v.id("exercises"),
      exerciseTitle: v.string(),
      date: v.number(),
      trainingVerdict,
      objectiveResult: objectiveResultValidator,
      isPersonalBest: v.boolean(),
    }),
  ),
  personalBests: v.array(
    v.object({
      exerciseId: v.id("exercises"),
      exerciseTitle: v.string(),
      date: v.number(),
      trainingVerdict,
      objectiveResult: objectiveResultValidator,
    }),
  ),
  reliablePerformance: v.array(
    v.object({
      exerciseId: v.id("exercises"),
      exerciseTitle: v.string(),
      reliablePerformance: v.optional(
        v.object({
          metric: v.string(),
          value: v.number(),
          unit: v.string(),
        }),
      ),
      peakPerformance: v.optional(
        v.object({
          metric: v.string(),
          value: v.number(),
          unit: v.string(),
        }),
      ),
      lastPractisedAt: v.optional(v.number()),
    }),
  ),
});

const historyEntryValidator = v.object({
  _id: v.id("exerciseLogs"),
  exerciseId: v.id("exercises"),
  exerciseTitle: v.string(),
  date: v.number(),
  trainingVerdict,
  objectiveResult: objectiveResultValidator,
  isPersonalBest: v.boolean(),
  coreSkillId: coreSkillValidator,
  subSkillIds: v.array(subSkillValidator),
});

function logMatchesSkillTargetKey(
  log: {
    coreSkillId: string;
    subSkillIds: string[];
  },
  skillTargetKey: string,
): boolean {
  const target = parseSkillTargetKey(skillTargetKey);
  if (!target) return false;
  if (target.kind === "core") {
    return log.coreSkillId === target.id;
  }
  return log.subSkillIds.includes(target.id);
}

async function loadExerciseStatesForExercises(
  ctx: QueryCtx,
  userId: Id<"users">,
  exerciseIds: Iterable<Id<"exercises">>,
): Promise<Doc<"userExerciseState">[]> {
  const states = await Promise.all(
    [...exerciseIds].map((exerciseId) =>
      ctx.db
        .query("userExerciseState")
        .withIndex("by_userId_exerciseId", (q) =>
          q.eq("userId", userId).eq("exerciseId", exerciseId),
        )
        .unique(),
    ),
  );

  return states.filter((state): state is Doc<"userExerciseState"> => state !== null);
}

const FILTERED_HISTORY_CURSOR_PREFIX = "__filtered__";

type FilteredHistoryCursor = {
  dbCursor: string | null;
  bufferedIds: Id<"exerciseLogs">[];
};

function encodeFilteredHistoryCursor(state: FilteredHistoryCursor): string {
  return FILTERED_HISTORY_CURSOR_PREFIX + JSON.stringify(state);
}

function decodeFilteredHistoryCursor(
  cursor: string | null,
): FilteredHistoryCursor {
  if (!cursor || !cursor.startsWith(FILTERED_HISTORY_CURSOR_PREFIX)) {
    return { dbCursor: null, bufferedIds: [] };
  }

  try {
    const parsed = JSON.parse(
      cursor.slice(FILTERED_HISTORY_CURSOR_PREFIX.length),
    ) as FilteredHistoryCursor;
    return {
      dbCursor: parsed.dbCursor ?? null,
      bufferedIds: parsed.bufferedIds ?? [],
    };
  } catch {
    return { dbCursor: null, bufferedIds: [] };
  }
}

async function paginateExerciseHistory(
  ctx: QueryCtx,
  userId: Id<"users">,
  paginationOpts: { numItems: number; cursor: string | null },
  skillTargetKey?: string,
) {
  const targetSize = paginationOpts.numItems;

  if (!skillTargetKey) {
    const result = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);

    return {
      page: result.page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  }

  const { dbCursor: initialDbCursor, bufferedIds } = decodeFilteredHistoryCursor(
    paginationOpts.cursor,
  );

  const page: Doc<"exerciseLogs">[] = [];
  if (bufferedIds.length > 0) {
    const buffered = await Promise.all(
      bufferedIds.map((id) => ctx.db.get("exerciseLogs", id)),
    );
    for (const log of buffered) {
      if (log) {
        page.push(log);
      }
    }
  }

  let dbCursor = initialDbCursor;
  let sourceDone = false;

  while (page.length < targetSize && !sourceDone) {
    const result = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate({
        numItems: targetSize * 3,
        cursor: dbCursor,
      });

    const matches = result.page.filter((log) =>
      logMatchesSkillTargetKey(log, skillTargetKey),
    );
    page.push(...matches);

    sourceDone = result.isDone;
    dbCursor = result.continueCursor;

    if (result.page.length === 0) {
      break;
    }
  }

  const returnPage = page.slice(0, targetSize);
  const overflowIds = page.slice(targetSize).map((log) => log._id);
  const isDone = sourceDone && overflowIds.length === 0;

  return {
    page: returnPage,
    isDone,
    continueCursor: isDone
      ? ""
      : encodeFilteredHistoryCursor({
          dbCursor,
          bufferedIds: overflowIds,
        }),
  };
}

async function loadExerciseTitles(
  ctx: QueryCtx,
  exerciseIds: Iterable<Id<"exercises">>,
): Promise<Record<string, string>> {
  const exerciseTitles: Record<string, string> = {};
  await Promise.all(
    [...exerciseIds].map(async (exerciseId) => {
      const exercise = await ctx.db.get("exercises", exerciseId);
      if (exercise) {
        exerciseTitles[exerciseId] = exercise.title;
      }
    }),
  );
  return exerciseTitles;
}

export const getSkillTargetDetail = query({
  args: { skillTargetKey: v.string() },
  returns: v.union(skillTargetDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const skillTarget = parseSkillTargetKey(args.skillTargetKey);
    if (!skillTarget) {
      return null;
    }

    const entitlements = getUserEntitlements(user);

    const [rating, logs] = await Promise.all([
      ctx.db
        .query("userSkillRatings")
        .withIndex("by_userId_skillTargetKey", (q) =>
          q
            .eq("userId", user._id)
            .eq("skillTargetKey", args.skillTargetKey),
        )
        .unique(),
      loadLogsForSkillTarget(ctx, user._id, skillTarget),
    ]);

    const limitedLogs =
      entitlements.skillExerciseHistoryFull ||
      entitlements.skillExerciseHistoryLimit === null
        ? logs
        : logs.slice(0, entitlements.skillExerciseHistoryLimit);

    const logExerciseIds = [
      ...new Set(limitedLogs.map((log) => log.exerciseId)),
    ];
    const [exerciseStates, exerciseTitles] = await Promise.all([
      loadExerciseStatesForExercises(ctx, user._id, logExerciseIds),
      loadExerciseTitles(ctx, logExerciseIds),
    ]);

    return buildSkillTargetDetail({
      skillTargetKey: args.skillTargetKey,
      rating: rating
        ? {
            skillTargetKey: rating.skillTargetKey,
            rating: rating.rating,
            status: rating.status,
            confidence: rating.confidence,
            trend7Day: rating.trend7Day,
            trend30Day: rating.trend30Day,
            lastTrainedAt: rating.lastTrainedAt,
          }
        : null,
      logs: limitedLogs.map((log) => ({
        exerciseId: log.exerciseId,
        date: log.date,
        trainingVerdict: log.trainingVerdict,
        objectiveResult: {
          metric: log.objectiveResult.metric,
          targetValue: log.objectiveResult.targetValue,
          actualValue: log.objectiveResult.actualValue,
          unit: log.objectiveResult.unit,
        },
        isPersonalBest: log.isPersonalBest,
      })),
      exerciseStates: exerciseStates.map((state) => ({
        exerciseId: state.exerciseId,
        reliablePerformance: state.reliablePerformance,
        peakPerformance: state.peakPerformance,
        lastPractisedAt: state.lastPractisedAt,
        updatedAt: state.updatedAt,
      })),
      exerciseTitles,
    });
  },
});

async function mapHistoryPage(
  ctx: QueryCtx,
  logs: Doc<"exerciseLogs">[],
) {
  const exerciseIds = new Set(logs.map((log) => log.exerciseId));
  const exerciseTitles = await loadExerciseTitles(ctx, exerciseIds);

  return logs.map((log) => ({
    _id: log._id,
    exerciseId: log.exerciseId,
    exerciseTitle: exerciseTitles[log.exerciseId] ?? "Unknown exercise",
    date: log.date,
    trainingVerdict: log.trainingVerdict,
    objectiveResult: {
      metric: log.objectiveResult.metric,
      targetValue: log.objectiveResult.targetValue,
      actualValue: log.objectiveResult.actualValue,
      unit: log.objectiveResult.unit,
    },
    isPersonalBest: log.isPersonalBest,
    coreSkillId: log.coreSkillId,
    subSkillIds: log.subSkillIds,
  }));
}

export const listExerciseHistory = query({
  args: {
    paginationOpts: paginationOptsValidator,
    skillTargetKey: v.optional(v.string()),
  },
  returns: v.object({
    page: v.array(historyEntryValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const entitlements = getUserEntitlements(user);

    if (
      args.skillTargetKey &&
      !entitlements.skillExerciseHistoryFull &&
      args.paginationOpts.cursor
    ) {
      assertEntitlement(user, "skill_exercise_history");
    }

    const paginationOpts =
      args.skillTargetKey &&
      !entitlements.skillExerciseHistoryFull &&
      entitlements.skillExerciseHistoryLimit !== null
        ? {
            ...args.paginationOpts,
            numItems: Math.min(
              args.paginationOpts.numItems,
              entitlements.skillExerciseHistoryLimit,
            ),
          }
        : args.paginationOpts;

    const result = await paginateExerciseHistory(
      ctx,
      user._id,
      paginationOpts,
      args.skillTargetKey,
    );

    if (
      args.skillTargetKey &&
      !entitlements.skillExerciseHistoryFull &&
      entitlements.skillExerciseHistoryLimit !== null
    ) {
      const limit = entitlements.skillExerciseHistoryLimit;
      const cappedPage = result.page.slice(0, limit);
      const capReached = cappedPage.length >= limit || result.isDone;
      return {
        page: await mapHistoryPage(ctx, cappedPage),
        isDone: capReached,
        continueCursor: capReached ? "" : result.continueCursor,
      };
    }

    return {
      page: await mapHistoryPage(ctx, result.page),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

/** Dev/debug: recompute one skill rating from all logs. */
export const recomputeSkillTargetInternal = internalMutation({
  args: {
    userId: v.id("users"),
    skillTargetKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const skillTarget = parseSkillTargetKey(args.skillTargetKey);
    if (!skillTarget) {
      throw new Error("Invalid skill target key");
    }

    await recomputeSkillRatingForTarget(
      ctx,
      args.userId,
      skillTarget,
      Date.now(),
    );

    return null;
  },
});
