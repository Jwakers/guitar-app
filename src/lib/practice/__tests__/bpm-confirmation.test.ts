import { describe, expect, it } from "vitest";
import {
  exerciseUsesBpmMetric,
  needsBpmConfirmation,
  suggestedCleanBpmOptions,
} from "../bpm-confirmation";

describe("bpm-confirmation", () => {
  it("needsBpmConfirmation when peak exceeds current", () => {
    expect(needsBpmConfirmation(80, 100)).toBe(true);
    expect(needsBpmConfirmation(100, 100)).toBe(false);
  });

  it("suggestedCleanBpmOptions counts down from peak", () => {
    expect(suggestedCleanBpmOptions(95, 90)).toEqual([
      95, 94, 93, 92, 91, 90,
    ]);
  });

  it("exerciseUsesBpmMetric detects BPM exercises", () => {
    expect(
      exerciseUsesBpmMetric({
        supportsBpm: true,
        primaryProgressMetric: "accuracy_score",
      }),
    ).toBe(true);
    expect(
      exerciseUsesBpmMetric({
        supportsBpm: false,
        primaryProgressMetric: "clean_bpm",
      }),
    ).toBe(true);
  });
});
