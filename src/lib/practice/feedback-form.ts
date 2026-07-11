import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";

export type FeedbackAnswerValue = string | number | boolean;

export type FeedbackAnswers = Record<string, FeedbackAnswerValue | undefined>;

export type FeedbackResponseEntry = {
  questionId: string;
  value: FeedbackAnswerValue;
  category: "objective" | "subjective";
};

const OBJECTIVE_QUESTION_IDS = new Set([
  "actual_bpm",
  "peak_bpm_attempted",
  "clean_reps",
  "endurance_duration",
]);

export function isDeferredQuestion(questionId: string): boolean {
  return questionId === "actual_bpm";
}

export function isBpmExercise(exercise: {
  supportsBpm: boolean;
  primaryProgressMetric: string;
}): boolean {
  return (
    exercise.supportsBpm || exercise.primaryProgressMetric === "clean_bpm"
  );
}

export function schemaHasBpmQuestion(schema: FeedbackQuestion[]): boolean {
  return schema.some((q) => q.id === "actual_bpm");
}

export function getVisibleQuestions(
  schema: FeedbackQuestion[],
  answers: FeedbackAnswers,
): FeedbackQuestion[] {
  const targeted = new Set(
    schema.flatMap((q) => q.followUpRules?.map((r) => r.showQuestionId) ?? []),
  );
  const visibleIds = new Set<string>();

  for (const question of schema) {
    if (!targeted.has(question.id)) {
      visibleIds.add(question.id);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const question of schema) {
      if (!visibleIds.has(question.id)) continue;
      const answer = answers[question.id];
      if (answer === undefined) continue;

      const answerId = String(answer);
      for (const rule of question.followUpRules ?? []) {
        if (
          rule.ifOptionId === answerId &&
          !visibleIds.has(rule.showQuestionId)
        ) {
          visibleIds.add(rule.showQuestionId);
          changed = true;
        }
      }
    }
  }

  return schema.filter((q) => visibleIds.has(q.id));
}

export function getRenderableQuestions(
  schema: FeedbackQuestion[],
  answers: FeedbackAnswers,
): FeedbackQuestion[] {
  return getVisibleQuestions(schema, answers).filter(
    (q) => !isDeferredQuestion(q.id),
  );
}

export function categorizeQuestion(
  question: FeedbackQuestion,
): "objective" | "subjective" {
  if (OBJECTIVE_QUESTION_IDS.has(question.id)) {
    return "objective";
  }
  if (question.type === "number") {
    return "objective";
  }
  return "subjective";
}

export function validateRequired(
  visible: FeedbackQuestion[],
  answers: FeedbackAnswers,
  options?: { excludeDeferred?: boolean },
): string | null {
  const excludeDeferred = options?.excludeDeferred ?? false;

  for (const question of visible) {
    if (excludeDeferred && isDeferredQuestion(question.id)) {
      continue;
    }
    if (!question.required) continue;

    const value = answers[question.id];
    if (value === undefined || value === "") {
      return `${question.label} is required`;
    }
  }

  return null;
}

export function buildResponsesFromAnswers(
  visible: FeedbackQuestion[],
  answers: FeedbackAnswers,
): FeedbackResponseEntry[] {
  const responses: FeedbackResponseEntry[] = [];

  for (const question of visible) {
    const value = answers[question.id];
    if (value === undefined) continue;

    responses.push({
      questionId: question.id,
      value,
      category: categorizeQuestion(question),
    });
  }

  return responses;
}

export function extractTrainingVerdict(
  answers: FeedbackAnswers,
): "nailed_it" | "nearly_there" | "needs_work" | undefined {
  const value = answers.training_verdict;
  if (
    value === "nailed_it" ||
    value === "nearly_there" ||
    value === "needs_work"
  ) {
    return value;
  }
  return undefined;
}

export function extractActualBpm(answers: FeedbackAnswers): number | undefined {
  const value = answers.actual_bpm;
  return typeof value === "number" ? value : undefined;
}
