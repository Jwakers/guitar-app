import { describe, expect, it } from "vitest";
import { resolveInitialBpm } from "../defaults";

describe("resolveInitialBpm", () => {
  const exercise = {
    defaultTargetBpm: 90,
    tabData: { tempo: 80 },
  };

  it("prefers session target BPM", () => {
    expect(resolveInitialBpm({ targetBpm: 100 }, exercise)).toBe(100);
  });

  it("falls back to exercise defaultTargetBpm", () => {
    expect(resolveInitialBpm({}, exercise)).toBe(90);
  });

  it("falls back to tab tempo", () => {
    expect(
      resolveInitialBpm(
        {},
        { tabData: { tempo: 72 } },
      ),
    ).toBe(72);
  });
});
