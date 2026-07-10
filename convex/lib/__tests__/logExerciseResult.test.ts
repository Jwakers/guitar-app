import { describe, expect, it } from "vitest";
import {
  buildFeedbackResponses,
  buildObjectiveResult,
} from "../../../convex/lib/logExerciseResult";
import type { Doc } from "../../../convex/_generated/dataModel";

const exercise = {
  primaryProgressMetric: "clean_bpm",
} as Doc<"exercises">;

const sessionItem = {
  targetBpm: 80,
  targetValue: undefined,
} as Parameters<typeof buildObjectiveResult>[1];

describe("logExerciseResult helpers", () => {
  it("buildObjectiveResult maps clean BPM", () => {
    expect(buildObjectiveResult(exercise, sessionItem, 92)).toEqual({
      metric: "clean_bpm",
      targetValue: 80,
      actualValue: 92,
      unit: "bpm",
    });
  });

  it("buildFeedbackResponses includes verdict and peak audit", () => {
    expect(
      buildFeedbackResponses("nailed_it", 88, 95),
    ).toEqual([
      { questionId: "actual_bpm", value: 88, category: "objective" },
      {
        questionId: "training_verdict",
        value: "nailed_it",
        category: "subjective",
      },
      {
        questionId: "peak_bpm_attempted",
        value: 95,
        category: "objective",
      },
    ]);
  });
});
