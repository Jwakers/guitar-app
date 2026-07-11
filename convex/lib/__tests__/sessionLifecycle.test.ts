import { describe, expect, it } from "vitest";
import type { Id } from "../../_generated/dataModel";
import type { Doc } from "../../_generated/dataModel";
import {
  applyCompleteExerciseItem,
  applyStartSession,
  deriveCurrentIndex,
  patchExerciseItemAtOrder,
} from "../sessionLifecycle";
import type { SessionExerciseItem } from "../sessionLifecycle";

function item(
  order: number,
  status: SessionExerciseItem["status"],
): SessionExerciseItem {
  return {
    exerciseId: `ex_${order}` as Id<"exercises">,
    slotType: "primary",
    order,
    targetMetric: "clean_bpm",
    durationMinutes: 10,
    status,
    reasonCodes: [],
  };
}

const baseSession: Doc<"practiceSessions"> = {
  _id: "sess_1" as Id<"practiceSessions">,
  _creationTime: 0,
  userId: "user_1" as Id<"users">,
  date: "2026-07-10",
  title: "Test Session",
  goal: "Test",
  estimatedMinutes: 30,
  status: "planned",
  sessionType: "standard",
  exerciseItems: [item(0, "pending"), item(1, "pending"), item(2, "pending")],
  createdAt: 0,
};

describe("deriveCurrentIndex", () => {
  it("returns first pending item", () => {
    expect(deriveCurrentIndex([item(0, "completed"), item(1, "pending")])).toBe(
      1,
    );
  });

  it("returns -1 when all terminal", () => {
    expect(
      deriveCurrentIndex([item(0, "completed"), item(1, "skipped")]),
    ).toBe(-1);
  });
});

describe("patchExerciseItemAtOrder", () => {
  it("patches only the matching order", () => {
    const items = [item(0, "pending"), item(1, "pending")];
    const patched = patchExerciseItemAtOrder(items, 1, { status: "active" });
    expect(patched[0]?.status).toBe("pending");
    expect(patched[1]?.status).toBe("active");
  });
});

describe("applyStartSession", () => {
  it("activates first pending item", () => {
    const result = applyStartSession(baseSession, 1000);
    expect(result.status).toBe("active");
    expect(result.exerciseItems[0]?.status).toBe("active");
    expect(result.exerciseItems[0]?.startedAt).toBe(1000);
    expect(result.exerciseItems[1]?.status).toBe("pending");
  });

  it("is idempotent for completed sessions", () => {
    const completed = { ...baseSession, status: "completed" as const };
    const result = applyStartSession(completed, 1000);
    expect(result.status).toBe("completed");
    expect(result.exerciseItems).toEqual(completed.exerciseItems);
  });
});

describe("applyCompleteExerciseItem", () => {
  it("completes item and activates next", () => {
    const active = {
      ...baseSession,
      status: "active" as const,
      exerciseItems: [
        { ...item(0, "active"), startedAt: 500 },
        item(1, "pending"),
        item(2, "pending"),
      ],
    };
    const result = applyCompleteExerciseItem(
      active,
      0,
      { kind: "skipped_feedback" },
      2000,
    );
    expect(result.hasMoreExercises).toBe(true);
    expect(result.nextOrder).toBe(1);
    expect(result.exerciseItems[0]?.status).toBe("completed");
    expect(result.exerciseItems[0]?.completedAt).toBe(2000);
    expect(result.exerciseItems[1]?.status).toBe("active");
  });

  it("returns no more exercises after last item", () => {
    const active = {
      ...baseSession,
      status: "active" as const,
      exerciseItems: [
        { ...item(0, "completed"), completedAt: 1000 },
        { ...item(1, "active"), startedAt: 1500 },
      ],
    };
    const result = applyCompleteExerciseItem(
      active,
      1,
      { kind: "placeholder_feedback", trainingVerdict: "nailed_it" },
      3000,
    );
    expect(result.hasMoreExercises).toBe(false);
    expect(result.nextOrder).toBe(null);
  });
});
