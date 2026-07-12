import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { countTerminalItems } from "./sessionLifecycle";
import { applyUserStreakUpdate } from "./streaks";
import {
  checkAndUnlockAchievements,
  loadUserAchievementStats,
} from "./checkAchievements";

export type SessionSummaryData = {
  durationMinutes: number;
  completedExerciseCount: number;
  skillRatingChanges: NonNullable<
    Doc<"practiceSessions">["pendingSkillRatingChanges"]
  >;
  personalBests: Id<"exerciseLogs">[];
  streakUpdated: boolean;
  xpAwarded: number;
  achievementsUnlocked: Id<"achievements">[];
};

export async function buildSessionSummary(
  ctx: MutationCtx,
  user: Doc<"users">,
  session: Doc<"practiceSessions">,
  now: number,
): Promise<SessionSummaryData> {
  const completedCount = countTerminalItems(session.exerciseItems);

  const logs = await ctx.db
    .query("exerciseLogs")
    .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
    .collect();

  const personalBests = logs
    .filter((log) => log.isPersonalBest)
    .map((log) => log._id);

  const streakResult = await applyUserStreakUpdate(ctx, user, session.date);

  const stats = await loadUserAchievementStats(ctx, user._id);
  const achievementsUnlocked = await checkAndUnlockAchievements(
    ctx,
    user._id,
    now,
    stats,
  );

  return {
    durationMinutes: session.estimatedMinutes,
    completedExerciseCount: completedCount,
    skillRatingChanges: session.pendingSkillRatingChanges ?? [],
    personalBests,
    streakUpdated: streakResult.streakUpdated,
    xpAwarded: completedCount * 10,
    achievementsUnlocked,
  };
}
