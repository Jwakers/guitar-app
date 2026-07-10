import { describe, expect, it } from "vitest";
import {
  CORE_SKILLS,
  CROSS_CUTTING_SUB_SKILLS,
  SUB_SKILLS,
  TRAINING_ATTRIBUTES,
  coreSkillForSubSkill,
  isCoreSkill,
  isSubSkill,
  isTrainingAttribute,
  skillKnowledgeFilename,
  subSkillBelongsToCoreSkill,
  subSkillCanDriveStandaloneGeneration,
  subSkillsForCoreSkill,
} from "../taxonomy";

describe("skill taxonomy", () => {
  it("defines the six core skill areas", () => {
    expect(CORE_SKILLS).toEqual([
      "picking",
      "fretting_control",
      "synchronisation",
      "rhythm_timing",
      "lead_articulation",
      "chord_changes",
    ]);
  });

  it("keeps speed and endurance as training attributes only", () => {
    expect(TRAINING_ATTRIBUTES).toContain("speed");
    expect(TRAINING_ATTRIBUTES).toContain("endurance");
    expect(TRAINING_ATTRIBUTES).toContain("cleanliness");
    expect(TRAINING_ATTRIBUTES).toContain("noise_control");
    expect(isCoreSkill("speed")).toBe(false);
    expect(isCoreSkill("endurance")).toBe(false);
    expect(isTrainingAttribute("speed")).toBe(true);
    expect(isTrainingAttribute("noise_control")).toBe(true);
  });

  it("maps former top-level techniques to sub-skills", () => {
    expect(SUB_SKILLS).toContain("alternate_picking");
    expect(SUB_SKILLS).toContain("string_crossing");
    expect(SUB_SKILLS).toContain("legato");
    expect(SUB_SKILLS).toContain("release_control");
    expect(isSubSkill("bends")).toBe(true);
    expect(isCoreSkill("bends")).toBe(false);
    expect(coreSkillForSubSkill("bends")).toBe("lead_articulation");
  });

  it("groups sub-skills by allowed core skill attachment", () => {
    expect(subSkillsForCoreSkill("picking")).toEqual(
      expect.arrayContaining([
        "alternate_picking",
        "string_crossing",
        "string_skipping",
        "fret_hand_muting",
      ]),
    );
    expect(subSkillBelongsToCoreSkill("palm_muting", "rhythm_timing")).toBe(
      true,
    );
    expect(subSkillBelongsToCoreSkill("palm_muting", "picking")).toBe(true);
    expect(subSkillBelongsToCoreSkill("vibrato", "picking")).toBe(false);
  });

  it("treats muting tags as cross-cutting sub-skills", () => {
    expect(CROSS_CUTTING_SUB_SKILLS.has("palm_muting")).toBe(true);
    expect(CROSS_CUTTING_SUB_SKILLS.has("release_control")).toBe(true);
    expect(subSkillCanDriveStandaloneGeneration(["palm_muting"])).toBe(false);
    expect(
      subSkillCanDriveStandaloneGeneration([
        "alternate_picking",
        "palm_muting",
      ]),
    ).toBe(true);
  });

  it("uses sub-skill IDs for knowledge document filenames", () => {
    expect(skillKnowledgeFilename("string_crossing")).toBe(
      "string-crossing.md",
    );
  });
});
