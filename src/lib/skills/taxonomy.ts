export const CORE_SKILLS = [
  "picking",
  "fretting_control",
  "synchronisation",
  "rhythm_timing",
  "lead_articulation",
  "chord_changes",
] as const;

export type CoreSkill = (typeof CORE_SKILLS)[number];

export const SUB_SKILLS = [
  "alternate_picking",
  "string_crossing",
  "string_skipping",
  "finger_independence",
  "fretting_accuracy",
  "position_shifting",
  "legato",
  "bends",
  "vibrato",
  "slides",
  "subdivision_control",
  "accent_control",
  "palm_muting",
  "fret_hand_muting",
  "release_control",
] as const;

export type SubSkill = (typeof SUB_SKILLS)[number];

export const TRAINING_ATTRIBUTES = [
  "speed",
  "endurance",
  "accuracy",
  "control",
  "consistency",
  "cleanliness",
  "noise_control",
] as const;

export type TrainingAttribute = (typeof TRAINING_ATTRIBUTES)[number];

export type SkillTarget =
  | { kind: "core"; id: CoreSkill }
  | { kind: "sub"; id: SubSkill };

/** Core skills that do not require sub-skill selection in drills or onboarding. */
export const CORE_SKILLS_WITHOUT_SUBSKILLS = new Set<CoreSkill>([
  "synchronisation",
  "chord_changes",
]);

/** Technique tags that support another core skill — not standalone drill drivers. */
export const CROSS_CUTTING_SUB_SKILLS = new Set<SubSkill>([
  "palm_muting",
  "fret_hand_muting",
  "release_control",
]);

export function coreSkillRequiresSubSkills(coreSkillId: CoreSkill): boolean {
  return !CORE_SKILLS_WITHOUT_SUBSKILLS.has(coreSkillId);
}

export function skillTargetKey(target: SkillTarget): string {
  return `${target.kind}:${target.id}`;
}

export type TaxonomyEntry<TId extends string> = {
  id: TId;
  label: string;
  description: string;
  sortOrder: number;
};

export const CORE_SKILL_DEFINITIONS: Record<CoreSkill, TaxonomyEntry<CoreSkill>> = {
  picking: {
    id: "picking",
    label: "Picking",
    description:
      "Pick-hand control across attack, string targeting, and efficient movement.",
    sortOrder: 1,
  },
  fretting_control: {
    id: "fretting_control",
    label: "Fretting Control",
    description:
      "Clean, efficient fretting-hand placement, pressure, and movement.",
    sortOrder: 2,
  },
  synchronisation: {
    id: "synchronisation",
    label: "Synchronisation",
    description:
      "Coordination between both hands so notes start, stop, and line up cleanly.",
    sortOrder: 3,
  },
  rhythm_timing: {
    id: "rhythm_timing",
    label: "Rhythm & Timing",
    description:
      "Subdivision accuracy, pulse, accents, and rhythmic consistency.",
    sortOrder: 4,
  },
  lead_articulation: {
    id: "lead_articulation",
    label: "Lead Articulation",
    description:
      "Expressive single-note techniques such as bends, vibrato, legato, and slides.",
    sortOrder: 5,
  },
  chord_changes: {
    id: "chord_changes",
    label: "Chord Changes",
    description:
      "Moving between chord shapes cleanly, rhythmically, and with usable endurance.",
    sortOrder: 6,
  },
};

export type SubSkillDefinition = TaxonomyEntry<SubSkill> & {
  primaryCoreSkillId: CoreSkill;
  allowedCoreSkillIds: readonly CoreSkill[];
};

export const SUB_SKILL_DEFINITIONS: Record<SubSkill, SubSkillDefinition> = {
  alternate_picking: {
    id: "alternate_picking",
    label: "Alternate Picking",
    description: "Strict down-up picking with consistent attack.",
    sortOrder: 1,
    primaryCoreSkillId: "picking",
    allowedCoreSkillIds: ["picking"],
  },
  string_crossing: {
    id: "string_crossing",
    label: "String Crossing",
    description: "Clean pick travel between adjacent strings.",
    sortOrder: 2,
    primaryCoreSkillId: "picking",
    allowedCoreSkillIds: ["picking"],
  },
  string_skipping: {
    id: "string_skipping",
    label: "String Skipping",
    description: "Accurate pick jumps across non-adjacent strings.",
    sortOrder: 3,
    primaryCoreSkillId: "picking",
    allowedCoreSkillIds: ["picking"],
  },
  finger_independence: {
    id: "finger_independence",
    label: "Finger Independence",
    description: "Independent fretting-finger motion without collapse or drag.",
    sortOrder: 1,
    primaryCoreSkillId: "fretting_control",
    allowedCoreSkillIds: ["fretting_control"],
  },
  fretting_accuracy: {
    id: "fretting_accuracy",
    label: "Fretting Accuracy",
    description: "Clean contact behind the fret with efficient pressure.",
    sortOrder: 2,
    primaryCoreSkillId: "fretting_control",
    allowedCoreSkillIds: ["fretting_control"],
  },
  position_shifting: {
    id: "position_shifting",
    label: "Position Shifting",
    description: "Controlled movement between fretboard positions.",
    sortOrder: 3,
    primaryCoreSkillId: "fretting_control",
    allowedCoreSkillIds: ["fretting_control"],
  },
  legato: {
    id: "legato",
    label: "Legato",
    description: "Smooth hammer-ons and pull-offs with even volume.",
    sortOrder: 1,
    primaryCoreSkillId: "lead_articulation",
    allowedCoreSkillIds: ["lead_articulation"],
  },
  bends: {
    id: "bends",
    label: "Bends",
    description: "Pitch-accurate bends, releases, and resolutions.",
    sortOrder: 2,
    primaryCoreSkillId: "lead_articulation",
    allowedCoreSkillIds: ["lead_articulation"],
  },
  vibrato: {
    id: "vibrato",
    label: "Vibrato",
    description: "Controlled pitch oscillation on sustained notes.",
    sortOrder: 3,
    primaryCoreSkillId: "lead_articulation",
    allowedCoreSkillIds: ["lead_articulation"],
  },
  slides: {
    id: "slides",
    label: "Slides",
    description: "Connected position movement with clear start and target notes.",
    sortOrder: 4,
    primaryCoreSkillId: "lead_articulation",
    allowedCoreSkillIds: ["lead_articulation"],
  },
  subdivision_control: {
    id: "subdivision_control",
    label: "Subdivision Control",
    description: "Accurate placement of rhythmic subdivisions against the pulse.",
    sortOrder: 1,
    primaryCoreSkillId: "rhythm_timing",
    allowedCoreSkillIds: ["rhythm_timing"],
  },
  accent_control: {
    id: "accent_control",
    label: "Accent Control",
    description: "Intentional dynamic emphasis without disturbing timing.",
    sortOrder: 2,
    primaryCoreSkillId: "rhythm_timing",
    allowedCoreSkillIds: ["rhythm_timing"],
  },
  palm_muting: {
    id: "palm_muting",
    label: "Palm Muting",
    description: "Pick-hand muting for controlled attack and note length.",
    sortOrder: 3,
    primaryCoreSkillId: "rhythm_timing",
    allowedCoreSkillIds: ["rhythm_timing", "picking", "lead_articulation"],
  },
  fret_hand_muting: {
    id: "fret_hand_muting",
    label: "Fret-Hand Muting",
    description: "Fretting-hand damping of unused or released strings.",
    sortOrder: 4,
    primaryCoreSkillId: "picking",
    allowedCoreSkillIds: [
      "picking",
      "fretting_control",
      "chord_changes",
      "lead_articulation",
    ],
  },
  release_control: {
    id: "release_control",
    label: "Release Control",
    description: "Clean note releases and damping between chord or rhythmic changes.",
    sortOrder: 5,
    primaryCoreSkillId: "chord_changes",
    allowedCoreSkillIds: ["chord_changes", "fretting_control", "rhythm_timing"],
  },
};

export const TRAINING_ATTRIBUTE_DEFINITIONS: Record<
  TrainingAttribute,
  TaxonomyEntry<TrainingAttribute>
> = {
  speed: {
    id: "speed",
    label: "Speed",
    description: "Increasing tempo while preserving the trained movement quality.",
    sortOrder: 1,
  },
  endurance: {
    id: "endurance",
    label: "Endurance",
    description: "Sustaining quality over longer repetitions or time.",
    sortOrder: 2,
  },
  accuracy: {
    id: "accuracy",
    label: "Accuracy",
    description: "Hitting the intended string, fret, rhythm, or pitch target.",
    sortOrder: 3,
  },
  control: {
    id: "control",
    label: "Control",
    description: "Keeping movement, tone, and dynamics deliberate.",
    sortOrder: 4,
  },
  consistency: {
    id: "consistency",
    label: "Consistency",
    description: "Repeating the same quality reliably across the drill.",
    sortOrder: 5,
  },
  cleanliness: {
    id: "cleanliness",
    label: "Cleanliness",
    description: "Overall execution quality without unwanted noise or slop.",
    sortOrder: 6,
  },
  noise_control: {
    id: "noise_control",
    label: "Noise Control",
    description:
      "Unwanted string noise, ringing, sloppy releases, or poor damping while performing another skill.",
    sortOrder: 7,
  },
};

const CORE_SKILL_SET = new Set<string>(CORE_SKILLS);
const SUB_SKILL_SET = new Set<string>(SUB_SKILLS);
const TRAINING_ATTRIBUTE_SET = new Set<string>(TRAINING_ATTRIBUTES);

const LEGACY_CORE_SKILLS = new Set(["muting_noise_control", "noise_control"]);

export function isLegacyCoreSkill(value: string): boolean {
  return LEGACY_CORE_SKILLS.has(value);
}

export function isCoreSkill(value: string): value is CoreSkill {
  return CORE_SKILL_SET.has(value);
}

export function isSubSkill(value: string): value is SubSkill {
  return SUB_SKILL_SET.has(value);
}

export function isTrainingAttribute(
  value: string,
): value is TrainingAttribute {
  return TRAINING_ATTRIBUTE_SET.has(value);
}

export function coreSkillLabel(id: CoreSkill): string {
  return CORE_SKILL_DEFINITIONS[id].label;
}

export function subSkillLabel(id: SubSkill): string {
  return SUB_SKILL_DEFINITIONS[id].label;
}

export function trainingAttributeLabel(id: TrainingAttribute): string {
  return TRAINING_ATTRIBUTE_DEFINITIONS[id].label;
}

export function coreSkillForSubSkill(id: SubSkill): CoreSkill {
  return SUB_SKILL_DEFINITIONS[id].primaryCoreSkillId;
}

export function subSkillsForCoreSkill(coreSkillId: CoreSkill): SubSkill[] {
  return SUB_SKILLS.filter((id) =>
    SUB_SKILL_DEFINITIONS[id].allowedCoreSkillIds.includes(coreSkillId),
  );
}

export function subSkillBelongsToCoreSkill(
  subSkillId: SubSkill,
  coreSkillId: CoreSkill,
): boolean {
  return SUB_SKILL_DEFINITIONS[subSkillId].allowedCoreSkillIds.includes(
    coreSkillId,
  );
}

export function subSkillCanDriveStandaloneGeneration(
  subSkillIds: SubSkill[],
): boolean {
  const nonCrossCutting = subSkillIds.filter(
    (id) => !CROSS_CUTTING_SUB_SKILLS.has(id),
  );
  return nonCrossCutting.length > 0;
}

export function skillKnowledgeFilename(id: SubSkill): string {
  return `${id.replace(/_/g, "-")}.md`;
}
