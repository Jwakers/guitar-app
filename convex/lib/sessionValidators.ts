import { v } from "convex/values";

export const sessionSlotTypeValidator = v.union(
  v.literal("warmup"),
  v.literal("primary"),
  v.literal("secondary"),
  v.literal("accessory"),
  v.literal("isolation"),
  v.literal("test"),
  v.literal("maintenance"),
);

export const trainingVerdict = v.union(
  v.literal("nailed_it"),
  v.literal("nearly_there"),
  v.literal("needs_work"),
);
