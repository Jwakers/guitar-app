/**
 * TypeScript types for exercise feedback schemas.
 * Mirrors convex/schema.ts feedbackSchema validator (lines 205–226).
 */

export type FeedbackOption = {
  id: string;
  label: string;
};

export type FollowUpRule = {
  ifOptionId: string;
  showQuestionId: string;
};

export type FeedbackQuestionType =
  | "segmented"
  | "rating"
  | "number"
  | "boolean"
  | "choice";

export type FeedbackQuestion = {
  id: string;
  label: string;
  type: FeedbackQuestionType;
  required: boolean;
  options?: FeedbackOption[];
  followUpRules?: FollowUpRule[];
};
