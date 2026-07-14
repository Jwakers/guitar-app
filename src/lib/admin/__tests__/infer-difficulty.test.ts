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
    expect(
      inferDifficultyLevel(drills, "picking", ["alternate_picking"]),
    ).toBe(3);
  });

  it("scopes counts to the selected skill", () => {
    const drills = [
      // Picking: level 1 empty; other levels filled
      { difficultyLevel: 2, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 2, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 3, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 3, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 4, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 4, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 5, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 5, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 6, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 7, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 8, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      // Unrelated skill with many level-1 drills — must not leak into picking
      ...Array.from({ length: 20 }, () => ({
        difficultyLevel: 1,
        coreSkillId: "lead_articulation",
        subSkillIds: ["bends"],
      })),
    ];

    expect(
      inferDifficultyLevel(drills, "picking", ["alternate_picking"]),
    ).toBe(1);

    // If the unrelated drills leaked, level 1 would be saturated and result ≠ 1
    expect(inferDifficultyLevel(drills)).toBe(3);
  });

  it("includes drills matching any selected sub-skill", () => {
    const drills = [
      { difficultyLevel: 2, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 3, coreSkillId: "picking", subSkillIds: ["string_crossing"] },
      { difficultyLevel: 4, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 5, coreSkillId: "picking", subSkillIds: ["string_crossing"] },
      { difficultyLevel: 6, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { difficultyLevel: 7, coreSkillId: "picking", subSkillIds: ["string_crossing"] },
      { difficultyLevel: 8, coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      // Non-matching sub-skill with many level-1 drills
      ...Array.from({ length: 20 }, () => ({
        difficultyLevel: 1,
        coreSkillId: "picking",
        subSkillIds: ["string_skipping"],
      })),
    ];

    expect(
      inferDifficultyLevel(drills, "picking", [
        "alternate_picking",
        "string_crossing",
      ]),
    ).toBe(1);

    // Including the skipped sub-skill saturates level 1
    expect(
      inferDifficultyLevel(drills, "picking", [
        "alternate_picking",
        "string_crossing",
        "string_skipping",
      ]),
    ).toBe(3);
  });
});
