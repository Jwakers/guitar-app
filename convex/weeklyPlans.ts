import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { getActiveBlock } from "./lib/provisionTraining";

export const getCurrentWeeklyPlan = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("weeklyPlans"),
      _creationTime: v.number(),
      blockId: v.id("trainingBlocks"),
      userId: v.id("users"),
      weekNumber: v.number(),
      startDate: v.number(),
      endDate: v.number(),
      theme: v.string(),
      targetSessionCount: v.number(),
      plannedSessionIds: v.array(v.id("practiceSessions")),
      status: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const block = await getActiveBlock(ctx, user._id);
    if (!block) return null;

    return (
      await ctx.db
        .query("weeklyPlans")
        .withIndex("by_userId_startDate", (q) => q.eq("userId", user._id))
        .collect()
    ).find(
      (p) => p.blockId === block._id && p.weekNumber === block.currentWeek,
    ) ?? null;
  },
});
