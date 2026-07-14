/**
 * Target share of the library by difficulty (1–10).
 * Start-heavy (1–4), moderate advanced (5–6), light stretch (7–8), sparse mastery (9–10).
 * Values are relative weights — they need not sum to 1.
 */
const TARGET_WEIGHTS: Record<number, number> = {
  1: 0.14,
  2: 0.16,
  3: 0.16,
  4: 0.14,
  5: 0.12,
  6: 0.1,
  7: 0.07,
  8: 0.06,
  9: 0.03,
  10: 0.02,
};

/** Empty-library default: middle of the intermediate starting band. */
const EMPTY_LIBRARY_DEFAULT = 3;

export type DifficultyHistogram = Record<number, number>;

function matchesSubSkillFilter(
  drillSubSkillIds: string[] | undefined,
  filterSubSkillIds: string[] | undefined,
): boolean {
  if (!filterSubSkillIds || filterSubSkillIds.length === 0) return true;
  if (!drillSubSkillIds || drillSubSkillIds.length === 0) return false;
  return filterSubSkillIds.some((id) => drillSubSkillIds.includes(id));
}

export function countDifficulties(
  drills: Array<{
    difficultyLevel: number;
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
): DifficultyHistogram {
  const counts: DifficultyHistogram = {};
  for (let d = 1; d <= 10; d++) counts[d] = 0;

  for (const drill of drills) {
    if (
      coreSkillId &&
      drill.coreSkillId &&
      drill.coreSkillId !== coreSkillId
    ) {
      continue;
    }
    if (!matchesSubSkillFilter(drill.subSkillIds, subSkillIds)) {
      continue;
    }
    const level = drill.difficultyLevel;
    if (level >= 1 && level <= 10) {
      counts[level] = (counts[level] ?? 0) + 1;
    }
  }

  return counts;
}

/**
 * Pick the difficulty that is most under-represented vs the start-heavy target curve.
 * When the library is empty, prefers 3 (middle of the 1–3 starting band).
 */
export function inferDifficultyLevel(
  drills: Array<{
    difficultyLevel: number;
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
): number {
  const counts = countDifficulties(drills, coreSkillId, subSkillIds);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  if (total === 0) return EMPTY_LIBRARY_DEFAULT;

  const weightSum = Object.values(TARGET_WEIGHTS).reduce((a, b) => a + b, 0);
  let bestLevel = EMPTY_LIBRARY_DEFAULT;
  let bestDeficit = Number.NEGATIVE_INFINITY;

  for (let level = 1; level <= 10; level++) {
    const targetShare = (TARGET_WEIGHTS[level] ?? 0) / weightSum;
    const actualShare = (counts[level] ?? 0) / total;
    // Slight absolute underfill bonus so empty start buckets win early.
    const absoluteGap = targetShare * (total + 1) - (counts[level] ?? 0);
    const deficit = targetShare - actualShare + absoluteGap * 0.05;

    if (
      deficit > bestDeficit ||
      (deficit === bestDeficit &&
        Math.abs(level - EMPTY_LIBRARY_DEFAULT) <
          Math.abs(bestLevel - EMPTY_LIBRARY_DEFAULT))
    ) {
      bestDeficit = deficit;
      bestLevel = level;
    }
  }

  return bestLevel;
}

export function formatDifficultyDistribution(
  drills: Array<{
    difficultyLevel: number;
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
): string {
  const counts = countDifficulties(drills, coreSkillId, subSkillIds);
  return Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    return `${level}: ${counts[level] ?? 0}`;
  }).join(", ");
}
