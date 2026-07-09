import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";
import { validateExercise } from "../../src/lib/exercises/validate-exercise";
import { alternatePickingExercises } from "./alternate-picking";
import { stringSkippingExercises } from "./string-skipping";

export const ALL_EXERCISES: ExerciseSeed[] = [
  ...alternatePickingExercises,
  ...stringSkippingExercises,
];

// Validate every exercise at module load time.
// Any broken seed throws immediately, catching errors before they reach Convex.
ALL_EXERCISES.forEach((exercise) => {
  validateExercise(exercise);
});
