import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireCurrentUser } from "./lib/auth";
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

    const [rating, logs, exerciseStates] = await Promise.all([
      ctx.db
        .query("userSkillRatings")
        .withIndex("by_userId_skillTargetKey", (q) =>
          q
            .eq("userId", user._id)
            .eq("skillTargetKey", args.skillTargetKey),
        )
        .unique(),
      loadLogsForSkillTarget(ctx, user._id, skillTarget),
      ctx.db
        .query("userExerciseState")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    const exerciseIds = new Set<Id<"exercises">>();
    for (const log of logs) exerciseIds.add(log.exerciseId);
    for (const state of exerciseStates) exerciseIds.add(state.exerciseId);

    const exerciseTitles = await loadExerciseTitles(ctx, exerciseIds);

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
      logs: logs.map((log) => ({
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

    const result = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const filteredPage = args.skillTargetKey
      ? result.page.filter((log) =>
          logMatchesSkillTargetKey(log, args.skillTargetKey!),
        )
      : result.page;

    const exerciseIds = new Set(filteredPage.map((log) => log.exerciseId));
    const exerciseTitles = await loadExerciseTitles(ctx, exerciseIds);

    return {
      page: filteredPage.map((log) => ({
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
      })),
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
