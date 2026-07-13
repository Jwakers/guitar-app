import type { SkillTarget } from "../../src/lib/skills/taxonomy";
import { skillTargetKey } from "../../src/lib/skills/taxonomy";

export type SessionSkillRatingChange = {
  skillTarget: SkillTarget;
  oldRating: number;
  newRating: number;
};

export type IncomingSkillRatingChange = {
  skillTarget: SkillTarget;
  oldRating: number;
  newRating: number;
};

export function mergeSkillRatingChanges(
  existing: SessionSkillRatingChange[],
  incoming: IncomingSkillRatingChange[],
): SessionSkillRatingChange[] {
  const map = new Map<string, SessionSkillRatingChange>();

  for (const change of existing) {
    map.set(skillTargetKey(change.skillTarget), change);
  }

  for (const change of incoming) {
    const key = skillTargetKey(change.skillTarget);
    const previous = map.get(key);
    if (previous) {
      map.set(key, {
        skillTarget: change.skillTarget,
        oldRating: previous.oldRating,
        newRating: change.newRating,
      });
    } else {
      map.set(key, change);
    }
  }

  return [...map.values()];
}
