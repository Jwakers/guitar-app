import { v } from "convex/values";
import type { Entitlements } from "./entitlements";

/** Convex validator for {@link Entitlements} — keep fields aligned with entitlements.ts */
export const entitlementsValidator = v.object({
  tier: v.union(v.literal("free"), v.literal("pro")),
  trainingSessions: v.boolean(),
  monthlyReviewHistory: v.boolean(),
  skillExerciseHistoryFull: v.boolean(),
  skillExerciseHistoryLimit: v.union(v.number(), v.null()),
});
