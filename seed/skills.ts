export type SkillSeedEntry = {
  name: string;
  description: string;
  category: string;
  isMvp: boolean;
  sortOrder: number;
};

export const SKILLS_SEED: SkillSeedEntry[] = [
  // Picking
  {
    name: "Alternate Picking",
    description:
      "Strict down-up picking motion with consistent attack on every note.",
    category: "picking",
    isMvp: true,
    sortOrder: 1,
  },
  {
    name: "String Crossing",
    description:
      "Accurate and efficient pick movement across non-adjacent strings.",
    category: "picking",
    isMvp: true,
    sortOrder: 2,
  },
  {
    name: "String Skipping",
    description:
      "Skipping strings with the pick while maintaining timing and cleanliness.",
    category: "picking",
    isMvp: true,
    sortOrder: 3,
  },

  // Fretting
  {
    name: "Fretting Accuracy",
    description:
      "Pressing cleanly behind the fret with minimal buzz and efficient finger placement.",
    category: "fretting",
    isMvp: true,
    sortOrder: 4,
  },
  {
    name: "Synchronisation",
    description:
      "Both hands landing and releasing notes at exactly the same time.",
    category: "fretting",
    isMvp: true,
    sortOrder: 5,
  },
  {
    name: "Legato",
    description:
      "Smooth hammer-ons and pull-offs with consistent volume and clarity.",
    category: "fretting",
    isMvp: true,
    sortOrder: 6,
  },

  // Expression
  {
    name: "Bends",
    description:
      "Accurate pitch bends to the target note with control and consistency.",
    category: "expression",
    isMvp: true,
    sortOrder: 7,
  },
  {
    name: "Vibrato",
    description:
      "Controlled, even pitch oscillation around a sustained note.",
    category: "expression",
    isMvp: true,
    sortOrder: 8,
  },

  // Rhythm
  {
    name: "Rhythm",
    description:
      "Maintaining accurate subdivision and timing across different feels and meters.",
    category: "rhythm",
    isMvp: true,
    sortOrder: 9,
  },
  {
    name: "Muting",
    description:
      "Controlling unwanted string noise with both palm and fretting-hand muting.",
    category: "rhythm",
    isMvp: true,
    sortOrder: 10,
  },
  {
    name: "Chord Changes",
    description:
      "Smooth, in-time transitions between chord shapes with clean voicings.",
    category: "rhythm",
    isMvp: true,
    sortOrder: 11,
  },

  // Conditioning
  {
    name: "Endurance",
    description:
      "Sustaining clean technique over extended durations without fatigue degradation.",
    category: "conditioning",
    isMvp: true,
    sortOrder: 12,
  },
  {
    name: "Speed",
    description:
      "Maximum clean tempo across a target pattern with consistent accuracy.",
    category: "conditioning",
    isMvp: true,
    sortOrder: 13,
  },
];
