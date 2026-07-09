import { describe, it, expect } from "vitest";
import {
  everyOtherStringSkip,
  stringSkippingExercises,
} from "../string-skipping";
import { validateExercise } from "../../../src/lib/exercises/validate-exercise";
import { validateTabData } from "../../../src/lib/tabs/validate-tab-data";

function soundedStringSequence(exercise: typeof everyOtherStringSkip): number[] {
  const strings: number[] = [];
  for (const bar of exercise.tabData.bars) {
    for (const beat of bar.beats) {
      if (beat.rest) continue;
      for (const note of beat.notes) {
        strings.push(note.string);
      }
    }
  }
  return strings;
}

describe("everyOtherStringSkip", () => {
  it("passes validateExercise", () => {
    expect(() => validateExercise(everyOtherStringSkip)).not.toThrow();
  });

  it("tabData passes validateTabData", () => {
    expect(() => validateTabData(everyOtherStringSkip.tabData)).not.toThrow();
  });

  it("is tagged as a string skipping primary skill", () => {
    expect(everyOtherStringSkip.primarySkillId).toBe("string_skipping");
    expect(everyOtherStringSkip.slug).toBe("every-other-string-skip");
    expect(everyOtherStringSkip.secondarySkillIds).toContain("alternate_picking");
  });

  it("includes at least one non-adjacent string jump", () => {
    const strings = soundedStringSequence(everyOtherStringSkip);
    expect(strings.length).toBeGreaterThan(1);

    const hasSkip = strings.some((string, i) => {
      if (i === 0) return false;
      const prev = strings[i - 1];
      return prev !== undefined && Math.abs(string - prev) >= 2;
    });
    expect(hasSkip).toBe(true);
  });

  it("wires needs_work follow-up from training_verdict to issue", () => {
    const verdict = everyOtherStringSkip.feedbackSchema.find(
      (q) => q.id === "training_verdict",
    );
    expect(verdict?.followUpRules).toEqual([
      { ifOptionId: "needs_work", showQuestionId: "issue" },
    ]);

    const issue = everyOtherStringSkip.feedbackSchema.find((q) => q.id === "issue");
    expect(issue?.followUpRules).toBeUndefined();
  });
});

describe("stringSkippingExercises", () => {
  it("exports an array containing the drill", () => {
    expect(stringSkippingExercises).toContain(everyOtherStringSkip);
  });

  it("every exercise in the array passes validateExercise", () => {
    for (const exercise of stringSkippingExercises) {
      expect(() => validateExercise(exercise)).not.toThrow();
    }
  });
});
