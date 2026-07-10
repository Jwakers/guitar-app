import {
  CROSS_CUTTING_SUB_SKILLS,
  SUB_SKILL_DEFINITIONS,
  type CoreSkill,
  type SubSkill,
  subSkillsForCoreSkill,
} from "@/lib/skills/taxonomy";

export type SubSkillHistogram = Record<SubSkill, number>;

function eligibleSubSkillsForCore(coreSkillId: CoreSkill): SubSkill[] {
  return subSkillsForCoreSkill(coreSkillId).filter(
    (id) => !CROSS_CUTTING_SUB_SKILLS.has(id),
  );
}

function primarySubSkillForCore(coreSkillId: CoreSkill): SubSkill {
  const eligible = eligibleSubSkillsForCore(coreSkillId);
  if (eligible.length === 0) {
    throw new Error(
      `No standalone sub-skills available for core skill "${coreSkillId}"`,
    );
  }
  return [...eligible].sort(
    (a, b) =>
      SUB_SKILL_DEFINITIONS[a].sortOrder - SUB_SKILL_DEFINITIONS[b].sortOrder,
  )[0];
}

export function countSubSkills(
  drills: Array<{
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId: CoreSkill,
): SubSkillHistogram {
  const eligible = eligibleSubSkillsForCore(coreSkillId);
  const counts = Object.fromEntries(
    eligible.map((id) => [id, 0]),
  ) as SubSkillHistogram;

  for (const drill of drills) {
    if (drill.coreSkillId && drill.coreSkillId !== coreSkillId) {
      continue;
    }
    for (const subSkillId of drill.subSkillIds ?? []) {
      if (subSkillId in counts) {
        counts[subSkillId as SubSkill] += 1;
      }
    }
  }

  return counts;
}

/**
 * Pick the sub-skill most under-represented in the library for this core skill.
 * When the library is empty for the core, returns the primary sub-skill (lowest sortOrder).
 */
export function inferSubSkillIds(
  drills: Array<{
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId: CoreSkill,
): SubSkill[] {
  const eligible = eligibleSubSkillsForCore(coreSkillId);
  const counts = countSubSkills(drills, coreSkillId);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  if (total === 0) {
    return [primarySubSkillForCore(coreSkillId)];
  }

  let best = eligible[0];
  let bestCount = counts[best] ?? 0;

  for (const subSkillId of eligible) {
    const count = counts[subSkillId] ?? 0;
    if (
      count < bestCount ||
      (count === bestCount &&
        SUB_SKILL_DEFINITIONS[subSkillId].sortOrder <
          SUB_SKILL_DEFINITIONS[best].sortOrder)
    ) {
      best = subSkillId;
      bestCount = count;
    }
  }

  return [best];
}

export function formatSubSkillDistribution(
  drills: Array<{
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId: CoreSkill,
): string {
  const counts = countSubSkills(drills, coreSkillId);
  const eligible = eligibleSubSkillsForCore(coreSkillId);
  return eligible
    .map((id) => `${id}: ${counts[id] ?? 0}`)
    .join(", ");
}
