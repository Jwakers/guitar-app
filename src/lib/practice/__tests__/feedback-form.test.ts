import { describe, expect, it } from "vitest";
import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";
import {
  buildResponsesFromAnswers,
  getVisibleQuestions,
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
      training_verdict: "nailed_it",
      actual_bpm: 92,
    });
    expect(buildResponsesFromAnswers(visible, {
      training_verdict: "nailed_it",
      actual_bpm: 92,
    })).toEqual([
      {
        questionId: "training_verdict",
        value: "nailed_it",
        category: "subjective",
      },
      { questionId: "actual_bpm", value: 92, category: "objective" },
    ]);
  });
});
