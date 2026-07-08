import type { ExerciseSeed, ExerciseType, PrimaryProgressMetric, ExerciseStatus } from "./exercise-schema";
import type { FeedbackQuestion, FeedbackQuestionType } from "./feedback-schema";
import { validateTabData } from "../tabs/validate-tab-data";

const VALID_EXERCISE_TYPES = new Set<ExerciseType>([
  "warmup",
  "primary",
  "secondary",
  "accessory",
  "isolation",
  "test",
]);

const VALID_METRICS = new Set<PrimaryProgressMetric>([
  "clean_bpm",
  "accuracy_score",
  "timing_consistency",
  "control_score",
  "clean_reps",
  "endurance_duration",
  "noise_control",
  "comfort_score",
]);

const VALID_STATUSES = new Set<ExerciseStatus>([
  "active",
  "deprecated",
  "replaced",
]);

const VALID_FEEDBACK_TYPES = new Set<FeedbackQuestionType>([
  "segmented",
  "rating",
  "number",
  "boolean",
  "choice",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`validateExercise: "${field}" must be a non-empty string`);
  }
  return value;
}

function requireNonEmptyArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`validateExercise: "${field}" must be a non-empty array`);
  }
  return value;
}

function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    throw new Error(`validateExercise: "${field}" must be an array of strings`);
  }
  return value as string[];
}

function validateFeedbackSchema(value: unknown): FeedbackQuestion[] {
  const arr = requireNonEmptyArray(value, "feedbackSchema");

  return arr.map((item, i) => {
    const path = `feedbackSchema[${i}]`;
    if (!isRecord(item)) {
      throw new Error(`validateExercise: ${path} must be an object`);
    }

    requireNonEmptyString(item.id, `${path}.id`);
    requireNonEmptyString(item.label, `${path}.label`);

    if (!VALID_FEEDBACK_TYPES.has(item.type as FeedbackQuestionType)) {
      throw new Error(
        `validateExercise: ${path}.type is invalid: ${JSON.stringify(item.type)}`,
      );
    }

    if (typeof item.required !== "boolean") {
      throw new Error(`validateExercise: ${path}.required must be a boolean`);
    }

    if (item.options !== undefined) {
      if (!Array.isArray(item.options)) {
        throw new Error(`validateExercise: ${path}.options must be an array if set`);
      }
      item.options.forEach((opt: unknown, j: number) => {
        if (!isRecord(opt)) {
          throw new Error(`validateExercise: ${path}.options[${j}] must be an object`);
        }
        requireNonEmptyString(opt.id, `${path}.options[${j}].id`);
        requireNonEmptyString(opt.label, `${path}.options[${j}].label`);
      });
    }

    if (item.followUpRules !== undefined) {
      if (!Array.isArray(item.followUpRules)) {
        throw new Error(
          `validateExercise: ${path}.followUpRules must be an array if set`,
        );
      }
      item.followUpRules.forEach((rule: unknown, j: number) => {
        if (!isRecord(rule)) {
          throw new Error(
            `validateExercise: ${path}.followUpRules[${j}] must be an object`,
          );
        }
        requireNonEmptyString(rule.ifOptionId, `${path}.followUpRules[${j}].ifOptionId`);
        requireNonEmptyString(
          rule.showQuestionId,
          `${path}.followUpRules[${j}].showQuestionId`,
        );
      });
    }

    return item as FeedbackQuestion;
  });
}

/**
 * Validates unknown data against the ExerciseSeed quality contract.
 * Throws a descriptive error on the first violation found.
 * Returns the typed ExerciseSeed on success.
 */
export function validateExercise(data: unknown): ExerciseSeed {
  if (!isRecord(data)) {
    throw new Error("validateExercise: expected an object");
  }

  // Identity
  requireNonEmptyString(data.title, "title");
  requireNonEmptyString(data.slug, "slug");
  requireNonEmptyString(data.description, "description");

  // Quality contract — all required per spec
  requireNonEmptyString(data.purpose, "purpose");
  requireStringArray(requireNonEmptyArray(data.targetWeaknesses, "targetWeaknesses"), "targetWeaknesses");
  requireNonEmptyString(data.minimumCleanStandard, "minimumCleanStandard");
  requireNonEmptyString(data.measurementInstructions, "measurementInstructions");
  requireStringArray(requireNonEmptyArray(data.coachingNotes, "coachingNotes"), "coachingNotes");

  // Skill linkage
  requireNonEmptyString(data.primarySkillId, "primarySkillId");
  requireStringArray(
    Array.isArray(data.secondarySkillIds) ? data.secondarySkillIds : [],
    "secondarySkillIds",
  );
  if (!Array.isArray(data.secondarySkillIds)) {
    throw new Error('validateExercise: "secondarySkillIds" must be an array');
  }

  // Difficulty & type
  if (
    typeof data.difficultyLevel !== "number" ||
    data.difficultyLevel < 1 ||
    data.difficultyLevel > 10
  ) {
    throw new Error(
      'validateExercise: "difficultyLevel" must be a number between 1 and 10',
    );
  }

  if (!VALID_EXERCISE_TYPES.has(data.exerciseType as ExerciseType)) {
    throw new Error(
      `validateExercise: "exerciseType" is invalid: ${JSON.stringify(data.exerciseType)}`,
    );
  }

  // Progress measurement
  if (!VALID_METRICS.has(data.primaryProgressMetric as PrimaryProgressMetric)) {
    throw new Error(
      `validateExercise: "primaryProgressMetric" is invalid: ${JSON.stringify(data.primaryProgressMetric)}`,
    );
  }

  if (typeof data.supportsBpm !== "boolean") {
    throw new Error('validateExercise: "supportsBpm" must be a boolean');
  }

  if (data.supportsBpm === true) {
    if (typeof data.defaultTargetBpm !== "number" || data.defaultTargetBpm <= 0) {
      throw new Error(
        'validateExercise: "defaultTargetBpm" must be a positive number when supportsBpm is true',
      );
    }
  }

  // Outcome guidance
  requireStringArray(requireNonEmptyArray(data.successCriteria, "successCriteria"), "successCriteria");
  requireStringArray(requireNonEmptyArray(data.commonMistakes, "commonMistakes"), "commonMistakes");
  requireNonEmptyString(data.progressionRule, "progressionRule");
  requireNonEmptyString(data.regressionRule, "regressionRule");

  // Tab — must pass full structural validation
  validateTabData(data.tabData);

  // Feedback schema — must be non-empty and contain a training_verdict question
  const feedbackSchema = validateFeedbackSchema(data.feedbackSchema);
  const hasVerdict = feedbackSchema.some((q) => q.id === "training_verdict");
  if (!hasVerdict) {
    throw new Error(
      'validateExercise: "feedbackSchema" must contain a question with id "training_verdict"',
    );
  }

  // Metadata
  if (
    typeof data.estimatedMinutes !== "number" ||
    data.estimatedMinutes <= 0
  ) {
    throw new Error(
      'validateExercise: "estimatedMinutes" must be a positive number',
    );
  }

  if (typeof data.isMvp !== "boolean") {
    throw new Error('validateExercise: "isMvp" must be a boolean');
  }

  // Versioning
  if (typeof data.version !== "number" || data.version < 1) {
    throw new Error('validateExercise: "version" must be a positive integer');
  }

  if (!VALID_STATUSES.has(data.status as ExerciseStatus)) {
    throw new Error(
      `validateExercise: "status" is invalid: ${JSON.stringify(data.status)}`,
    );
  }

  if (data.replacedBySlug !== undefined) {
    requireNonEmptyString(data.replacedBySlug, "replacedBySlug");
  }

  return data as ExerciseSeed;
}
