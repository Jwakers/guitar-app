import { describe, expect, it } from "vitest";
import {
  FREE_SKILL_EXERCISE_HISTORY_LIMIT,
  getEntitlements,
  hasEntitlement,
  requireEntitlement,
  upgradeRequiredError,
} from "../entitlements";

describe("getEntitlements", () => {
  it("grants pro capabilities for pro tier", () => {
    expect(getEntitlements("pro")).toEqual({
      tier: "pro",
      trainingSessions: true,
      monthlyReviewHistory: true,
      skillExerciseHistoryFull: true,
      skillExerciseHistoryLimit: null,
    });
  });

  it("limits free tier capabilities", () => {
    expect(getEntitlements("free")).toEqual({
      tier: "free",
      trainingSessions: false,
      monthlyReviewHistory: false,
      skillExerciseHistoryFull: false,
      skillExerciseHistoryLimit: FREE_SKILL_EXERCISE_HISTORY_LIMIT,
    });
  });
});

describe("hasEntitlement", () => {
  it("does not bypass subscription gates for super users", () => {
    expect(
      hasEntitlement(
        { subscriptionTier: "free", isSuperUser: true },
        "training_sessions",
      ),
    ).toBe(false);
  });

  it("denies training sessions for free users", () => {
    expect(
      hasEntitlement({ subscriptionTier: "free" }, "training_sessions"),
    ).toBe(false);
  });
});

describe("requireEntitlement", () => {
  it("throws a stable upgrade error code", () => {
    expect(() =>
      requireEntitlement({ subscriptionTier: "free" }, "training_sessions"),
    ).toThrow(upgradeRequiredError("training_sessions"));
  });
});
