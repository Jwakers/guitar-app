import type { SessionType } from "./types";
import type {
  BlockSnapshot,
  BuiltSession,
  ExerciseCandidate,
  ExerciseSelectionScoreBreakdown,
  SessionSlot,
  SessionSlotType,
  SkillRatingSnapshot,
  UserProfileSnapshot,
} from "./types";
import {
  type EligibilityMode,
  filterEligibleExercises,
  hasAnyMvpExercises,
} from "./filter-eligibility";
import { generateTargets, reasonCodesFromScore } from "./generate-targets";
import { selectBestExercise } from "./scoring";
import {
  buildSessionTemplate,
  determineSessionPurpose,
} from "./session-templates";

export class SessionBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionBuildError";
  }
}

function sessionTitle(sessionType: SessionType, blockTitle: string): string {
  switch (sessionType) {
    case "light":
      return "Light Session";
    case "test":
      return "Benchmark Session";
    case "deload":
      return "Deload Session";
    default:
      return `${blockTitle} — Practice`;
  }
}

function sessionGoal(
  purpose: ReturnType<typeof determineSessionPurpose>,
): string {
  const focusLabel =
    purpose.primaryFocus.kind === "core"
      ? purpose.primaryFocus.id.replace(/_/g, " ")
      : purpose.primaryFocus.id.replace(/_/g, " ");
  return `Today's focus: ${focusLabel}. Train at the edge of your reliable level with clear, measurable targets.`;
}

function appendExerciseItem(
  exercise: ExerciseCandidate,
  breakdown: ExerciseSelectionScoreBreakdown,
  slot: SessionSlot,
  order: number,
) {
  const targets = generateTargets(exercise);
  return {
    exerciseId: exercise._id,
    slotType: slot.slotType,
    order,
    targetMetric: targets.targetMetric,
    targetValue: targets.targetValue,
    targetBpm: targets.targetBpm,
    durationMinutes: Math.min(targets.durationMinutes, slot.estimatedMinutes),
    status: "pending" as const,
    reasonCodes: reasonCodesFromScore(breakdown),
    scoreBreakdown: breakdown,
  };
}

const SLOT_PRIORITY: SessionSlotType[] = [
  "warmup",
  "primary",
  "secondary",
  "accessory",
  "isolation",
  "test",
  "maintenance",
];

function countMvpExercises(exercises: ExerciseCandidate[]): number {
  return exercises.filter((ex) => ex.status === "active" && ex.isMvp).length;
}

/** Fewer catalog drills than template slots — keep the highest-priority slots only. */
function scaleSlotsForCatalog(
  slots: SessionSlot[],
  exercises: ExerciseCandidate[],
): SessionSlot[] {
  const mvpCount = countMvpExercises(exercises);
  if (mvpCount >= slots.length) return slots;

  const byType = new Map<SessionSlotType, SessionSlot>();
  for (const slot of slots) {
    if (!byType.has(slot.slotType)) byType.set(slot.slotType, slot);
  }

  const scaled: SessionSlot[] = [];
  for (const type of SLOT_PRIORITY) {
    const slot = byType.get(type);
    if (slot) scaled.push(slot);
    if (scaled.length >= mvpCount) break;
  }

  return scaled.length > 0 ? scaled : slots.slice(0, mvpCount);
}

function relaxSlot(slot: SessionSlot): SessionSlot {
  return {
    ...slot,
    targetCoreSkillIds: [],
    targetSubSkillIds: [],
    minDifficulty: 1,
    maxDifficulty: 10,
  };
}

type SlotSelection = {
  exercise: ExerciseCandidate;
  breakdown: ExerciseSelectionScoreBreakdown;
  slot: SessionSlot;
};

function selectForSlot(
  slot: SessionSlot,
  exercises: ExerciseCandidate[],
  purpose: ReturnType<typeof determineSessionPurpose>,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  ratings: SkillRatingSnapshot[],
  usedExerciseIds: Set<string>,
): SlotSelection | null {
  const attempts: Array<{ slot: SessionSlot; mode: EligibilityMode }> = [
    { slot, mode: "strict" },
    { slot: relaxSlot(slot), mode: "strict" },
    { slot: relaxSlot(slot), mode: "loose" },
    { slot: relaxSlot(slot), mode: "any" },
  ];

  for (const attempt of attempts) {
    const eligible = filterEligibleExercises(
      exercises,
      attempt.slot,
      purpose,
      { mode: attempt.mode, block },
    );
    const selection = selectBestExercise(
      eligible,
      attempt.slot,
      purpose,
      profile,
      block,
      ratings,
      usedExerciseIds,
    );
    if (selection) {
      return {
        exercise: selection.exercise,
        breakdown: selection.breakdown,
        slot: attempt.slot,
      };
    }
  }

  return null;
}

export function buildSession(
  sessionType: SessionType,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  ratings: SkillRatingSnapshot[],
  exercises: ExerciseCandidate[],
): BuiltSession {
  if (!hasAnyMvpExercises(exercises)) {
    throw new SessionBuildError(
      "No active MVP exercises in the catalog. Author drills in dev and migrate before generating sessions.",
    );
  }

  const purpose = determineSessionPurpose(
    sessionType,
    profile,
    block,
    ratings,
  );
  const slots = scaleSlotsForCatalog(
    buildSessionTemplate(purpose, block),
    exercises,
  );
  const usedExerciseIds = new Set<string>();
  const exerciseItems: BuiltSession["exerciseItems"] = [];
  let order = 0;

  for (const slot of slots) {
    const selection = selectForSlot(
      slot,
      exercises,
      purpose,
      profile,
      block,
      ratings,
      usedExerciseIds,
    );
    if (!selection) continue;

    usedExerciseIds.add(selection.exercise._id);
    exerciseItems.push(
      appendExerciseItem(
        selection.exercise,
        selection.breakdown,
        selection.slot,
        order++,
      ),
    );
  }

  if (exerciseItems.length === 0) {
    const fallbackSlot: SessionSlot = {
      slotType: "primary",
      targetCoreSkillIds: block.focusCoreSkillIds,
      targetSubSkillIds: [],
      minDifficulty: 1,
      maxDifficulty: 10,
      estimatedMinutes: profile.defaultSessionLengthMinutes,
    };
    const mvpExercises = exercises.filter(
      (ex) => ex.status === "active" && ex.isMvp,
    );
    const selection = selectBestExercise(
      mvpExercises,
      fallbackSlot,
      purpose,
      profile,
      block,
      ratings,
      usedExerciseIds,
    );
    if (selection) {
      exerciseItems.push(
        appendExerciseItem(
          selection.exercise,
          selection.breakdown,
          fallbackSlot,
          0,
        ),
      );
    }
  }

  if (exerciseItems.length === 0) {
    throw new SessionBuildError(
      "Could not assemble a session from the current exercise catalog. Add MVP drills matching your focus skills.",
    );
  }

  const estimatedMinutes = exerciseItems.reduce(
    (sum, item) => sum + item.durationMinutes,
    0,
  );

  return {
    title: sessionTitle(sessionType, block.title),
    goal: sessionGoal(purpose),
    estimatedMinutes,
    sessionType,
    exerciseItems,
  };
}
