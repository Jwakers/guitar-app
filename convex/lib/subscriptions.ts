import type { Doc } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import {
  effectiveTier,
  getEntitlements,
  requireEntitlement,
  tierFromClerkPlanSlug,
  type EntitlementCapability,
  type SubscriptionTier,
} from "../../src/lib/subscriptions/entitlements";
import { requireCurrentUser } from "./auth";

export function getUserTier(user: Doc<"users">): SubscriptionTier {
  return effectiveTier(user);
}

export function getUserEntitlements(user: Doc<"users">) {
  return getEntitlements(getUserTier(user));
}

export function assertEntitlement(
  user: Doc<"users">,
  capability: EntitlementCapability,
): void {
  requireEntitlement(
    {
      subscriptionTier: user.subscriptionTier,
      isSuperUser: user.isSuperUser,
    },
    capability,
  );
}

export async function requireEntitledUser(
  ctx: QueryCtx | MutationCtx,
  capability: EntitlementCapability,
): Promise<Doc<"users">> {
  const user = await requireCurrentUser(ctx);
  assertEntitlement(user, capability);
  return user;
}
