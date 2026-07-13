import { describe, expect, it } from "vitest";
import { MVP_ACHIEVEMENTS } from "../achievements";

describe("achievement catalog seed", () => {
  it("defines seven MVP medals for idempotent seeding", () => {
    expect(MVP_ACHIEVEMENTS).toHaveLength(7);
    expect(new Set(MVP_ACHIEVEMENTS.map((a) => a.title)).size).toBe(7);
  });
});
