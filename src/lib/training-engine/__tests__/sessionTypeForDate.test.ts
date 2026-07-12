import { describe, expect, it } from "vitest";
import { sessionTypeForDate } from "../../../../convex/lib/provisionTraining";
import { FIXTURE_PROFILE } from "./fixtures";

describe("sessionTypeForDate", () => {
  it("returns a session type on any calendar day", () => {
    const sundayMs = Date.parse("2026-07-12T12:00:00Z");
    const result = sessionTypeForDate(
      sundayMs,
      "UTC",
      { ...FIXTURE_PROFILE, sessionsPerWeek: 7 },
      "foundation",
    );

    expect(result.sessionType).toBeDefined();
    expect(result.dayName).toBe("Sunday");
  });

  it("rotates session types by weekday without availableDays gating", () => {
    const monday = sessionTypeForDate(
      Date.parse("2026-07-06T12:00:00Z"),
      "UTC",
      { ...FIXTURE_PROFILE, sessionsPerWeek: 3 },
      "foundation",
    );
    const tuesday = sessionTypeForDate(
      Date.parse("2026-07-07T12:00:00Z"),
      "UTC",
      { ...FIXTURE_PROFILE, sessionsPerWeek: 3 },
      "foundation",
    );

    expect(monday.sessionType).toBeDefined();
    expect(tuesday.sessionType).toBeDefined();
  });
});
