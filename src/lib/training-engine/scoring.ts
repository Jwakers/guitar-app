import type { SkillTarget } from "../skills/taxonomy";
import type {
  BlockSnapshot,
  ExerciseCandidate,
  ExerciseSelectionScoreBreakdown,
  SessionPurpose,
  SessionSlot,
  SkillRatingSnapshot,
  UserProfileSnapshot,
} from "./types";

const WEIGHTS = {
  goalMatch: 0.2,
  weaknessMatch: 0.2,
  blockRelevance: 0.15,
  readiness: 0.15,
  progressionNeed: 0.1,
  maintenanceNeed: 0.1,
  variety: 0.05,
  recentFatiguePenalty: 0.1,
  tooSoonRepeatPenalty: 0.1,
  difficultyMismatchPenalty: 0.15,
} as const;

function ratingForTarget(
  ratings: SkillRatingSnapshot[],
  target: SkillTarget,
): number | undefined {
  const found = ratings.find(
    (r) =>
      r.skillTarget.kind === target.kind && r.skillTarget.id === target.id,
  );
  return found?.rating;
}

function weaknessScore(
  exercise: ExerciseCandidate,
  ratings: SkillRatingSnapshot[],
): number {
  const coreRating = ratingForTarget(ratings, {
    kind: "core",
    id: exercise.coreSkillId,
  });
  let score = 0;
  if (coreRating !== undefined) {
    score += (100 - coreRating) / 100;
  }
  for (const subId of exercise.subSkillIds) {
    const subRating = ratingForTarget(ratings, { kind: "sub", id: subId });
    if (subRating !== undefined) {
      score += ((100 - subRating) / 100) * 0.5;
    }
  }
  return Math.min(1, score);
}

function blockRelevanceScore(
  exercise: ExerciseCandidate,
  block: BlockSnapshot,
): number {
  if (block.focusCoreSkillIds.includes(exercise.coreSkillId)) return 1;
  if (block.supportCoreSkillIds.includes(exercise.coreSkillId)) return 0.6;
  if (
    exercise.subSkillIds.some((id) => block.focusSubSkillIds.includes(id))
  ) {
    return 0.9;
  }
  if (
    exercise.subSkillIds.some((id) => block.supportSubSkillIds.includes(id))
  ) {
    return 0.5;
  }
  return 0.2;
}

function goalMatchScore(
  exercise: ExerciseCandidate,
  profile: UserProfileSnapshot,
): number {
  if (profile.focusCoreSkillIds.includes(exercise.coreSkillId)) return 1;
  if (
    exercise.subSkillIds.some((id) =>
      profile.focusSubSkillIds.includes(id),
    )
  ) {
    return 0.85;
  }
  if (profile.primaryGoals.length === 0) return 0.5;
  return 0.35;
}

/** MVP placeholder — no logs yet; neutral readiness. */
function readinessScore(): number {
  return 0.5;
}

function progressionNeedScore(): number {
  return 0.5;
}

function maintenanceNeedScore(): number {
  return 0.3;
}

function varietyScore(exercise: ExerciseCandidate, usedIds: Set<string>): number {
  return usedIds.has(exercise._id) ? 0 : 0.7;
}

export function scoreExercise(
  exercise: ExerciseCandidate,
  slot: SessionSlot,
  purpose: SessionPurpose,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  ratings: SkillRatingSnapshot[],
  usedExerciseIds: Set<string>,
): ExerciseSelectionScoreBreakdown {
  const goalMatch = goalMatchScore(exercise, profile);
  const weaknessMatch = weaknessScore(exercise, ratings);
  const blockRelevance = blockRelevanceScore(exercise, block);
  const readiness = readinessScore();
  const progressionNeed = progressionNeedScore();
  const maintenanceNeed = maintenanceNeedScore();
  const variety = varietyScore(exercise, usedExerciseIds);

  const penalties =
    (usedExerciseIds.has(exercise._id) ? WEIGHTS.tooSoonRepeatPenalty : 0) +
    (purpose.intensity === "low" && exercise.difficultyLevel > 6
      ? WEIGHTS.difficultyMismatchPenalty * 0.5
      : 0);

  const total =
    goalMatch * WEIGHTS.goalMatch +
    weaknessMatch * WEIGHTS.weaknessMatch +
    blockRelevance * WEIGHTS.blockRelevance +
    readiness * WEIGHTS.readiness +
    progressionNeed * WEIGHTS.progressionNeed +
    maintenanceNeed * WEIGHTS.maintenanceNeed +
    variety * WEIGHTS.variety -
    penalties;

  return {
    goalMatch,
    weaknessMatch,
    blockRelevance,
    readiness,
    progressionNeed,
    maintenanceNeed,
    variety,
    penalties,
    total,
  };
}

export function selectBestExercise(
  candidates: ExerciseCandidate[],
  slot: SessionSlot,
  purpose: SessionPurpose,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  ratings: SkillRatingSnapshot[],
  usedExerciseIds: Set<string>,
): { exercise: ExerciseCandidate; breakdown: ExerciseSelectionScoreBreakdown } | null {
  if (candidates.length === 0) return null;

  let best: ExerciseCandidate | null = null;
  let bestBreakdown: ExerciseSelectionScoreBreakdown | null = null;

  for (const exercise of candidates) {
    const breakdown = scoreExercise(
      exercise,
      slot,
      purpose,
      profile,
      block,
      ratings,
      usedExerciseIds,
    );
    if (!best || breakdown.total > bestBreakdown!.total) {
      best = exercise;
      bestBreakdown = breakdown;
    }
  }

  if (!best || !bestBreakdown) return null;
  return { exercise: best, breakdown: bestBreakdown };
}
