import { describe, expect, it } from "vitest";
import { generateTargets } from "../generate-targets";
import type { ExerciseCandidate, UserExerciseStateSnapshot } from "../types";
import type { Id } from "../../../../convex/_generated/dataModel";

const exerciseId = "ex1" as Id<"exercises">;

const exercise: ExerciseCandidate = {
  _id: exerciseId,
  title: "Alternate Picking",
  slug: "alternate-picking",
  coreSkillId: "picking",
  subSkillIds: ["alternate_picking"],
  exerciseType: "primary",
  difficultyLevel: 3,
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  estimatedMinutes: 10,
  isMvp: true,
  status: "active",
};

const userState: UserExerciseStateSnapshot = {
  exerciseId,
  reliablePerformance: { metric: "clean_bpm", value: 92, unit: "bpm" },
  peakPerformance: { metric: "clean_bpm", value: 100, unit: "bpm" },
  recentVerdicts: ["nailed_it"],
  consecutiveNailed: 1,
  consecutiveNeedsWork: 0,
  progressionReady: true,
  regressionRecommended: false,
};

describe("generateTargets", () => {
  it("falls back to defaultTargetBpm without user state", () => {
    expect(generateTargets(exercise, { sessionType: "standard" }).targetBpm).toBe(
      80,
    );
  });

  it("uses reliable performance and progression step instead of peak", () => {
    expect(
      generateTargets(exercise, {
        sessionType: "standard",
        userState,
      }).targetBpm,
    ).toBe(97);
  });

  it("reduces adaptive targets on deload sessions", () => {
    expect(
      generateTargets(exercise, {
        sessionType: "deload",
        userState,
      }).targetBpm,
    ).toBe(82);
  });
});
