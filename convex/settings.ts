import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./lib/auth";

export const getProfileSettings = query({
  args: {},
  returns: v.union(
    v.object({
      defaultSessionLengthMinutes: v.number(),
      preferredIntensity: v.string(),
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
      preferredIntensity: profile.preferredIntensity,
      sessionsPerWeek: profile.sessionsPerWeek ?? 7,
    };
  },
});

export const updateProfileSettings = mutation({
  args: {
    defaultSessionLengthMinutes: v.optional(v.number()),
    preferredIntensity: v.optional(v.string()),
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
