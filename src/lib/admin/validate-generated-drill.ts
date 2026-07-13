import { normalizeExerciseSeed } from "@/lib/admin/exercise-seed-zod";
import {
  isTaxonomyValidationError,
  pinExerciseTaxonomy,
  type TaxonomyConstraints,
} from "@/lib/admin/pin-exercise-taxonomy";
import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";
import { validateExercise } from "@/lib/exercises/validate-exercise";

export type ValidateGeneratedDrillResult =
  | {
      ok: true;
      exercise: ExerciseSeed;
      taxonomyPinned: boolean;
      pinnedFields: string[];
    }
  | {
      ok: false;
      validationError: string;
      taxonomyPinned: boolean;
      pinnedFields: string[];
      rawExercise: Record<string, unknown>;
    };

export function prepareExerciseForValidation(
  rawExercise: unknown,
  constraints: TaxonomyConstraints,
): {
  exercise: Record<string, unknown>;
  taxonomyPinned: boolean;
  pinnedFields: string[];
} {
  const normalized = normalizeExerciseSeed(rawExercise) as Record<string, unknown>;
  const pinned = pinExerciseTaxonomy(normalized, constraints);
  return {
    exercise: pinned.exercise,
    taxonomyPinned: pinned.taxonomyPinned,
    pinnedFields: pinned.pinnedFields,
  };
}

export function validateGeneratedDrill(
  rawExercise: unknown,
  constraints: TaxonomyConstraints,
): ValidateGeneratedDrillResult {
  const { exercise, taxonomyPinned, pinnedFields } =
    prepareExerciseForValidation(rawExercise, constraints);

  try {
    return {
      ok: true,
      exercise: validateExercise(exercise),
      taxonomyPinned,
      pinnedFields,
    };
  } catch (err) {
    return {
      ok: false,
      validationError: err instanceof Error ? err.message : String(err),
      taxonomyPinned,
      pinnedFields,
      rawExercise: exercise,
    };
  }
}

export function shouldAttemptLlmRepair(validationError: string): boolean {
  return !isTaxonomyValidationError(validationError);
}
