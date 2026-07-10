import { CORE_SKILLS, type CoreSkill, type SubSkill } from "../skills/taxonomy";
import { getBlockConfig } from "./block-types";
import type {
  BlockType,
  InitialBlockSelection,
  SkillRatingSnapshot,
  UserProfileSnapshot,
} from "./types";

const WEAK_RATING_THRESHOLD = 40;

function weakCoreSkillCount(ratings: SkillRatingSnapshot[]): number {
  return ratings.filter(
    (r) =>
      r.skillTarget.kind === "core" && r.rating <= WEAK_RATING_THRESHOLD,
  ).length;
}

function selectBlockType(ratings: SkillRatingSnapshot[]): BlockType {
  return weakCoreSkillCount(ratings) >= 2 ? "weakness_focus" : "foundation";
}

function weakCoreSkills(ratings: SkillRatingSnapshot[]): CoreSkill[] {
  return ratings
    .filter(
      (r) =>
        r.skillTarget.kind === "core" && r.rating <= WEAK_RATING_THRESHOLD,
    )
    .map((r) => (r.skillTarget.kind === "core" ? r.skillTarget.id : null))
    .filter((id): id is CoreSkill => id !== null);
}

function weakSubSkills(ratings: SkillRatingSnapshot[]): SubSkill[] {
  return ratings
    .filter(
      (r) =>
        r.skillTarget.kind === "sub" && r.rating <= WEAK_RATING_THRESHOLD,
    )
    .map((r) => (r.skillTarget.kind === "sub" ? r.skillTarget.id : null))
    .filter((id): id is SubSkill => id !== null);
}

/**
 * Select and shape the initial training block from onboarding profile + ratings.
 * MVP: foundation by default; weakness_focus when 2+ core skills are weak.
 */
export function selectInitialBlock(
  profile: UserProfileSnapshot,
  ratings: SkillRatingSnapshot[],
): InitialBlockSelection {
  const blockType = selectBlockType(ratings);
  const config = getBlockConfig(blockType);

  const focusCore =
    profile.focusCoreSkillIds.length > 0
      ? profile.focusCoreSkillIds
      : weakCoreSkills(ratings).slice(0, 2).length > 0
        ? weakCoreSkills(ratings).slice(0, 2)
        : (["picking", "synchronisation"] as CoreSkill[]);

  const focusSub =
    profile.focusSubSkillIds.length > 0
      ? profile.focusSubSkillIds
      : weakSubSkills(ratings).slice(0, 2);

  const focusCoreSet = new Set(focusCore);
  const supportCore = CORE_SKILLS.filter(
    (id) => !focusCoreSet.has(id) && weakCoreSkills(ratings).includes(id),
  ).slice(0, 2);

  const focusSubSet = new Set(focusSub);
  const supportSub = weakSubSkills(ratings)
    .filter((id) => !focusSubSet.has(id))
    .slice(0, 2);

  const intensity =
    profile.preferredIntensity === "light" ||
    profile.preferredIntensity === "hard"
      ? profile.preferredIntensity
      : config.defaultIntensity;

  return {
    blockType,
    title: config.title,
    primaryGoal: config.primaryGoal,
    durationWeeks: config.durationWeeks,
    focusCoreSkillIds: focusCore,
    focusSubSkillIds: focusSub,
    supportCoreSkillIds: supportCore,
    supportSubSkillIds: supportSub,
    intensity,
    deloadWeek: config.deloadWeek,
  };
}
