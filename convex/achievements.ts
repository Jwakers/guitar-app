import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { ensureAchievementCatalog, loadAchievementCatalog } from "./lib/checkAchievements";

const medalTierValidator = v.union(
  v.literal("bronze"),
  v.literal("silver"),
  v.literal("gold"),
);

export const ensureCatalog = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await requireCurrentUser(ctx);
    const catalog = await ensureAchievementCatalog(ctx);
    return catalog.length;
  },
});

export const listUserAchievements = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("achievements"),
      title: v.string(),
      description: v.string(),
      category: v.string(),
      triggerType: v.string(),
      threshold: v.number(),
      medalTier: medalTierValidator,
      unlockedAt: v.union(v.number(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const catalog = await loadAchievementCatalog(ctx);

    const unlocked = await ctx.db
      .query("userAchievements")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const unlockedByAchievement = new Map(
      unlocked.map((entry) => [entry.achievementId, entry.unlockedAt]),
    );

    return catalog
      .map((achievement) => ({
        _id: achievement._id,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        triggerType: achievement.triggerType,
        threshold: achievement.threshold,
        medalTier: achievement.medalTier,
        unlockedAt: unlockedByAchievement.get(achievement._id) ?? null,
      }))
      .sort((a, b) => {
        if (a.unlockedAt !== null && b.unlockedAt === null) return -1;
        if (a.unlockedAt === null && b.unlockedAt !== null) return 1;
        if (a.unlockedAt !== null && b.unlockedAt !== null) {
          return b.unlockedAt - a.unlockedAt;
        }
        return a.title.localeCompare(b.title);
      });
  },
});
