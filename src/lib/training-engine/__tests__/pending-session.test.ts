import { describe, expect, it } from "vitest";
import { pickNewestPendingSession } from "../pending-session";

describe("pickNewestPendingSession", () => {
  it("returns the newest planned or active session", () => {
    const picked = pickNewestPendingSession([
      { status: "completed", createdAt: 100 },
      { status: "planned", createdAt: 200 },
      { status: "active", createdAt: 300 },
      { status: "skipped", createdAt: 400 },
    ]);

    expect(picked?.createdAt).toBe(300);
  });

  it("returns null when no pending sessions exist", () => {
    expect(
      pickNewestPendingSession([
        { status: "completed", createdAt: 100 },
        { status: "skipped", createdAt: 200 },
      ]),
    ).toBeNull();
  });
});
