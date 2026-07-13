import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { labelFromSkillTargetKey } from "./lib/buildProgressOverview";
import {
  coreSkillValidator,
  subSkillValidator,
} from "./lib/exerciseValidators";
import { skillTargetKey } from "../src/lib/skills/taxonomy";
import { DEFAULT_SESSIONS_PER_WEEK } from "../src/lib/training-engine/constants";
import { formatDateInTimezone } from "../src/lib/training-engine/dates";
import {
  buildMonthlyReview,
  computeMonthlyReviewBounds,
  isTimestampInMonth,
} from "../src/lib/progress/buildMonthlyReview";

function isFutureMonth(
  year: number,
  month: number,
  timezone: string,
  now: number,
): boolean {
  const todayDate = formatDateInTimezone(now, timezone);
  const [todayYear, todayMonth] = todayDate.split("-").map(Number);
  return (
    year > todayYear! || (year === todayYear && month > todayMonth!)
  );
}

const skillTargetValidator = v.union(
  v.object({ kind: v.literal("core"), id: coreSkillValidator }),
  v.object({ kind: v.literal("sub"), id: subSkillValidator }),
);

const monthlyReviewValidator = v.object({
  _id: v.optional(v.id("monthlyReviews")),
  year: v.number(),
  month: v.number(),
  practiceDays: v.number(),
  totalMinutes: v.number(),
  sessionsCompleted: v.number(),
  exercisesCompleted: v.number(),
  mostImprovedSkillTarget: v.optional(skillTargetValidator),
  weakestSkillTarget: v.optional(skillTargetValidator),
  mostImprovedLabel: v.optional(v.string()),
  weakestLabel: v.optional(v.string()),
  personalBestCount: v.number(),
  achievementsUnlocked: v.number(),
  consistencyPercent: v.number(),
  recommendedNextFocus: v.string(),
  longestStreak: v.number(),
});

function formatMonthlyReviewResponse(
  built: ReturnType<typeof buildMonthlyReview>,
  existingId?: Id<"monthlyReviews">,
) {
  return {
    _id: existingId,
    year: built.year,
    month: built.month,
    practiceDays: built.practiceDays,
    totalMinutes: built.totalMinutes,
    sessionsCompleted: built.sessionsCompleted,
    exercisesCompleted: built.exercisesCompleted,
    mostImprovedSkillTarget: built.mostImprovedSkillTarget,
    weakestSkillTarget: built.weakestSkillTarget,
    mostImprovedLabel: built.mostImprovedSkillTarget
      ? labelFromSkillTargetKey(
          skillTargetKey(built.mostImprovedSkillTarget),
        )
      : undefined,
    weakestLabel: built.weakestSkillTarget
      ? labelFromSkillTargetKey(skillTargetKey(built.weakestSkillTarget))
      : undefined,
    personalBestCount: built.personalBestCount,
    achievementsUnlocked: built.achievementsUnlocked,
    consistencyPercent: built.consistencyPercent,
    recommendedNextFocus: built.recommendedNextFocus,
    longestStreak: built.longestStreak,
  };
}

async function loadMonthlyReviewData(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  year: number,
  month: number,
) {
  const [user, profile, sessions, logs, skillRatings, userAchievements] =
    await Promise.all([
      ctx.db.get("users", userId),
      ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("practiceSessions")
        .withIndex("by_userId_date", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("exerciseLogs")
        .withIndex("by_userId_date", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("userSkillRatings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("userAchievements")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
    ]);

  if (!user) {
    throw new Error("User not found");
  }

  const achievementsUnlockedIds = userAchievements
    .filter((entry) =>
      isTimestampInMonth(entry.unlockedAt, year, month, user.timezone),
    )
    .map((entry) => entry.achievementId);

  const built = buildMonthlyReview({
    year,
    month,
    timezone: user.timezone,
    sessionsPerWeek: profile?.sessionsPerWeek ?? DEFAULT_SESSIONS_PER_WEEK,
    sessions: sessions.map((session) => ({
      date: session.date,
      estimatedMinutes: session.estimatedMinutes,
      status: session.status,
    })),
    logs: logs.map((log) => ({
      date: log.date,
      isPersonalBest: log.isPersonalBest,
    })),
    skillRatings: skillRatings.map((rating) => ({
      skillTarget: rating.skillTarget,
      skillTargetKey: rating.skillTargetKey,
      label: labelFromSkillTargetKey(rating.skillTargetKey),
      rating: rating.rating,
      trend30Day: rating.trend30Day,
    })),
    achievementsUnlockedThisMonth: achievementsUnlockedIds.length,
    longestStreakDays: user.longestStreakDays ?? 0,
  });

  return { user, built, achievementsUnlockedIds };
}

export const getMonthlyReviewBounds = query({
  args: {},
  returns: v.object({
    currentYear: v.number(),
    currentMonth: v.number(),
    earliestYear: v.number(),
    earliestMonth: v.number(),
  }),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const [sessions, logs] = await Promise.all([
      ctx.db
        .query("practiceSessions")
        .withIndex("by_userId_date", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("exerciseLogs")
        .withIndex("by_userId_date", (q) => q.eq("userId", user._id))
        .collect(),
    ]);

    return computeMonthlyReviewBounds({
      timezone: user.timezone,
      now,
      sessionDates: sessions
        .filter(
          (session) =>
            session.status === "completed" || session.status === "active",
        )
        .map((session) => session.date),
      logDates: logs.map((log) => log.date),
    });
  },
});

export const generateMonthlyReview = mutation({
  args: {
    year: v.number(),
    month: v.number(),
  },
  returns: monthlyReviewValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    if (isFutureMonth(args.year, args.month, user.timezone, now)) {
      throw new Error("Cannot generate review for a future month");
    }

    const { built, achievementsUnlockedIds } = await loadMonthlyReviewData(
      ctx,
      user._id,
      args.year,
      args.month,
    );

    if (built.sessionsCompleted === 0 && built.exercisesCompleted === 0) {
      throw new Error("No practice data for this month");
    }

    const existing = await ctx.db
      .query("monthlyReviews")
      .withIndex("by_userId_year_month", (q) =>
        q.eq("userId", user._id).eq("year", args.year).eq("month", args.month),
      )
      .unique();

    const reviewData = {
      userId: user._id,
      year: built.year,
      month: built.month,
      practiceDays: built.practiceDays,
      totalMinutes: built.totalMinutes,
      sessionsCompleted: built.sessionsCompleted,
      exercisesCompleted: built.exercisesCompleted,
      mostImprovedSkillTarget: built.mostImprovedSkillTarget,
      weakestSkillTarget: built.weakestSkillTarget,
      personalBestCount: built.personalBestCount,
      achievementsUnlocked: achievementsUnlockedIds,
      consistencyPercent: built.consistencyPercent,
      recommendedNextFocus: built.recommendedNextFocus,
    };

    let reviewId: Id<"monthlyReviews">;
    if (existing) {
      await ctx.db.patch("monthlyReviews", existing._id, reviewData);
      reviewId = existing._id;
    } else {
      reviewId = await ctx.db.insert("monthlyReviews", reviewData);
    }

    return formatMonthlyReviewResponse(built, reviewId);
  },
});

export const getMonthlyReview = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  returns: v.union(monthlyReviewValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    if (isFutureMonth(args.year, args.month, user.timezone, now)) {
      return null;
    }

    const { built } = await loadMonthlyReviewData(
      ctx,
      user._id,
      args.year,
      args.month,
    );

    if (built.sessionsCompleted === 0 && built.exercisesCompleted === 0) {
      return null;
    }

    const existing = await ctx.db
      .query("monthlyReviews")
      .withIndex("by_userId_year_month", (q) =>
        q.eq("userId", user._id).eq("year", args.year).eq("month", args.month),
      )
      .unique();

    return formatMonthlyReviewResponse(built, existing?._id);
  },
});
