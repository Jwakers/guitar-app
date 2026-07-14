import type { SkillTarget } from "@/lib/skills/taxonomy";
import { skillTargetLabel } from "@/lib/skills/taxonomy";

export type SkillRatingChangeSummary = {
  skillTarget: SkillTarget;
  oldRating: number;
  newRating: number;
};

export function formatSkillRatingDelta(
  oldRating: number,
  newRating: number,
): string {
  const delta = newRating - oldRating;
  if (delta === 0) return "0";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

export function formatSkillRatingChangeLine(
  change: SkillRatingChangeSummary,
): string {
  const label = skillTargetLabel(change.skillTarget);
  const delta = formatSkillRatingDelta(change.oldRating, change.newRating);
  return `${label} ${change.oldRating} → ${change.newRating} (${delta})`;
}

export function sortSkillRatingChanges(
  changes: SkillRatingChangeSummary[],
): SkillRatingChangeSummary[] {
  return [...changes].sort((a, b) => {
    const deltaA = Math.abs(a.newRating - a.oldRating);
    const deltaB = Math.abs(b.newRating - b.oldRating);
    return deltaB - deltaA;
  });
}
