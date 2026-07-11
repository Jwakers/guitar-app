import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireCurrentUser } from "./lib/auth";
import { buildProgressOverview } from "./lib/buildProgressOverview";
import {
  formatDateInTimezone,
  getCalendarWeekStartDate,
} from "../src/lib/training-engine/dates";
import { trainingVerdict } from "./lib/sessionValidators";

const objectiveResultValidator = v.object({
  metric: v.string(),
  targetValue: v.optional(v.number()),
  actualValue: v.optional(v.number()),
  unit: v.optional(v.string()),
});

const progressOverviewValidator = v.object({
  weekStartDate: v.string(),
  todayDate: v.string(),
  sessionRollup: v.object({
    sessionsCompleted: v.number(),
    totalMinutes: v.number(),
    personalBestsThisWeek: v.number(),
  }),
  skills: v.array(
    v.object({
      skillTargetKey: v.string(),
      label: v.string(),
      rating: v.number(),
      status: v.union(
        v.literal("weak"),
        v.literal("developing"),
        v.literal("stable"),
        v.literal("strong"),
        v.literal("maintenance"),
      ),
      trend7Day: v.optional(v.number()),
      trend30Day: v.optional(v.number()),
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
});

export const getProgressOverview = query({
  args: {},
  returns: progressOverviewValidator,
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const todayDate = formatDateInTimezone(now, user.timezone);
    const weekStartDate = getCalendarWeekStartDate(now, user.timezone);

    const [skillRatings, logs, exerciseStates, completedSessions] =
      await Promise.all([
        ctx.db
          .query("userSkillRatings")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect(),
        ctx.db
          .query("exerciseLogs")
          .withIndex("by_userId_date", (q) => q.eq("userId", user._id))
          .collect(),
        ctx.db
          .query("userExerciseState")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .collect(),
        ctx.db
          .query("practiceSessions")
          .withIndex("by_userId_status", (q) =>
            q.eq("userId", user._id).eq("status", "completed"),
          )
          .collect(),
      ]);

    const completedSessionsThisWeek = completedSessions
      .filter(
        (session) =>
          session.date >= weekStartDate && session.date <= todayDate,
      )
      .map((session) => ({
        date: session.date,
        estimatedMinutes: session.estimatedMinutes,
      }));

    const exerciseIds = new Set<Id<"exercises">>();
    for (const log of logs) exerciseIds.add(log.exerciseId);
    for (const state of exerciseStates) exerciseIds.add(state.exerciseId);

    const exerciseTitles: Record<string, string> = {};
    await Promise.all(
      [...exerciseIds].map(async (exerciseId) => {
        const exercise = await ctx.db.get("exercises", exerciseId);
        if (exercise) {
          exerciseTitles[exerciseId] = exercise.title;
        }
      }),
    );

    return buildProgressOverview({
      weekStartDate,
      todayDate,
      timezone: user.timezone,
      skillRatings: skillRatings.map((rating) => ({
        skillTargetKey: rating.skillTargetKey,
        rating: rating.rating,
        status: rating.status,
        trend7Day: rating.trend7Day,
        trend30Day: rating.trend30Day,
      })),
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
      completedSessionsThisWeek,
      exerciseTitles,
    });
  },
});
