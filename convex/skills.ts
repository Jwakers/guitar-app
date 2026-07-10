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
  subSkillsForCoreSkill,
  TRAINING_ATTRIBUTE_DEFINITIONS,
  TRAINING_ATTRIBUTES,
  type CoreSkill,
  type SubSkill,
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
    if (args.coreSkillId !== undefined) {
      return subSkillsForCoreSkill(args.coreSkillId)
        .map((id) => {
          const skill = SUB_SKILL_DEFINITIONS[id];
          return {
            id,
            coreSkillId: args.coreSkillId!,
            name: skill.label,
            description: skill.description,
            sortOrder: skill.sortOrder,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const entries = SUB_SKILLS.flatMap((id: SubSkill) => {
      const skill = SUB_SKILL_DEFINITIONS[id];
      return skill.allowedCoreSkillIds.map((coreSkillId: CoreSkill) => ({
        id,
        coreSkillId,
        name: skill.label,
        description: skill.description,
        sortOrder: skill.sortOrder,
      }));
    });

    return entries.sort((a, b) => {
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
