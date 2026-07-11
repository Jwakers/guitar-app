import { describe, expect, it } from "vitest";
import {
  formatDateInTimezone,
  getCalendarWeekStartDate,
} from "../dates";

describe("getCalendarWeekStartDate", () => {
  it("returns the same Monday when the input is already Monday", () => {
    // 2026-07-06 is a Monday in UTC
    const mondayMs = Date.parse("2026-07-06T12:00:00Z");
    expect(getCalendarWeekStartDate(mondayMs, "UTC")).toBe("2026-07-06");
  });

  it("returns the preceding Monday when the input is Sunday", () => {
    // 2026-07-12 is a Sunday in UTC
    const sundayMs = Date.parse("2026-07-12T12:00:00Z");
    expect(getCalendarWeekStartDate(sundayMs, "UTC")).toBe("2026-07-06");
  });

  it("handles timezone offsets that cross local midnight", () => {
    // 2026-07-07T02:30:00Z is still Monday evening in America/Los_Angeles
    const lateEveningMs = Date.parse("2026-07-07T02:30:00Z");
    expect(getCalendarWeekStartDate(lateEveningMs, "America/Los_Angeles")).toBe(
      "2026-07-06",
    );
    expect(formatDateInTimezone(lateEveningMs, "America/Los_Angeles")).toBe(
      "2026-07-06",
    );
  });

  it("remains correct across a US DST spring-forward boundary", () => {
    // 2026-03-09 is Monday; spring forward happened on 2026-03-08 in New York
    const mondayAfterDstMs = Date.parse("2026-03-09T15:00:00Z");
    expect(getCalendarWeekStartDate(mondayAfterDstMs, "America/New_York")).toBe(
      "2026-03-09",
    );

    const sundayBeforeDstMs = Date.parse("2026-03-08T15:00:00Z");
    expect(
      getCalendarWeekStartDate(sundayBeforeDstMs, "America/New_York"),
    ).toBe("2026-03-02");
  });
});
