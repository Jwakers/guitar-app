import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const RESET_CONFIRMATION = "RESET_LEGACY_TAXONOMY_DATA" as const;
const RESET_ENV_FLAG = "ALLOW_TAXONOMY_RESET" as const;
const DEPLOYMENT_TIER_FLAG = "DEPLOYMENT_TIER" as const;

function assertSafeToReset() {
  const deploymentTier = process.env[DEPLOYMENT_TIER_FLAG];
  if (deploymentTier !== "dev") {
    throw new Error(
      `resetLegacyTaxonomyData refused: ${DEPLOYMENT_TIER_FLAG} must be "dev" on this deployment (got ${JSON.stringify(deploymentTier ?? null)}). Never run on production or unknown environments.`,
    );
  }

  if (process.env[RESET_ENV_FLAG] !== "true") {
    throw new Error(
      `resetLegacyTaxonomyData refused: set ${RESET_ENV_FLAG}=true on this deployment via \`npx convex env set ${RESET_ENV_FLAG} true\` (dev only — never on production). Verify the target deployment before invoking.`,
    );
  }
}

/**
 * Wipes legacy taxonomy data so the new schema can deploy cleanly.
 * Prerequisites: DEPLOYMENT_TIER=dev and ALLOW_TAXONOMY_RESET=true on the dev deployment only.
 * Run once: npx convex run devReset:resetLegacyTaxonomyData '{"confirm":"RESET_LEGACY_TAXONOMY_DATA"}'
 */
export const resetLegacyTaxonomyData = internalMutation({
  args: {
    confirm: v.literal(RESET_CONFIRMATION),
  },
  returns: v.object({
    exercises: v.number(),
    userSkillRatings: v.number(),
    userProfiles: v.number(),
    usersReset: v.number(),
  }),
  handler: async (ctx, _args) => {
    assertSafeToReset();

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
