/**
 * Deterministic remap from the pre-redefine (mid-heavy) difficulty scale
 * onto intermediate-start → mastery (see knowledge/drills rubric).
 *
 * Apply once via migrateDifficultyScale. A second pass would re-compress
 * already-remapped values — the mutation is intended as a one-shot.
 */
const OLD_TO_NEW: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 5,
  8: 6,
  9: 8,
  10: 9,
};

/**
 * Map a pre-redefine difficultyLevel to the new scale.
 * Returns the same value when the level is already a fixed point (1) or outside 1–10.
 */
export function remapDifficultyLevel(old: number): number {
  if (!Number.isInteger(old) || old < 1 || old > 10) {
    return old;
  }
  return OLD_TO_NEW[old] ?? old;
}

export function difficultyRemapTable(): Readonly<Record<number, number>> {
  return OLD_TO_NEW;
}
