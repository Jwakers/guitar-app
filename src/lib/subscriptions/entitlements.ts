export type SubscriptionTier = "free" | "pro";

export type EntitlementCapability =
  | "training_sessions"
  | "monthly_review_history"
  | "skill_exercise_history";

export type Entitlements = {
  tier: SubscriptionTier;
  trainingSessions: boolean;
  monthlyReviewHistory: boolean;
  skillExerciseHistoryFull: boolean;
  skillExerciseHistoryLimit: number | null;
};

export const FREE_SKILL_EXERCISE_HISTORY_LIMIT = 20;

export const PRO_CLERK_PLAN_SLUG = "pro";

/** Clerk subscription statuses that grant Pro access for the pro plan. */
const PRO_GRANTING_STATUSES = new Set([
  "active",
  "trialing",
]);

export function getEntitlements(tier: SubscriptionTier): Entitlements {
  if (tier === "pro") {
    return {
      tier,
      trainingSessions: true,
      monthlyReviewHistory: true,
      skillExerciseHistoryFull: true,
      skillExerciseHistoryLimit: null,
    };
  }

  return {
    tier,
    trainingSessions: false,
    monthlyReviewHistory: false,
    skillExerciseHistoryFull: false,
    skillExerciseHistoryLimit: FREE_SKILL_EXERCISE_HISTORY_LIMIT,
  };
}

export function tierFromClerkPlanSlug(
  planSlug: string | undefined | null,
  status: string | undefined | null,
): SubscriptionTier {
  if (
    planSlug === PRO_CLERK_PLAN_SLUG &&
    status !== undefined &&
    status !== null &&
    PRO_GRANTING_STATUSES.has(status)
  ) {
    return "pro";
  }

  return "free";
}

export function upgradeRequiredError(capability: EntitlementCapability): string {
  return `UPGRADE_REQUIRED:${capability}`;
}

export function isUpgradeRequiredError(message: string): boolean {
  return message.startsWith("UPGRADE_REQUIRED:");
}

type EntitlementUser = {
  subscriptionTier: SubscriptionTier;
  isSuperUser?: boolean;
};

export function effectiveTier(user: EntitlementUser): SubscriptionTier {
  return user.subscriptionTier;
}

export function hasEntitlement(
  user: EntitlementUser,
  capability: EntitlementCapability,
): boolean {
  const entitlements = getEntitlements(effectiveTier(user));

  switch (capability) {
    case "training_sessions":
      return entitlements.trainingSessions;
    case "monthly_review_history":
      return entitlements.monthlyReviewHistory;
    case "skill_exercise_history":
      return entitlements.skillExerciseHistoryFull;
    default: {
      const _exhaustive: never = capability;
      return _exhaustive;
    }
  }
}

export function requireEntitlement(
  user: EntitlementUser,
  capability: EntitlementCapability,
): void {
  if (!hasEntitlement(user, capability)) {
    throw new Error(upgradeRequiredError(capability));
  }
}
