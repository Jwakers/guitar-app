import { describe, expect, it } from "vitest";
import {
  allItemsTerminal,
  deriveCurrentIndex,
  initialPracticePhase,
} from "../player-state";

describe("player-state", () => {
  it("deriveCurrentIndex finds first non-terminal item", () => {
    const items = [
      { order: 0, status: "completed" as const },
      { order: 1, status: "active" as const },
    ];
    expect(deriveCurrentIndex(items)).toBe(1);
  });

  it("allItemsTerminal is true when every item is done", () => {
    const items = [
      { order: 0, status: "completed" as const },
      { order: 1, status: "skipped" as const },
    ];
    expect(allItemsTerminal(items)).toBe(true);
  });

  it("initialPracticePhase returns summary for completed session", () => {
    const items = [
      { order: 0, status: "completed" as const },
      { order: 1, status: "completed" as const },
    ];
    expect(initialPracticePhase(items, "completed")).toBe("summary");
  });

  it("initialPracticePhase returns exercise for active session", () => {
    const items = [
      { order: 0, status: "completed" as const },
      { order: 1, status: "pending" as const },
    ];
    expect(initialPracticePhase(items, "active")).toBe("exercise");
  });
});
