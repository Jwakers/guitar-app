import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import {
  tierFromClerkPlanSlug,
} from "../src/lib/subscriptions/entitlements";
import { entitlementsValidator } from "../src/lib/subscriptions/entitlements-convex";
import { requireCurrentUser } from "./lib/auth";
import { getUserEntitlements, getUserTier } from "./lib/subscriptions";

export const getSubscriptionStatus = query({
  args: {},
  returns: v.object({
    tier: v.union(v.literal("free"), v.literal("pro")),
    entitlements: entitlementsValidator,
    isSuperUser: v.boolean(),
    billing: v.optional(
      v.object({
        planSlug: v.string(),
        status: v.string(),
        syncedAt: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const tier = getUserTier(user);
    const entitlements = getUserEntitlements(user);

    const billing =
      user.clerkPlanSlug !== undefined &&
      user.subscriptionStatus !== undefined &&
      user.subscriptionSyncedAt !== undefined
        ? {
            planSlug: user.clerkPlanSlug,
            status: user.subscriptionStatus,
            syncedAt: user.subscriptionSyncedAt,
          }
        : undefined;

    return {
      tier,
      entitlements,
      isSuperUser: user.isSuperUser === true,
      billing,
    };
  },
});

/**
 * Applies Clerk Billing webhook payloads to the cached subscription tier.
 * Production tier changes must flow through this mutation — not client APIs.
 * Dev-only fallback: patch subscriptionTier in the Convex dashboard.
 */
export const syncFromClerkBilling = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkSubscriptionId: v.optional(v.string()),
    clerkPlanSlug: v.optional(v.string()),
    subscriptionStatus: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authProviderId", (q) =>
        q.eq("authProviderId", args.clerkUserId),
      )
      .unique();

    if (!user) {
      console.warn(
        "Clerk billing sync: no Convex user for authProviderId",
        args.clerkUserId,
      );
      throw new Error(
        `Clerk billing sync: user not found for authProviderId ${args.clerkUserId}`,
      );
    }

    const subscriptionTier = tierFromClerkPlanSlug(
      args.clerkPlanSlug,
      args.subscriptionStatus,
    );
    const syncedAt = Date.now();

    await ctx.db.patch("users", user._id, {
      subscriptionTier,
      clerkSubscriptionId: args.clerkSubscriptionId,
      clerkPlanSlug: args.clerkPlanSlug,
      subscriptionStatus: args.subscriptionStatus,
      subscriptionSyncedAt: syncedAt,
    });

    return null;
  },
});
