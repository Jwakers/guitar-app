import type { CoreSkill, SubSkill } from "@/lib/skills/taxonomy";

export type TaxonomyConstraints = {
  coreSkillId: CoreSkill;
  subSkillIds: SubSkill[];
};

export type PinExerciseTaxonomyResult<T> = {
  exercise: T;
  pinnedFields: string[];
  taxonomyPinned: boolean;
};

export function pinExerciseTaxonomy<T extends Record<string, unknown>>(
  exercise: T,
  constraints: TaxonomyConstraints,
): PinExerciseTaxonomyResult<T> {
  const pinnedFields: string[] = [];
  const next = { ...exercise };

  if (next.coreSkillId !== constraints.coreSkillId) {
    next.coreSkillId = constraints.coreSkillId;
    pinnedFields.push("coreSkillId");
  }

  const modelSubSkillIds = Array.isArray(next.subSkillIds)
    ? next.subSkillIds
    : [];
  const subSkillIdsMatch =
    modelSubSkillIds.length === constraints.subSkillIds.length &&
    constraints.subSkillIds.every((id) => modelSubSkillIds.includes(id));

  if (!subSkillIdsMatch) {
    next.subSkillIds = [...constraints.subSkillIds];
    pinnedFields.push("subSkillIds");
  }

  return {
    exercise: next,
    pinnedFields,
    taxonomyPinned: pinnedFields.length > 0,
  };
}

/** Validation errors that taxonomy pinning already addresses — skip LLM repair. */
export function isTaxonomyValidationError(message: string): boolean {
  return (
    /sub-skill .* is not allowed under core skill/i.test(message) ||
    /"coreSkillId" is invalid/i.test(message) ||
    /no longer a valid core skill/i.test(message) ||
    /"subSkillIds" contains invalid sub-skill/i.test(message) ||
    /"subSkillIds" must contain at least one sub-skill/i.test(message) ||
    /subSkillIds cannot consist only of cross-cutting/i.test(message)
  );
}
