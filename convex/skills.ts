import { v } from "convex/values";
import { query } from "./_generated/server";
import {
  coreSkillValidator,
  subSkillValidator,
  trainingAttributeValidator,
} from "./lib/exerciseValidators";
import {
  CORE_SKILL_DEFINITIONS,
  CORE_SKILLS,
  SUB_SKILL_DEFINITIONS,
  SUB_SKILLS,
  TRAINING_ATTRIBUTE_DEFINITIONS,
  TRAINING_ATTRIBUTES,
} from "../src/lib/skills/taxonomy";

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
      .sort((a, b) => {
        if (a.coreSkillId !== b.coreSkillId) {
          return (
            CORE_SKILL_DEFINITIONS[a.coreSkillId].sortOrder -
            CORE_SKILL_DEFINITIONS[b.coreSkillId].sortOrder
          );
        }
        return a.sortOrder - b.sortOrder;
      });
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
