import { v } from "convex/values";
import { query } from "./_generated/server";
import {
  CORE_SKILL_DEFINITIONS,
  CORE_SKILLS,
  SUB_SKILL_DEFINITIONS,
  SUB_SKILLS,
  TRAINING_ATTRIBUTE_DEFINITIONS,
  TRAINING_ATTRIBUTES,
} from "../src/lib/skills/taxonomy";

const coreSkillValidator = v.union(
  v.literal("picking"),
  v.literal("fretting_control"),
  v.literal("synchronisation"),
  v.literal("rhythm_timing"),
  v.literal("muting_noise_control"),
  v.literal("lead_articulation"),
  v.literal("chord_changes"),
);

const subSkillValidator = v.union(
  v.literal("alternate_picking"),
  v.literal("string_crossing"),
  v.literal("string_skipping"),
  v.literal("finger_independence"),
  v.literal("fretting_accuracy"),
  v.literal("position_shifting"),
  v.literal("legato"),
  v.literal("bends"),
  v.literal("vibrato"),
  v.literal("slides"),
  v.literal("palm_muting"),
  v.literal("fret_hand_muting"),
  v.literal("subdivision_control"),
  v.literal("accent_control"),
);

const trainingAttributeValidator = v.union(
  v.literal("speed"),
  v.literal("endurance"),
  v.literal("accuracy"),
  v.literal("control"),
  v.literal("consistency"),
);

export const listCoreSkills = query({
  args: {},
  returns: v.array(
    v.object({
      id: coreSkillValidator,
      name: v.string(),
      description: v.string(),
      sortOrder: v.number(),
    }),
  ),
  handler: async () => {
    return CORE_SKILLS.map((id) => {
      const skill = CORE_SKILL_DEFINITIONS[id];
      return {
        id,
        name: skill.label,
        description: skill.description,
        sortOrder: skill.sortOrder,
      };
    });
  },
});

export const listSubSkills = query({
  args: { coreSkillId: v.optional(coreSkillValidator) },
  returns: v.array(
    v.object({
      id: subSkillValidator,
      coreSkillId: coreSkillValidator,
      name: v.string(),
      description: v.string(),
      sortOrder: v.number(),
    }),
  ),
  handler: async (_ctx, args) => {
    return SUB_SKILLS.map((id) => {
      const skill = SUB_SKILL_DEFINITIONS[id];
      return {
        id,
        coreSkillId: skill.coreSkillId,
        name: skill.label,
        description: skill.description,
        sortOrder: skill.sortOrder,
      };
    })
      .filter((skill) =>
        args.coreSkillId === undefined
          ? true
          : skill.coreSkillId === args.coreSkillId,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listTrainingAttributes = query({
  args: {},
  returns: v.array(
    v.object({
      id: trainingAttributeValidator,
      name: v.string(),
      description: v.string(),
      sortOrder: v.number(),
    }),
  ),
  handler: async () => {
    return TRAINING_ATTRIBUTES.map((id) => {
      const attribute = TRAINING_ATTRIBUTE_DEFINITIONS[id];
      return {
        id,
        name: attribute.label,
        description: attribute.description,
        sortOrder: attribute.sortOrder,
      };
    });
  },
});
