import { describe, expect, it } from "vitest";
import {
  formatSkillRatingChangeLine,
  formatSkillRatingDelta,
  sortSkillRatingChanges,
} from "../skill-rating-display";

describe("formatSkillRatingDelta", () => {
  it("formats positive and negative deltas", () => {
    expect(formatSkillRatingDelta(60, 64)).toBe("+4");
    expect(formatSkillRatingDelta(70, 67)).toBe("-3");
    expect(formatSkillRatingDelta(65, 65)).toBe("0");
  });
});

describe("formatSkillRatingChangeLine", () => {
  it("includes skill label and rating transition", () => {
    expect(
      formatSkillRatingChangeLine({
        skillTarget: { kind: "core", id: "picking" },
        oldRating: 62,
        newRating: 58,
      }),
    ).toBe("Picking 62 → 58 (-4)");
  });
});

describe("sortSkillRatingChanges", () => {
  it("orders by largest absolute change first", () => {
    const sorted = sortSkillRatingChanges([
      {
        skillTarget: { kind: "sub", id: "string_crossing" },
        oldRating: 60,
        newRating: 61,
      },
      {
        skillTarget: { kind: "core", id: "picking" },
        oldRating: 70,
        newRating: 64,
      },
    ]);

    expect(sorted[0]?.skillTarget.id).toBe("picking");
  });
});
