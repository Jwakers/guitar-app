import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { updateStreak } from "../../src/lib/training-engine/streaks";

export type ApplyStreakResult = {
  streakUpdated: boolean;
  currentStreakDays: number;
  longestStreakDays: number;
};

export async function applyUserStreakUpdate(
  ctx: MutationCtx,
  user: Doc<"users">,
  practiceDate: string,
): Promise<ApplyStreakResult> {
  const practiceDateMs = Date.parse(`${practiceDate}T12:00:00Z`);
  const result = updateStreak({
    lastPracticeDate: user.lastPracticeDate,
    currentStreakDays: user.currentStreakDays ?? 0,
    longestStreakDays: user.longestStreakDays ?? 0,
    practiceDate,
    practiceDateMs,
    timezone: user.timezone,
  });

  if (result.streakIncremented) {
    await ctx.db.patch("users", user._id, {
      lastPracticeDate: result.lastPracticeDate,
      currentStreakDays: result.currentStreakDays,
      longestStreakDays: result.longestStreakDays,
    });
  } else if (!user.lastPracticeDate) {
    await ctx.db.patch("users", user._id, {
      lastPracticeDate: result.lastPracticeDate,
      currentStreakDays: result.currentStreakDays,
      longestStreakDays: result.longestStreakDays,
    });
  }

  return {
    streakUpdated: result.streakIncremented,
    currentStreakDays: result.currentStreakDays,
    longestStreakDays: result.longestStreakDays,
  };
}
