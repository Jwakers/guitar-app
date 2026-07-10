import { describe, expect, it } from "vitest";
import { inferDifficultyLevel } from "../infer-difficulty";

describe("inferDifficultyLevel", () => {
  it("defaults to 5 when the library is empty", () => {
    expect(inferDifficultyLevel([])).toBe(5);
  });

  it("prefers underfilled mid-range over extremes", () => {
    const drills = [
      { difficultyLevel: 1, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 1, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 10, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
    ];
    const level = inferDifficultyLevel(drills, "picking", ["alternate_picking"]);
    expect(level).toBeGreaterThanOrEqual(4);
    expect(level).toBeLessThanOrEqual(8);
  });

  it("scopes counts to the selected skill", () => {
    const drills = [
      { difficultyLevel: 5, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 5, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 5, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 6, coreSkillId: "lead_articulation", subSkillIds: ["bends"] },
    ];
    const level = inferDifficultyLevel(drills, "picking", ["alternate_picking"]);
    // 5 is saturated for this skill; another mid level should win.
    expect(level).not.toBe(5);
    expect(level).toBeGreaterThanOrEqual(3);
    expect(level).toBeLessThanOrEqual(8);
  });

  it("includes drills matching any selected sub-skill", () => {
    const drills = [
      { difficultyLevel: 4, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 4, coreSkillId: "picking", subSkillIds: ["string_crossing"] },
      { difficultyLevel: 9, coreSkillId: "picking", subSkillIds: ["string_skipping"] },
    ];
    const level = inferDifficultyLevel(drills, "picking", [
      "alternate_picking",
      "string_crossing",
    ]);
    expect(level).toBeGreaterThanOrEqual(4);
    expect(level).toBeLessThanOrEqual(8);
  });
});
