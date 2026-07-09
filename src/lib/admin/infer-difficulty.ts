/**
 * Target share of the library by difficulty (1–10).
 * Peaks in the mid range (4–8); extremes are intentionally sparse.
 * Values are relative weights — they need not sum to 1.
 */
const TARGET_WEIGHTS: Record<number, number> = {
  1: 0.04,
  2: 0.07,
  3: 0.1,
  4: 0.15,
  5: 0.18,
  6: 0.18,
  7: 0.14,
  8: 0.09,
  9: 0.04,
  10: 0.01,
};

export type DifficultyHistogram = Record<number, number>;

export function countDifficulties(
  drills: Array<{
    difficultyLevel: number;
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillId?: string,
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
    if (
      subSkillId &&
      drill.subSkillIds &&
      !drill.subSkillIds.includes(subSkillId)
    ) {
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
 * Pick the difficulty that is most under-represented vs the mid-heavy target curve.
 * When the library is empty, prefers 5 (centre of the 4–8 focus band).
 */
export function inferDifficultyLevel(
  drills: Array<{
    difficultyLevel: number;
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillId?: string,
): number {
  const counts = countDifficulties(drills, coreSkillId, subSkillId);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  if (total === 0) return 5;

  const weightSum = Object.values(TARGET_WEIGHTS).reduce((a, b) => a + b, 0);
  let bestLevel = 5;
  let bestDeficit = Number.NEGATIVE_INFINITY;

  for (let level = 1; level <= 10; level++) {
    const targetShare = (TARGET_WEIGHTS[level] ?? 0) / weightSum;
    const actualShare = (counts[level] ?? 0) / total;
    // Slight absolute underfill bonus so empty mid buckets win early.
    const absoluteGap = targetShare * (total + 1) - (counts[level] ?? 0);
    const deficit = targetShare - actualShare + absoluteGap * 0.05;

    if (
      deficit > bestDeficit ||
      (deficit === bestDeficit &&
        Math.abs(level - 6) < Math.abs(bestLevel - 6))
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
  subSkillId?: string,
): string {
  const counts = countDifficulties(drills, coreSkillId, subSkillId);
  return Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    return `${level}: ${counts[level] ?? 0}`;
  }).join(", ");
}
