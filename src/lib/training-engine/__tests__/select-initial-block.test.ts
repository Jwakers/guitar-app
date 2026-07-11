import { describe, expect, it } from "vitest";
import { scaleSessionPattern } from "../block-types";
import { selectInitialBlock } from "../select-initial-block";
import {
  FIXTURE_PROFILE,
  FIXTURE_RATINGS,
} from "./fixtures";

describe("selectInitialBlock", () => {
  it("selects foundation when fewer than 2 core skills are weak", () => {
    const ratings = FIXTURE_RATINGS.filter(
      (r) =>
        !(
          r.skillTarget.kind === "core" &&
          (r.skillTarget.id === "fretting_control" ||
            r.skillTarget.id === "rhythm_timing")
        ),
    );
    const result = selectInitialBlock(
      {
        ...FIXTURE_PROFILE,
        focusCoreSkillIds: ["picking", "synchronisation"],
        focusSubSkillIds: ["alternate_picking"],
      },
      ratings,
    );
    expect(result.blockType).toBe("foundation");
    expect(result.focusCoreSkillIds).toContain("picking");
  });

  it("selects weakness_focus when 2+ core skills are weak", () => {
    const result = selectInitialBlock(
      {
        ...FIXTURE_PROFILE,
        focusCoreSkillIds: ["picking"],
        focusSubSkillIds: [],
      },
      FIXTURE_RATINGS,
    );
    expect(result.blockType).toBe("weakness_focus");
    expect(result.durationWeeks).toBe(4);
  });
});

describe("scaleSessionPattern", () => {
  const pattern = ["standard", "standard", "light", "standard", "test"] as const;

  it("returns single standard for one practice day", () => {
    expect(scaleSessionPattern([...pattern], 1)).toEqual(["standard"]);
  });

  it("scales to three days by truncating the pattern", () => {
    expect(scaleSessionPattern([...pattern], 3)).toEqual([
      "standard",
      "standard",
      "light",
    ]);
  });
});
