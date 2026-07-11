import { describe, expect, it } from "vitest";
import {
  buildFeedbackResponses,
  buildObjectiveResult,
  mergeFeedbackResponses,
  resolveTrainingVerdict,
} from "../../../convex/lib/logExerciseResult";
import { FEEDBACK_QUESTION_ID } from "../../../src/lib/practice/feedback-form";
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

  it("mergeFeedbackResponses keeps client subjective and server objective BPM", () => {
    expect(
      mergeFeedbackResponses(
        [
          {
            questionId: "cleanliness",
            value: 4,
            category: "subjective",
          },
          {
            questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
            value: 70,
            category: "objective",
          },
        ],
        "nearly_there",
        88,
        95,
      ),
    ).toEqual([
      { questionId: "cleanliness", value: 4, category: "subjective" },
      {
        questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
        value: 88,
        category: "objective",
      },
      {
        questionId: FEEDBACK_QUESTION_ID.TRAINING_VERDICT,
        value: "nearly_there",
        category: "subjective",
      },
      {
        questionId: FEEDBACK_QUESTION_ID.PEAK_BPM_ATTEMPTED,
        value: 95,
        category: "objective",
      },
    ]);
  });

  it("mergeFeedbackResponses overwrites conflicting client training_verdict with server verdict", () => {
    const merged = mergeFeedbackResponses(
      [
        {
          questionId: FEEDBACK_QUESTION_ID.TRAINING_VERDICT,
          value: "nailed_it",
          category: "subjective",
        },
      ],
      "needs_work",
      80,
    );

    expect(merged).toEqual([
      {
        questionId: FEEDBACK_QUESTION_ID.TRAINING_VERDICT,
        value: "needs_work",
        category: "subjective",
      },
      {
        questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
        value: 80,
        category: "objective",
      },
    ]);
    expect(resolveTrainingVerdict("needs_work", merged)).toBe("needs_work");
  });

  it("mergeFeedbackResponses preserves custom objective client entries", () => {
    expect(
      mergeFeedbackResponses(
        [
          {
            questionId: "custom_metric",
            value: 99,
            category: "objective",
          },
          {
            questionId: "cleanliness",
            value: 3,
            category: "subjective",
          },
        ],
        "nearly_there",
        80,
      ),
    ).toEqual([
      {
        questionId: "custom_metric",
        value: 99,
        category: "objective",
      },
      { questionId: "cleanliness", value: 3, category: "subjective" },
      {
        questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
        value: 80,
        category: "objective",
      },
      {
        questionId: FEEDBACK_QUESTION_ID.TRAINING_VERDICT,
        value: "nearly_there",
        category: "subjective",
      },
    ]);
  });
});
