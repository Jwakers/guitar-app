import { describe, expect, it } from "vitest";
import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";
import {
  buildResponsesFromAnswers,
  extractActualBpm,
  extractTrainingVerdict,
  FEEDBACK_QUESTION_ID,
  getVisibleQuestions,
  isBpmExercise,
  schemaHasBpmQuestion,
  normalizeClientFeedbackResponse,
  validateRequired,
} from "../feedback-form";

const schema: FeedbackQuestion[] = [
  {
    id: "training_verdict",
    label: "Training Verdict",
    type: "segmented",
    required: true,
    options: [
      { id: "nailed_it", label: "Nailed It" },
      { id: "needs_work", label: "Needs Work" },
    ],
    followUpRules: [
      { ifOptionId: "needs_work", showQuestionId: "breakdown_cause" },
    ],
  },
  {
    id: "breakdown_cause",
    label: "What broke down?",
    type: "choice",
    required: true,
    options: [{ id: "too_fast", label: "Too fast" }],
  },
  {
    id: "actual_bpm",
    label: "Clean BPM",
    type: "number",
    required: true,
  },
];

describe("feedback-form", () => {
  it("getVisibleQuestions shows roots without follow-up trigger", () => {
    expect(getVisibleQuestions(schema, {}).map((q) => q.id)).toEqual([
      "training_verdict",
      "actual_bpm",
    ]);
  });

  it("getVisibleQuestions reveals follow-up when rule matches", () => {
    const visible = getVisibleQuestions(schema, {
      training_verdict: "needs_work",
    });
    expect(visible.map((q) => q.id)).toEqual([
      "training_verdict",
      "breakdown_cause",
      "actual_bpm",
    ]);
  });

  it("validateRequired reports missing required fields", () => {
    const visible = getVisibleQuestions(schema, {});
    expect(validateRequired(visible, {})).toBe("Training Verdict is required");
  });

  it("buildResponsesFromAnswers categorises objective vs subjective", () => {
    const visible = getVisibleQuestions(schema, {
      [FEEDBACK_QUESTION_ID.TRAINING_VERDICT]: "nailed_it",
      [FEEDBACK_QUESTION_ID.ACTUAL_BPM]: 92,
    });
    expect(buildResponsesFromAnswers(visible, {
      [FEEDBACK_QUESTION_ID.TRAINING_VERDICT]: "nailed_it",
      [FEEDBACK_QUESTION_ID.ACTUAL_BPM]: 92,
    })).toEqual([
      {
        questionId: FEEDBACK_QUESTION_ID.TRAINING_VERDICT,
        value: "nailed_it",
        category: "subjective",
      },
      {
        questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
        value: 92,
        category: "objective",
      },
    ]);
  });

  it("isBpmExercise detects BPM-capable exercises", () => {
    expect(
      isBpmExercise({ supportsBpm: true, primaryProgressMetric: "clean_reps" }),
    ).toBe(true);
    expect(
      isBpmExercise({ supportsBpm: false, primaryProgressMetric: "clean_bpm" }),
    ).toBe(true);
    expect(
      isBpmExercise({ supportsBpm: false, primaryProgressMetric: "clean_reps" }),
    ).toBe(false);
  });

  it("schemaHasBpmQuestion detects actual_bpm in schema", () => {
    expect(schemaHasBpmQuestion(schema)).toBe(true);
    expect(
      schemaHasBpmQuestion([
        {
          id: FEEDBACK_QUESTION_ID.TRAINING_VERDICT,
          label: "Verdict",
          type: "segmented",
          required: true,
        },
      ]),
    ).toBe(false);
  });

  it("extractTrainingVerdict returns valid verdicts only", () => {
    expect(
      extractTrainingVerdict({
        [FEEDBACK_QUESTION_ID.TRAINING_VERDICT]: "nearly_there",
      }),
    ).toBe("nearly_there");
    expect(
      extractTrainingVerdict({
        [FEEDBACK_QUESTION_ID.TRAINING_VERDICT]: "invalid",
      }),
    ).toBeUndefined();
    expect(extractTrainingVerdict({})).toBeUndefined();
  });

  it("normalizeClientFeedbackResponse normalizes server-managed categories", () => {
    expect(
      normalizeClientFeedbackResponse({
        questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
        value: 80,
        category: "subjective",
      }),
    ).toEqual({
      questionId: FEEDBACK_QUESTION_ID.ACTUAL_BPM,
      value: 80,
      category: "objective",
    });
    expect(
      normalizeClientFeedbackResponse({
        questionId: "custom_metric",
        value: 99,
        category: "objective",
      }),
    ).toEqual({
      questionId: "custom_metric",
      value: 99,
      category: "objective",
    });
  });

  it("extractActualBpm returns numeric BPM only", () => {
    expect(
      extractActualBpm({ [FEEDBACK_QUESTION_ID.ACTUAL_BPM]: 92 }),
    ).toBe(92);
    expect(
      extractActualBpm({ [FEEDBACK_QUESTION_ID.ACTUAL_BPM]: "92" }),
    ).toBeUndefined();
    expect(extractActualBpm({})).toBeUndefined();
  });
});
