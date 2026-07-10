import { describe, expect, it } from "vitest";
import {
  CORE_SKILLS,
  SUB_SKILLS,
  TRAINING_ATTRIBUTES,
  coreSkillForSubSkill,
  isCoreSkill,
  isSubSkill,
  isTrainingAttribute,
  skillKnowledgeFilename,
  subSkillBelongsToCoreSkill,
  subSkillsForCoreSkill,
} from "../taxonomy";

describe("skill taxonomy", () => {
  it("defines the seven core skill areas", () => {
    expect(CORE_SKILLS).toEqual([
      "picking",
      "fretting_control",
      "synchronisation",
      "rhythm_timing",
      "muting_noise_control",
      "lead_articulation",
      "chord_changes",
    ]);
  });

  it("keeps speed and endurance as training attributes only", () => {
    expect(TRAINING_ATTRIBUTES).toContain("speed");
    expect(TRAINING_ATTRIBUTES).toContain("endurance");
    expect(isCoreSkill("speed")).toBe(false);
    expect(isCoreSkill("endurance")).toBe(false);
    expect(isTrainingAttribute("speed")).toBe(true);
    expect(isTrainingAttribute("endurance")).toBe(true);
  });

  it("maps former top-level techniques to sub-skills", () => {
    expect(SUB_SKILLS).toContain("alternate_picking");
    expect(SUB_SKILLS).toContain("string_crossing");
    expect(SUB_SKILLS).toContain("legato");
    expect(isSubSkill("bends")).toBe(true);
    expect(isCoreSkill("bends")).toBe(false);
    expect(coreSkillForSubSkill("bends")).toBe("lead_articulation");
  });

  it("groups sub-skills by core skill", () => {
    expect(subSkillsForCoreSkill("picking")).toEqual([
      "alternate_picking",
      "string_crossing",
      "string_skipping",
    ]);
    expect(subSkillBelongsToCoreSkill("vibrato", "lead_articulation")).toBe(
      true,
    );
    expect(subSkillBelongsToCoreSkill("vibrato", "picking")).toBe(false);
  });

  it("uses sub-skill IDs for knowledge document filenames", () => {
    expect(skillKnowledgeFilename("string_crossing")).toBe(
      "string-crossing.md",
    );
  });
});
