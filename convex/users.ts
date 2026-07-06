import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrNull } from "./lib/auth";

export const createOrUpdateUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_authProviderId", (q) =>
        q.eq("authProviderId", identity.subject),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      authProviderId: identity.subject,
      email: identity.email ?? undefined,
      displayName: identity.name ?? identity.email ?? "Guitarist",
      onboardingCompleted: false,
      subscriptionTier: "free",
      timezone: "UTC",
    });
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      authProviderId: v.string(),
      email: v.optional(v.string()),
      displayName: v.optional(v.string()),
      onboardingCompleted: v.boolean(),
      subscriptionTier: v.string(),
      timezone: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});
