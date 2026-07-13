import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";
import { DEFAULT_SESSIONS_PER_WEEK } from "../src/lib/training-engine/constants";

const preferredIntensityValidator = v.union(
  v.literal("light"),
  v.literal("moderate"),
  v.literal("hard"),
);

type PreferredIntensity = "light" | "moderate" | "hard";

function asPreferredIntensity(value: string): PreferredIntensity {
  if (value === "light" || value === "moderate" || value === "hard") {
    return value;
  }
  return "moderate";
}

export const getProfileSettings = query({
  args: {},
  returns: v.union(
    v.object({
      defaultSessionLengthMinutes: v.number(),
      preferredIntensity: preferredIntensityValidator,
      sessionsPerWeek: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) return null;

    return {
      defaultSessionLengthMinutes: profile.defaultSessionLengthMinutes,
      preferredIntensity: asPreferredIntensity(profile.preferredIntensity),
      sessionsPerWeek: profile.sessionsPerWeek ?? DEFAULT_SESSIONS_PER_WEEK,
    };
  },
});

export const updateProfileSettings = mutation({
  args: {
    defaultSessionLengthMinutes: v.optional(v.number()),
    preferredIntensity: v.optional(preferredIntensityValidator),
    sessionsPerWeek: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    if (
      args.sessionsPerWeek !== undefined &&
      (args.sessionsPerWeek < 1 || args.sessionsPerWeek > 7)
    ) {
      throw new Error("Sessions per week must be between 1 and 7");
    }

    if (
      args.defaultSessionLengthMinutes !== undefined &&
      (args.defaultSessionLengthMinutes < 15 ||
        args.defaultSessionLengthMinutes > 120)
    ) {
      throw new Error("Session length must be between 15 and 120 minutes");
    }

    const updates: {
      defaultSessionLengthMinutes?: number;
      preferredIntensity?: string;
      sessionsPerWeek?: number;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.defaultSessionLengthMinutes !== undefined) {
      updates.defaultSessionLengthMinutes = args.defaultSessionLengthMinutes;
    }
    if (args.preferredIntensity !== undefined) {
      updates.preferredIntensity = args.preferredIntensity;
    }
    if (args.sessionsPerWeek !== undefined) {
      updates.sessionsPerWeek = args.sessionsPerWeek;
    }

    await ctx.db.patch("userProfiles", profile._id, updates);
    return null;
  },
});
