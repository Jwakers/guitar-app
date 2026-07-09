import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Wipes legacy taxonomy data so the new schema can deploy cleanly.
 * Run once: npx convex run devReset:resetLegacyTaxonomyData
 */
export const resetLegacyTaxonomyData = internalMutation({
  args: {},
  returns: v.object({
    exercises: v.number(),
    userSkillRatings: v.number(),
    userProfiles: v.number(),
    usersReset: v.number(),
  }),
  handler: async (ctx) => {
    let exercises = 0;
    for (const row of await ctx.db.query("exercises").collect()) {
      await ctx.db.delete(row._id);
      exercises++;
    }

    let userSkillRatings = 0;
    for (const row of await ctx.db.query("userSkillRatings").collect()) {
      await ctx.db.delete(row._id);
      userSkillRatings++;
    }

    let userProfiles = 0;
    for (const row of await ctx.db.query("userProfiles").collect()) {
      await ctx.db.delete(row._id);
      userProfiles++;
    }

    let usersReset = 0;
    for (const user of await ctx.db.query("users").collect()) {
      await ctx.db.patch(user._id, { onboardingCompleted: false });
      usersReset++;
    }

    return { exercises, userSkillRatings, userProfiles, usersReset };
  },
});
