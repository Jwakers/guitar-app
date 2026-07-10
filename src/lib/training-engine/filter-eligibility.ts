import type { ExerciseType } from "../exercises/exercise-schema";
import type {
  BlockSnapshot,
  ExerciseCandidate,
  SessionPurpose,
  SessionSlot,
  SessionSlotType,
} from "./types";

export type EligibilityMode = "strict" | "loose" | "any";

const SLOT_TYPE_COMPAT: Partial<
  Record<SessionSlotType, readonly ExerciseType[]>
> = {
  warmup: ["warmup", "primary", "secondary", "accessory"],
  primary: ["primary", "secondary", "isolation"],
  secondary: ["secondary", "primary", "accessory", "isolation"],
  accessory: ["accessory", "secondary", "primary", "warmup"],
  isolation: ["isolation", "secondary", "primary"],
  test: ["test", "primary", "secondary"],
  maintenance: ["accessory", "primary", "secondary", "warmup"],
};

function slotAcceptsExerciseType(
  slotType: SessionSlot["slotType"],
  exerciseType: ExerciseCandidate["exerciseType"],
  mode: EligibilityMode,
): boolean {
  if (mode === "any") return true;
  if (slotType === exerciseType) return true;
  if (slotType === "maintenance" && exerciseType === "accessory") return true;
  if (mode === "loose") {
    const compat = SLOT_TYPE_COMPAT[slotType];
    return compat?.includes(exerciseType) ?? false;
  }
  return false;
}

function skillMatchesSlot(
  exercise: ExerciseCandidate,
  slot: SessionSlot,
  mode: EligibilityMode,
  block?: BlockSnapshot,
): boolean {
  if (mode === "any") return true;

  if (mode === "loose" && block) {
    if (block.focusCoreSkillIds.includes(exercise.coreSkillId)) return true;
    if (block.supportCoreSkillIds.includes(exercise.coreSkillId)) return true;
    if (
      exercise.subSkillIds.some((id) => block.focusSubSkillIds.includes(id))
    ) {
      return true;
    }
    if (
      exercise.subSkillIds.some((id) => block.supportSubSkillIds.includes(id))
    ) {
      return true;
    }
    return (
      slot.targetCoreSkillIds.length === 0 && slot.targetSubSkillIds.length === 0
    );
  }

  if (
    slot.targetCoreSkillIds.length > 0 &&
    !slot.targetCoreSkillIds.includes(exercise.coreSkillId)
  ) {
    return false;
  }
  if (slot.targetSubSkillIds.length > 0) {
    return slot.targetSubSkillIds.some((id) =>
      exercise.subSkillIds.includes(id),
    );
  }
  return true;
}

export type FilterEligibleOptions = {
  mode?: EligibilityMode;
  block?: BlockSnapshot;
};

export function filterEligibleExercises(
  exercises: ExerciseCandidate[],
  slot: SessionSlot,
  _purpose: SessionPurpose,
  options: FilterEligibleOptions = {},
): ExerciseCandidate[] {
  const mode = options.mode ?? "strict";
  const block = options.block;

  return exercises.filter((ex) => {
    if (ex.status !== "active" || !ex.isMvp) return false;
    if (!slotAcceptsExerciseType(slot.slotType, ex.exerciseType, mode)) {
      return false;
    }
    if (mode !== "any") {
      const minDifficulty = mode === "loose" ? 1 : slot.minDifficulty;
      const maxDifficulty = mode === "loose" ? 10 : slot.maxDifficulty;
      if (
        ex.difficultyLevel < minDifficulty ||
        ex.difficultyLevel > maxDifficulty
      ) {
        return false;
      }
    }
    if (!skillMatchesSlot(ex, slot, mode, block)) return false;
    if (mode === "strict" && ex.estimatedMinutes > slot.estimatedMinutes + 5) {
      return false;
    }
    return true;
  });
}

export function hasAnyMvpExercises(exercises: ExerciseCandidate[]): boolean {
  return exercises.some((ex) => ex.status === "active" && ex.isMvp);
}
