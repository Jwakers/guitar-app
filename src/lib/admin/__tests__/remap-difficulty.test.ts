import { describe, expect, it } from "vitest";
import {
  difficultyRemapTable,
  remapDifficultyLevel,
} from "../remap-difficulty";

describe("remapDifficultyLevel", () => {
  it("maps the full old→new table", () => {
    const table = difficultyRemapTable();
    for (const [oldStr, expected] of Object.entries(table)) {
      const old = Number(oldStr);
      expect(remapDifficultyLevel(old)).toBe(expected);
    }
  });

  it("keeps level 1 as a fixed point", () => {
    expect(remapDifficultyLevel(1)).toBe(1);
  });

  it("passes through invalid levels unchanged", () => {
    expect(remapDifficultyLevel(0)).toBe(0);
    expect(remapDifficultyLevel(11)).toBe(11);
    expect(remapDifficultyLevel(3.5)).toBe(3.5);
  });
});
