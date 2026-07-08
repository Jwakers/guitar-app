import { describe, it, expect } from "vitest";
import {
  singleStringAlternatePickingControl,
  alternatePickingExercises,
} from "../alternate-picking";
import { validateExercise } from "../../../src/lib/exercises/validate-exercise";
import { validateTabData } from "../../../src/lib/tabs/validate-tab-data";

describe("singleStringAlternatePickingControl", () => {
  it("passes validateExercise", () => {
    expect(() => validateExercise(singleStringAlternatePickingControl)).not.toThrow();
  });

  it("tabData passes validateTabData", () => {
    expect(() =>
      validateTabData(singleStringAlternatePickingControl.tabData),
    ).not.toThrow();
  });

  it("feedbackSchema includes required questions", () => {
    const ids = singleStringAlternatePickingControl.feedbackSchema.map(
      (q) => q.id,
    );
    expect(ids).toContain("actual_bpm");
    expect(ids).toContain("training_verdict");
    expect(ids).toContain("difficulty");
    expect(ids).toContain("cleanliness");
  });

  it("invalid tabData with an out-of-range fret fails validateTabData", () => {
    const badTabData = {
      ...singleStringAlternatePickingControl.tabData,
      bars: [
        {
          beats: [
            {
              duration: "eighth",
              picking: "down",
              notes: [{ string: 6, fret: 999, finger: 1 }],
            },
          ],
        },
      ],
    };
    expect(() => validateTabData(badTabData)).toThrow(/fret/);
  });
});

describe("alternatePickingExercises", () => {
  it("exports an array containing the drill", () => {
    expect(alternatePickingExercises).toContain(
      singleStringAlternatePickingControl,
    );
  });

  it("every exercise in the array passes validateExercise", () => {
    for (const exercise of alternatePickingExercises) {
      expect(() => validateExercise(exercise)).not.toThrow();
    }
  });
});
