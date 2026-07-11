import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getWeeklyPlanForBlockWeek(
  ctx: QueryCtx | MutationCtx,
  blockId: Id<"trainingBlocks">,
  weekNumber: number,
) {
  return await ctx.db
    .query("weeklyPlans")
    .withIndex("by_blockId_weekNumber", (q) =>
      q.eq("blockId", blockId).eq("weekNumber", weekNumber),
    )
    .first();
}
