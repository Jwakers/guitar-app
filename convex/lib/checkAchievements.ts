import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  evaluateNewlyUnlockedAchievements,
  MVP_ACHIEVEMENTS,
  type UserAchievementStats,
} from "../../src/lib/training-engine/achievements";

export async function loadAchievementCatalog(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"achievements">[]> {
  return await ctx.db.query("achievements").collect();
}

async function seedAchievementCatalog(
  ctx: MutationCtx,
): Promise<Doc<"achievements">[]> {
  const inserted: Doc<"achievements">[] = [];
  for (const seed of MVP_ACHIEVEMENTS) {
    const id = await ctx.db.insert("achievements", {
      ...seed,
      isMvp: true,
    });
    const doc = await ctx.db.get("achievements", id);
    if (doc) {
      inserted.push(doc);
    }
  }

  return inserted;
}

export async function ensureAchievementCatalog(
  ctx: MutationCtx,
): Promise<Doc<"achievements">[]> {
  const existing = await loadAchievementCatalog(ctx);
  if (existing.length > 0) {
    return existing;
  }

  return await seedAchievementCatalog(ctx);
}

export async function loadUserAchievementStats(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<UserAchievementStats> {
  const [completedSessions, personalBestLogs, skillRatings, user] =
    await Promise.all([
      ctx.db
        .query("practiceSessions")
        .withIndex("by_userId_status", (q) =>
          q.eq("userId", userId).eq("status", "completed"),
        )
        .collect(),
      ctx.db
        .query("exerciseLogs")
        .withIndex("by_userId_date", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("userSkillRatings")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db.get("users", userId),
    ]);

  const personalBestCount = personalBestLogs.filter(
    (log) => log.isPersonalBest,
  ).length;

  const maxSkillRating =
    skillRatings.length > 0
      ? Math.max(...skillRatings.map((rating) => rating.rating))
      : 0;

  return {
    sessionsCompleted: completedSessions.length,
    currentStreakDays: user?.currentStreakDays ?? 0,
    personalBestCount,
    maxSkillRating,
  };
}

export async function checkAndUnlockAchievements(
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
  statsOverride?: UserAchievementStats,
): Promise<Id<"achievements">[]> {
  const catalog = await ensureAchievementCatalog(ctx);
  const stats = statsOverride ?? (await loadUserAchievementStats(ctx, userId));

  const unlocked = await ctx.db
    .query("userAchievements")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const unlockedIds = new Set(unlocked.map((entry) => entry.achievementId));

  const newlyUnlocked = evaluateNewlyUnlockedAchievements(
    catalog.map((achievement) => ({
      _id: achievement._id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      triggerType: achievement.triggerType as
        | "sessions_completed"
        | "streak_days"
        | "personal_bests"
        | "skill_milestone",
      threshold: achievement.threshold,
      medalTier: achievement.medalTier,
    })),
    unlockedIds,
    stats,
  );

  const unlockedThisRun: Id<"achievements">[] = [];

  for (const achievement of newlyUnlocked) {
    const achievementId = achievement._id as Id<"achievements">;
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId_achievementId", (q) =>
        q.eq("userId", userId).eq("achievementId", achievementId),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("userAchievements", {
        userId,
        achievementId,
        unlockedAt: now,
      });
      unlockedThisRun.push(achievementId);
    }
  }

  return unlockedThisRun;
}
