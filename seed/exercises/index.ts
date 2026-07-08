import { validateExercise } from "../../src/lib/exercises/validate-exercise";
import { alternatePickingExercises } from "./alternate-picking";
import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const ALL_EXERCISES: ExerciseSeed[] = [...alternatePickingExercises];

// Validate every exercise at module load time.
// Any broken seed throws immediately, catching errors before they reach Convex.
ALL_EXERCISES.forEach((exercise) => {
  validateExercise(exercise);
});
