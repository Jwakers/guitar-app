export const CORE_SKILLS = [
  "picking",
  "fretting_control",
  "synchronisation",
  "rhythm_timing",
  "muting_noise_control",
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
  "palm_muting",
  "fret_hand_muting",
  "subdivision_control",
  "accent_control",
] as const;

export type SubSkill = (typeof SUB_SKILLS)[number];

export const TRAINING_ATTRIBUTES = [
  "speed",
  "endurance",
  "accuracy",
  "control",
  "consistency",
] as const;

export type TrainingAttribute = (typeof TRAINING_ATTRIBUTES)[number];

export type SkillTarget =
  | { kind: "core"; id: CoreSkill }
  | { kind: "sub"; id: SubSkill };

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
  muting_noise_control: {
    id: "muting_noise_control",
    label: "Muting & Noise Control",
    description:
      "Keeping unwanted strings silent while preserving clear intended notes.",
    sortOrder: 5,
  },
  lead_articulation: {
    id: "lead_articulation",
    label: "Lead Articulation",
    description:
      "Expressive single-note techniques such as bends, vibrato, legato, and slides.",
    sortOrder: 6,
  },
  chord_changes: {
    id: "chord_changes",
    label: "Chord Changes",
    description:
      "Moving between chord shapes cleanly, rhythmically, and with usable endurance.",
    sortOrder: 7,
  },
};

export const SUB_SKILL_DEFINITIONS: Record<SubSkill, TaxonomyEntry<SubSkill> & {
  coreSkillId: CoreSkill;
}> = {
  alternate_picking: {
    id: "alternate_picking",
    label: "Alternate Picking",
    description: "Strict down-up picking with consistent attack.",
    sortOrder: 1,
    coreSkillId: "picking",
  },
  string_crossing: {
    id: "string_crossing",
    label: "String Crossing",
    description: "Clean pick travel between adjacent strings.",
    sortOrder: 2,
    coreSkillId: "picking",
  },
  string_skipping: {
    id: "string_skipping",
    label: "String Skipping",
    description: "Accurate pick jumps across non-adjacent strings.",
    sortOrder: 3,
    coreSkillId: "picking",
  },
  finger_independence: {
    id: "finger_independence",
    label: "Finger Independence",
    description: "Independent fretting-finger motion without collapse or drag.",
    sortOrder: 1,
    coreSkillId: "fretting_control",
  },
  fretting_accuracy: {
    id: "fretting_accuracy",
    label: "Fretting Accuracy",
    description: "Clean contact behind the fret with efficient pressure.",
    sortOrder: 2,
    coreSkillId: "fretting_control",
  },
  position_shifting: {
    id: "position_shifting",
    label: "Position Shifting",
    description: "Controlled movement between fretboard positions.",
    sortOrder: 3,
    coreSkillId: "fretting_control",
  },
  legato: {
    id: "legato",
    label: "Legato",
    description: "Smooth hammer-ons and pull-offs with even volume.",
    sortOrder: 1,
    coreSkillId: "lead_articulation",
  },
  bends: {
    id: "bends",
    label: "Bends",
    description: "Pitch-accurate bends, releases, and resolutions.",
    sortOrder: 2,
    coreSkillId: "lead_articulation",
  },
  vibrato: {
    id: "vibrato",
    label: "Vibrato",
    description: "Controlled pitch oscillation on sustained notes.",
    sortOrder: 3,
    coreSkillId: "lead_articulation",
  },
  slides: {
    id: "slides",
    label: "Slides",
    description: "Connected position movement with clear start and target notes.",
    sortOrder: 4,
    coreSkillId: "lead_articulation",
  },
  palm_muting: {
    id: "palm_muting",
    label: "Palm Muting",
    description: "Pick-hand muting for controlled attack and note length.",
    sortOrder: 1,
    coreSkillId: "muting_noise_control",
  },
  fret_hand_muting: {
    id: "fret_hand_muting",
    label: "Fret-Hand Muting",
    description: "Fretting-hand damping of unused or released strings.",
    sortOrder: 2,
    coreSkillId: "muting_noise_control",
  },
  subdivision_control: {
    id: "subdivision_control",
    label: "Subdivision Control",
    description: "Accurate placement of rhythmic subdivisions against the pulse.",
    sortOrder: 1,
    coreSkillId: "rhythm_timing",
  },
  accent_control: {
    id: "accent_control",
    label: "Accent Control",
    description: "Intentional dynamic emphasis without disturbing timing.",
    sortOrder: 2,
    coreSkillId: "rhythm_timing",
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
};

const CORE_SKILL_SET = new Set<string>(CORE_SKILLS);
const SUB_SKILL_SET = new Set<string>(SUB_SKILLS);
const TRAINING_ATTRIBUTE_SET = new Set<string>(TRAINING_ATTRIBUTES);

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
  return SUB_SKILL_DEFINITIONS[id].coreSkillId;
}

export function subSkillsForCoreSkill(coreSkillId: CoreSkill): SubSkill[] {
  return SUB_SKILLS.filter(
    (id) => SUB_SKILL_DEFINITIONS[id].coreSkillId === coreSkillId,
  );
}

export function subSkillBelongsToCoreSkill(
  subSkillId: SubSkill,
  coreSkillId: CoreSkill,
): boolean {
  return coreSkillForSubSkill(subSkillId) === coreSkillId;
}

export function skillKnowledgeFilename(id: SubSkill): string {
  return `${id.replace(/_/g, "-")}.md`;
}
