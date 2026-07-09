import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";
import { validateExercise } from "../../src/lib/exercises/validate-exercise";
import { alternatePickingExercises } from "./alternate-picking";
import { bendsExercises } from "./bends";
import { frettingAccuracyExercises } from "./fretting-accuracy";
import { legatoExercises } from "./legato";
import { stringCrossingExercises } from "./string-crossing";
import { stringSkippingExercises } from "./string-skipping";
import { synchronisationExercises } from "./synchronisation";

export const ALL_EXERCISES: ExerciseSeed[] = [
  ...alternatePickingExercises,
  ...stringSkippingExercises,
  ...stringCrossingExercises,
  ...frettingAccuracyExercises,
  ...synchronisationExercises,
  ...legatoExercises,
  ...bendsExercises,
];

// Validate every exercise at module load time.
// Any broken seed throws immediately, catching errors before they reach Convex.
ALL_EXERCISES.forEach((exercise) => {
  validateExercise(exercise);
});
