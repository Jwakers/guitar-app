import { describe, expect, it } from "vitest";
import { normalizeSessionsPerWeek } from "../constants";

describe("normalizeSessionsPerWeek", () => {
  it("defaults undefined to 7", () => {
    expect(normalizeSessionsPerWeek(undefined)).toBe(7);
  });

  it("accepts integer values between 1 and 7", () => {
    expect(normalizeSessionsPerWeek(3)).toBe(3);
  });

  it("rejects fractional values", () => {
    expect(() => normalizeSessionsPerWeek(3.5)).toThrow(
      "Sessions per week must be between 1 and 7",
    );
  });

  it("rejects out-of-range values", () => {
    expect(() => normalizeSessionsPerWeek(0)).toThrow(
      "Sessions per week must be between 1 and 7",
    );
  });
});
