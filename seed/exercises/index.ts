import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";
import { validateExercise } from "../../src/lib/exercises/validate-exercise";
import { alternatePickingExercises } from "./alternate-picking";
import { frettingAccuracyExercises } from "./fretting-accuracy";
import { stringCrossingExercises } from "./string-crossing";
import { stringSkippingExercises } from "./string-skipping";

export const ALL_EXERCISES: ExerciseSeed[] = [
  ...alternatePickingExercises,
  ...stringSkippingExercises,
  ...stringCrossingExercises,
  ...frettingAccuracyExercises,
];

// Validate every exercise at module load time.
// Any broken seed throws immediately, catching errors before they reach Convex.
ALL_EXERCISES.forEach((exercise) => {
  validateExercise(exercise);
});
