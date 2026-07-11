import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import {
  coreSkillValidator,
  subSkillValidator,
} from "./lib/exerciseValidators";
import { skillTargetKey } from "../src/lib/skills/taxonomy";
import { provisionInitialTraining } from "./lib/provisionTraining";

type SkillRatingStatus = "weak" | "developing" | "stable" | "strong";

const skillTargetValidator = v.union(
  v.object({ kind: v.literal("core"), id: coreSkillValidator }),
  v.object({ kind: v.literal("sub"), id: subSkillValidator }),
);

function deriveStatus(rating: 1 | 2 | 3 | 4 | 5): SkillRatingStatus {
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
      focusCoreSkillIds: v.array(coreSkillValidator),
      focusSubSkillIds: v.array(subSkillValidator),
      availableDays: v.array(v.string()),
      defaultSessionLengthMinutes: v.number(),
      preferredIntensity: v.string(),
      dataTonePreference: v.string(),
    }),
    skillRatings: v.array(
      v.object({
        skillTarget: skillTargetValidator,
        rating: v.union(
          v.literal(1),
          v.literal(2),
          v.literal(3),
          v.literal(4),
          v.literal(5),
        ),
      }),
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
    for (const { skillTarget, rating } of args.skillRatings) {
      const key = skillTargetKey(skillTarget);
      const existing = await ctx.db
        .query("userSkillRatings")
        .withIndex("by_userId_skillTargetKey", (q) =>
          q.eq("userId", user._id).eq("skillTargetKey", key),
        )
        .unique();

      const ratingData = {
        userId: user._id,
        skillTargetKey: key,
        skillTarget,
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

    // Provision training block, week-1 plan, and first session (idempotent)
    await provisionInitialTraining(ctx, user._id, now);

    // Mark onboarding complete
    await ctx.db.patch(user._id, { onboardingCompleted: true });

    return user._id;
  },
});
