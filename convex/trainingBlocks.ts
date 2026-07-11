import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import {
  coreSkillValidator,
  subSkillValidator,
} from "./lib/exerciseValidators";
import { getActiveBlock } from "./lib/provisionTraining";

export const getCurrentBlock = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("trainingBlocks"),
      _creationTime: v.number(),
      userId: v.id("users"),
      title: v.string(),
      blockType: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      durationWeeks: v.number(),
      primaryGoal: v.string(),
      focusCoreSkillIds: v.array(coreSkillValidator),
      focusSubSkillIds: v.array(subSkillValidator),
      supportCoreSkillIds: v.array(coreSkillValidator),
      supportSubSkillIds: v.array(subSkillValidator),
      status: v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("abandoned"),
      ),
      currentWeek: v.number(),
      intensity: v.string(),
      deloadWeek: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    return await getActiveBlock(ctx, user._id);
  },
});
