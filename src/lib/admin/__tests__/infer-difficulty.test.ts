import { describe, expect, it } from "vitest";
import { inferDifficultyLevel } from "../infer-difficulty";

describe("inferDifficultyLevel", () => {
  it("defaults to 3 when the library is empty", () => {
    expect(inferDifficultyLevel([])).toBe(3);
  });

  it("prefers underfilled start/solid band over mastery extremes", () => {
    const drills = [
      { difficultyLevel: 1, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 1, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 10, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
    ];
    const level = inferDifficultyLevel(drills, "picking", ["alternate_picking"]);
    expect(level).toBeGreaterThanOrEqual(2);
    expect(level).toBeLessThanOrEqual(6);
  });

  it("scopes counts to the selected skill", () => {
    const drills = [
      { difficultyLevel: 3, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 3, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 3, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 4, coreSkillId: "lead_articulation", subSkillIds: ["bends"] },
    ];
    const level = inferDifficultyLevel(drills, "picking", ["alternate_picking"]);
    // 3 is saturated for this skill; another start/solid level should win.
    expect(level).not.toBe(3);
    expect(level).toBeGreaterThanOrEqual(1);
    expect(level).toBeLessThanOrEqual(6);
  });

  it("includes drills matching any selected sub-skill", () => {
    const drills = [
      { difficultyLevel: 2, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 2, coreSkillId: "picking", subSkillIds: ["string_crossing"] },
      { difficultyLevel: 9, coreSkillId: "picking", subSkillIds: ["string_skipping"] },
    ];
    const level = inferDifficultyLevel(drills, "picking", [
      "alternate_picking",
      "string_crossing",
    ]);
    expect(level).toBeGreaterThanOrEqual(1);
    expect(level).toBeLessThanOrEqual(6);
  });
});
