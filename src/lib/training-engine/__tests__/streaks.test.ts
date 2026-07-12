import { describe, expect, it } from "vitest";
import { updateStreak } from "../streaks";

const TZ = "UTC";
const DAY = 24 * 60 * 60 * 1000;

describe("updateStreak", () => {
  it("starts a streak on first practice day", () => {
    const practiceDateMs = Date.parse("2026-07-11T12:00:00Z");

    expect(
      updateStreak({
        currentStreakDays: 0,
        longestStreakDays: 0,
        practiceDate: "2026-07-11",
        practiceDateMs,
        timezone: TZ,
      }),
    ).toEqual({
      lastPracticeDate: "2026-07-11",
      currentStreakDays: 1,
      longestStreakDays: 1,
      streakIncremented: true,
    });
  });

  it("increments when practising on consecutive calendar days", () => {
    const practiceDateMs = Date.parse("2026-07-12T12:00:00Z");

    expect(
      updateStreak({
        lastPracticeDate: "2026-07-11",
        currentStreakDays: 3,
        longestStreakDays: 5,
        practiceDate: "2026-07-12",
        practiceDateMs,
        timezone: TZ,
      }),
    ).toEqual({
      lastPracticeDate: "2026-07-12",
      currentStreakDays: 4,
      longestStreakDays: 5,
      streakIncremented: true,
    });
  });

  it("resets when a day is skipped", () => {
    const practiceDateMs = Date.parse("2026-07-13T12:00:00Z");

    expect(
      updateStreak({
        lastPracticeDate: "2026-07-11",
        currentStreakDays: 4,
        longestStreakDays: 4,
        practiceDate: "2026-07-13",
        practiceDateMs,
        timezone: TZ,
      }),
    ).toEqual({
      lastPracticeDate: "2026-07-13",
      currentStreakDays: 1,
      longestStreakDays: 4,
      streakIncremented: true,
    });
  });

  it("does not change streak when completing another session the same day", () => {
    const practiceDateMs = Date.parse("2026-07-11T18:00:00Z");

    expect(
      updateStreak({
        lastPracticeDate: "2026-07-11",
        currentStreakDays: 2,
        longestStreakDays: 2,
        practiceDate: "2026-07-11",
        practiceDateMs,
        timezone: TZ,
      }),
    ).toEqual({
      lastPracticeDate: "2026-07-11",
      currentStreakDays: 2,
      longestStreakDays: 2,
      streakIncremented: false,
    });
  });

  it("updates longest streak when current exceeds previous record", () => {
    const practiceDateMs = Date.parse("2026-07-12T12:00:00Z");

    expect(
      updateStreak({
        lastPracticeDate: "2026-07-11",
        currentStreakDays: 6,
        longestStreakDays: 6,
        practiceDate: "2026-07-12",
        practiceDateMs,
        timezone: TZ,
      }).longestStreakDays,
    ).toBe(7);
  });
});
