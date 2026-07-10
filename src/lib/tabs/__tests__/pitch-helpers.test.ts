import { describe, expect, it } from "vitest";
import {
  bendQuarterTones,
  bendSemitones,
  isAllowedBendSemitones,
  validateBendTargetPitch,
} from "../pitch-helpers";
import type { TabNote } from "../internal-schema";

const STANDARD_TUNING = ["E", "A", "D", "G", "B", "E"];

describe("isAllowedBendSemitones", () => {
  it("allows half and whole step only", () => {
    expect(isAllowedBendSemitones(1)).toBe(true);
    expect(isAllowedBendSemitones(2)).toBe(true);
    expect(isAllowedBendSemitones(3)).toBe(false);
    expect(isAllowedBendSemitones(9)).toBe(false);
  });
});

describe("validateBendTargetPitch", () => {
  it("accepts half-step bend B string fret 7 to G4", () => {
    expect(() =>
      validateBendTargetPitch("G4", STANDARD_TUNING, 2, 7, "note"),
    ).not.toThrow();
  });

  it("accepts whole-step bend B string fret 7 to G#4", () => {
    expect(() =>
      validateBendTargetPitch("G#4", STANDARD_TUNING, 2, 7, "note"),
    ).not.toThrow();
  });

  it("rejects minor third (3 semitones)", () => {
    expect(() =>
      validateBendTargetPitch("A4", STANDARD_TUNING, 2, 7, "note"),
    ).toThrow(/half step \(1 semitone\) or whole step \(2 semitones\), got 3/);
  });

  it("rejects 4.5-step bend (9 semitones)", () => {
    expect(() =>
      validateBendTargetPitch("D#5", STANDARD_TUNING, 2, 7, "note"),
    ).toThrow(/half step \(1 semitone\) or whole step \(2 semitones\), got 9/);
  });
});

describe("bendQuarterTones", () => {
  const halfStepNote: TabNote = {
    string: 2,
    fret: 7,
    technique: "bend",
    targetPitch: "G4",
  };

  const wholeStepNote: TabNote = {
    string: 2,
    fret: 7,
    technique: "bend",
    targetPitch: "G#4",
  };

  it("returns 2 quarter-tones for half step", () => {
    expect(bendQuarterTones(halfStepNote, STANDARD_TUNING)).toBe(2);
  });

  it("returns 4 quarter-tones for whole step", () => {
    expect(bendQuarterTones(wholeStepNote, STANDARD_TUNING)).toBe(4);
  });

  it("bendSemitones matches fretted to target interval", () => {
    const from = 66; // F#4
    const toHalf = 67; // G4
    const toWhole = 68; // G#4
    expect(bendSemitones(from, toHalf)).toBe(1);
    expect(bendSemitones(from, toWhole)).toBe(2);
  });
});
