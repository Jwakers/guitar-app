import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import {
  applyCompleteExerciseItem,
  applyStartSession,
  getSessionForUser,
} from "./lib/sessionLifecycle";
import { applyLogExerciseResult } from "./lib/logExerciseResult";
import { buildSessionSummary } from "./lib/completeSessionSummary";
import { getWeeklyPlanForBlockWeek } from "./lib/weeklyPlanLookup";
import { sessionSlotTypeValidator, trainingVerdict } from "./lib/sessionValidators";
import {
  coreSkillValidator,
  subSkillValidator,
} from "./lib/exerciseValidators";
import {
  blockDocToSnapshot,
  createSessionForDate,
  formatDateInTimezone,
  getActiveBlock,
  isPracticeDay,
  loadUserTrainingContext,
  nextPracticeDay,
  profileDocToSnapshot,
  provisionInitialTraining,
  ratingsToSnapshots,
  SessionBuildError,
  sessionTypeForDate,
} from "./lib/provisionTraining";
import type { BlockType } from "../src/lib/training-engine/types";
import { pickNewestPendingSession } from "../src/lib/training-engine/pending-session";

const exerciseItemValidator = v.object({
  exerciseId: v.id("exercises"),
  slotType: sessionSlotTypeValidator,
  order: v.number(),
  targetMetric: v.string(),
  targetValue: v.optional(v.number()),
  targetBpm: v.optional(v.number()),
  sets: v.optional(v.number()),
  durationMinutes: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("skipped"),
  ),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  reasonCodes: v.array(v.string()),
  scoreBreakdown: v.optional(
    v.object({
      goalMatch: v.number(),
      weaknessMatch: v.number(),
      blockRelevance: v.number(),
      readiness: v.number(),
      progressionNeed: v.number(),
      maintenanceNeed: v.number(),
      variety: v.number(),
      penalties: v.number(),
      total: v.number(),
    }),
  ),
  instructionsOverride: v.optional(v.string()),
});

const skillTargetValidator = v.union(
  v.object({ kind: v.literal("core"), id: coreSkillValidator }),
  v.object({ kind: v.literal("sub"), id: subSkillValidator }),
);

const sessionDocValidator = v.object({
  _id: v.id("practiceSessions"),
  _creationTime: v.number(),
  userId: v.id("users"),
  blockId: v.optional(v.id("trainingBlocks")),
  weeklyPlanId: v.optional(v.id("weeklyPlans")),
  date: v.string(),
  title: v.string(),
  goal: v.string(),
  estimatedMinutes: v.number(),
  status: v.union(
    v.literal("planned"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("skipped"),
  ),
  sessionType: v.union(
    v.literal("standard"),
    v.literal("light"),
    v.literal("test"),
    v.literal("deload"),
    v.literal("maintenance"),
  ),
  exerciseItems: v.array(exerciseItemValidator),
  pendingSkillRatingChanges: v.optional(
    v.array(
      v.object({
        skillTarget: skillTargetValidator,
        oldRating: v.number(),
        newRating: v.number(),
      }),
    ),
  ),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
});

const skillRatingChangeValidator = v.object({
  skillTarget: skillTargetValidator,
  oldRating: v.number(),
  newRating: v.number(),
});

const sessionSummaryDocValidator = v.object({
  skillRatingChanges: v.array(skillRatingChangeValidator),
  xpAwarded: v.number(),
  streakUpdated: v.boolean(),
});

export const getPendingSession = query({
  args: {},
  returns: v.union(sessionDocValidator, v.null()),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const [planned, active] = await Promise.all([
      ctx.db
        .query("practiceSessions")
        .withIndex("by_userId_status", (q) =>
          q.eq("userId", user._id).eq("status", "planned"),
        )
        .collect(),
      ctx.db
        .query("practiceSessions")
        .withIndex("by_userId_status", (q) =>
          q.eq("userId", user._id).eq("status", "active"),
        )
        .collect(),
    ]);

    return pickNewestPendingSession([...planned, ...active]);
  },
});

export const getTodaySession = query({
  args: {},
  returns: v.union(sessionDocValidator, v.null()),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const dateString = formatDateInTimezone(Date.now(), user.timezone);

    return await ctx.db
      .query("practiceSessions")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).eq("date", dateString),
      )
      .first();
  },
});

export const getScheduleStatus = query({
  args: {},
  returns: v.object({
    isPracticeDay: v.boolean(),
    todayDate: v.string(),
    nextPracticeDay: v.optional(
      v.object({
        dateString: v.string(),
        dayName: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const { profile } = await loadUserTrainingContext(ctx, user._id);
    const profileSnapshot = profileDocToSnapshot(profile);
    const todayDate = formatDateInTimezone(now, user.timezone);
    const practiceToday = isPracticeDay(
      now,
      user.timezone,
      profileSnapshot.availableDays,
    );

    const next = practiceToday
      ? undefined
      : nextPracticeDay(now, user.timezone, profileSnapshot.availableDays);

    return {
      isPracticeDay: practiceToday,
      todayDate,
      nextPracticeDay: next
        ? { dateString: next.dateString, dayName: next.dayName }
        : undefined,
    };
  },
});

export const generateSession = mutation({
  args: {},
  returns: v.union(sessionDocValidator, v.null()),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const dateString = formatDateInTimezone(now, user.timezone);

    const existing = await ctx.db
      .query("practiceSessions")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).eq("date", dateString),
      )
      .first();
    if (existing) return existing;

    let block = await getActiveBlock(ctx, user._id);
    if (!block) {
      // Backfill for users who onboarded before block provisioning shipped
      await provisionInitialTraining(ctx, user._id, now);
      block = await getActiveBlock(ctx, user._id);
      if (!block) {
        throw new Error("No active training block. Complete onboarding first.");
      }
    }

    const { profile, ratings, exercises } = await loadUserTrainingContext(
      ctx,
      user._id,
    );
    const profileSnapshot = profileDocToSnapshot(profile);

    const sessionMeta = sessionTypeForDate(
      now,
      user.timezone,
      profileSnapshot,
      block.blockType as BlockType,
    );

    const weeklyPlan = await getWeeklyPlanForBlockWeek(
      ctx,
      block._id,
      block.currentWeek,
    );

    if (!weeklyPlan) {
      throw new Error("No weekly plan for the current block week.");
    }

    try {
      const sessionId = await createSessionForDate(
        ctx,
        user._id,
        block._id,
        weeklyPlan._id,
        dateString,
        sessionMeta.sessionType,
        profileSnapshot,
        blockDocToSnapshot(block),
        ratingsToSnapshots(ratings),
        exercises,
        now,
      );

      if (!weeklyPlan.plannedSessionIds.includes(sessionId)) {
        await ctx.db.patch("weeklyPlans", weeklyPlan._id, {
          plannedSessionIds: [...weeklyPlan.plannedSessionIds, sessionId],
        });
      }

      return await ctx.db.get("practiceSessions", sessionId);
    } catch (error) {
      if (error instanceof SessionBuildError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
});

const completeExerciseOutcomeValidator = v.union(
  v.object({ kind: v.literal("skipped_feedback") }),
  v.object({
    kind: v.literal("placeholder_feedback"),
    trainingVerdict: v.optional(trainingVerdict),
  }),
);

export const getSession = query({
  args: { sessionId: v.id("practiceSessions") },
  returns: v.union(sessionDocValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await ctx.db.get("practiceSessions", args.sessionId);
    if (!session || session.userId !== user._id) {
      return null;
    }
    return session;
  },
});

export const getSessionLogs = query({
  args: { sessionId: v.id("practiceSessions") },
  returns: v.array(
    v.object({
      _id: v.id("exerciseLogs"),
      sessionItemOrder: v.optional(v.number()),
      exerciseId: v.id("exercises"),
      trainingVerdict,
      objectiveResult: v.object({
        metric: v.string(),
        targetValue: v.optional(v.number()),
        actualValue: v.optional(v.number()),
        unit: v.optional(v.string()),
      }),
      feedbackResponses: v.array(
        v.object({
          questionId: v.string(),
          value: v.union(v.string(), v.number(), v.boolean()),
          category: v.union(v.literal("objective"), v.literal("subjective")),
        }),
      ),
      isPersonalBest: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await ctx.db.get("practiceSessions", args.sessionId);
    if (!session || session.userId !== user._id) {
      return [];
    }

    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return logs.map((log) => ({
      _id: log._id,
      sessionItemOrder: log.sessionItemOrder,
      exerciseId: log.exerciseId,
      trainingVerdict: log.trainingVerdict,
      objectiveResult: log.objectiveResult,
      feedbackResponses: log.feedbackResponses,
      isPersonalBest: log.isPersonalBest,
    }));
  },
});

export const getSessionSummary = query({
  args: { sessionId: v.id("practiceSessions") },
  returns: v.union(sessionSummaryDocValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await ctx.db.get("practiceSessions", args.sessionId);
    if (!session || session.userId !== user._id) {
      return null;
    }

    const summary = await ctx.db
      .query("sessionSummaries")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!summary) {
      return null;
    }

    return {
      skillRatingChanges: summary.skillRatingChanges,
      xpAwarded: summary.xpAwarded,
      streakUpdated: summary.streakUpdated,
    };
  },
});

export const logExerciseResult = mutation({
  args: {
    sessionId: v.id("practiceSessions"),
    order: v.number(),
    trainingVerdict: v.optional(trainingVerdict),
    actualBpm: v.optional(v.number()),
    peakBpmAttempted: v.optional(v.number()),
    feedbackResponses: v.optional(
      v.array(
        v.object({
          questionId: v.string(),
          value: v.union(v.string(), v.number(), v.boolean()),
          category: v.union(v.literal("objective"), v.literal("subjective")),
        }),
      ),
    ),
  },
  returns: v.union(v.id("exerciseLogs"), v.null()),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await getSessionForUser(ctx, args.sessionId, user._id);

    const result = await applyLogExerciseResult(ctx, {
      userId: user._id,
      session,
      order: args.order,
      trainingVerdict: args.trainingVerdict,
      actualBpm: args.actualBpm,
      peakBpmAttempted: args.peakBpmAttempted,
      feedbackResponses: args.feedbackResponses,
    });

    return result.logId;
  },
});

export const startSession = mutation({
  args: { sessionId: v.id("practiceSessions") },
  returns: sessionDocValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await getSessionForUser(ctx, args.sessionId, user._id);
    const now = Date.now();

    if (session.status === "completed" || session.status === "skipped") {
      return session;
    }

    if (session.status === "active") {
      return session;
    }

    const { status, exerciseItems } = applyStartSession(session, now);
    await ctx.db.patch(session._id, { status, exerciseItems });
    const updated = await ctx.db.get("practiceSessions", session._id);
    if (!updated) throw new Error("Session not found after update");
    return updated;
  },
});

export const completeExerciseItem = mutation({
  args: {
    sessionId: v.id("practiceSessions"),
    order: v.number(),
    outcome: completeExerciseOutcomeValidator,
  },
  returns: v.object({
    session: sessionDocValidator,
    hasMoreExercises: v.boolean(),
    nextOrder: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await getSessionForUser(ctx, args.sessionId, user._id);
    const now = Date.now();

    if (session.status === "planned") {
      const started = applyStartSession(session, now);
      await ctx.db.patch(session._id, {
        status: started.status,
        exerciseItems: started.exerciseItems,
      });
    }

    const current = await ctx.db.get("practiceSessions", session._id);
    if (!current) throw new Error("Session not found");

    const result = applyCompleteExerciseItem(
      current,
      args.order,
      args.outcome,
      now,
    );

    await ctx.db.patch(session._id, {
      exerciseItems: result.exerciseItems,
      status: "active",
    });

    const updated = await ctx.db.get("practiceSessions", session._id);
    if (!updated) throw new Error("Session not found after update");

    return {
      session: updated,
      hasMoreExercises: result.hasMoreExercises,
      nextOrder: result.nextOrder,
    };
  },
});

export const completeSession = mutation({
  args: { sessionId: v.id("practiceSessions") },
  returns: sessionDocValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await getSessionForUser(ctx, args.sessionId, user._id);
    const now = Date.now();

    if (session.status === "completed") {
      return session;
    }

    const existingSummary = await ctx.db
      .query("sessionSummaries")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
      .first();

    if (!existingSummary) {
      const summary = await buildSessionSummary(ctx, user, session, now);

      await ctx.db.insert("sessionSummaries", {
        sessionId: session._id,
        userId: user._id,
        durationMinutes: summary.durationMinutes,
        completedExerciseCount: summary.completedExerciseCount,
        skillRatingChanges: summary.skillRatingChanges,
        personalBests: summary.personalBests,
        streakUpdated: summary.streakUpdated,
        xpAwarded: summary.xpAwarded,
        achievementsUnlocked: summary.achievementsUnlocked,
        createdAt: now,
      });
    }

    await ctx.db.patch(session._id, {
      status: "completed",
      completedAt: now,
      pendingSkillRatingChanges: [],
    });

    const updated = await ctx.db.get("practiceSessions", session._id);
    if (!updated) throw new Error("Session not found after update");
    return updated;
  },
});
