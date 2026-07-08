import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";

function deriveStatus(rating: number): string {
  if (rating <= 2) return "weak";
  if (rating === 3) return "developing";
  if (rating === 4) return "stable";
  return "strong";
}

/**
 * Persists all onboarding answers atomically.
 * - Upserts userProfiles
 * - Upserts userSkillRatings for every rated skill (1–5 → 20–100)
 * - Sets users.onboardingCompleted = true
 *
 * Safe to call multiple times — subsequent calls update existing records.
 */
export const saveOnboardingAnswers = mutation({
  args: {
    profile: v.object({
      experienceLevel: v.string(),
      guitarType: v.string(),
      primaryGoals: v.array(v.string()),
      focusSkills: v.array(v.string()),
      availableDays: v.array(v.string()),
      defaultSessionLengthMinutes: v.number(),
      preferredIntensity: v.string(),
      dataTonePreference: v.string(),
    }),
    skillRatings: v.array(
      v.object({ skillId: v.id("skills"), rating: v.number() }), // rating 1–5
    ),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    // Upsert userProfiles
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    const profileData = {
      userId: user._id,
      ...args.profile,
      updatedAt: now,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
    } else {
      await ctx.db.insert("userProfiles", profileData);
    }

    // Upsert userSkillRatings
    for (const { skillId, rating } of args.skillRatings) {
      const existing = await ctx.db
        .query("userSkillRatings")
        .withIndex("by_userId_skillId", (q) =>
          q.eq("userId", user._id).eq("skillId", skillId),
        )
        .unique();

      const ratingData = {
        userId: user._id,
        skillId,
        rating: rating * 20, // 1–5 → 20–100
        confidence: 0.5,
        lastAssessedAt: now,
        status: deriveStatus(rating),
      };

      if (existing) {
        await ctx.db.patch(existing._id, ratingData);
      } else {
        await ctx.db.insert("userSkillRatings", ratingData);
      }
    }

    // Mark onboarding complete
    await ctx.db.patch(user._id, { onboardingCompleted: true });

    return user._id;
  },
});
