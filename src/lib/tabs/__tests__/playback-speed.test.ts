import { describe, expect, it } from "vitest";
import { computePlaybackSpeed } from "../playback-speed";

describe("computePlaybackSpeed", () => {
  it("returns 1 when playback matches written tempo", () => {
    expect(computePlaybackSpeed(90, 90)).toBe(1);
  });

  it("scales up when playback BPM is higher", () => {
    expect(computePlaybackSpeed(90, 100)).toBeCloseTo(100 / 90);
  });

  it("scales down when playback BPM is lower", () => {
    expect(computePlaybackSpeed(120, 60)).toBe(0.5);
  });

  it("returns 1 when tab tempo is not positive", () => {
    expect(computePlaybackSpeed(0, 100)).toBe(1);
    expect(computePlaybackSpeed(-10, 100)).toBe(1);
  });
});
