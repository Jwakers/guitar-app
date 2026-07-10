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
  subSkillsForCoreSkill,
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
    const skillIds =
      args.coreSkillId === undefined
        ? (Object.keys(SUB_SKILL_DEFINITIONS) as (keyof typeof SUB_SKILL_DEFINITIONS)[])
        : subSkillsForCoreSkill(args.coreSkillId);

    return skillIds
      .map((id) => {
        const skill = SUB_SKILL_DEFINITIONS[id];
        return {
          id,
          coreSkillId: args.coreSkillId ?? skill.primaryCoreSkillId,
          name: skill.label,
          description: skill.description,
          sortOrder: skill.sortOrder,
        };
      })
      .sort((a, b) => {
        const aCore = args.coreSkillId ?? SUB_SKILL_DEFINITIONS[a.id].primaryCoreSkillId;
        const bCore = args.coreSkillId ?? SUB_SKILL_DEFINITIONS[b.id].primaryCoreSkillId;
        if (aCore !== bCore) {
          return (
            CORE_SKILL_DEFINITIONS[aCore].sortOrder -
            CORE_SKILL_DEFINITIONS[bCore].sortOrder
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
