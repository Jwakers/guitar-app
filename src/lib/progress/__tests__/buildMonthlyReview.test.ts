import { describe, expect, it } from "vitest";
import {
  buildMonthlyReview,
  compareYearMonth,
  computeMonthlyReviewBounds,
  isSessionDateInMonth,
} from "../buildMonthlyReview";

describe("isSessionDateInMonth", () => {
  it("matches YYYY-MM-DD session dates to calendar month", () => {
    expect(isSessionDateInMonth("2026-07-07", 2026, 7)).toBe(true);
    expect(isSessionDateInMonth("2026-07-07", 2026, 6)).toBe(false);
  });
});

describe("buildMonthlyReview", () => {
  it("aggregates monthly practice stats and recommendations", () => {
    const review = buildMonthlyReview({
      year: 2026,
      month: 7,
      timezone: "UTC",
      sessionsPerWeek: 3,
      sessions: [
        {
          date: "2026-07-07",
          estimatedMinutes: 30,
          status: "completed",
        },
        {
          date: "2026-07-09",
          estimatedMinutes: 25,
          status: "completed",
        },
        {
          date: "2026-07-11",
          estimatedMinutes: 20,
          status: "planned",
        },
      ],
      logs: [
        { date: Date.parse("2026-07-07T12:00:00Z"), isPersonalBest: true },
        { date: Date.parse("2026-07-09T12:00:00Z"), isPersonalBest: false },
      ],
      skillRatings: [
        {
          skillTarget: { kind: "core", id: "picking" },
          skillTargetKey: "core:picking",
          label: "Picking",
          rating: 48,
          trend30Day: 2,
        },
        {
          skillTarget: { kind: "core", id: "synchronisation" },
          skillTargetKey: "core:synchronisation",
          label: "Synchronisation",
          rating: 62,
          trend30Day: 8,
        },
      ],
      achievementsUnlockedThisMonth: 2,
      longestStreakDays: 5,
    });

    expect(review.practiceDays).toBe(2);
    expect(review.totalMinutes).toBe(55);
    expect(review.sessionsCompleted).toBe(2);
    expect(review.exercisesCompleted).toBe(2);
    expect(review.personalBestCount).toBe(1);
    expect(review.achievementsUnlocked).toBe(2);
    expect(review.longestStreak).toBe(5);
    expect(review.mostImprovedSkillTarget).toEqual({
      kind: "core",
      id: "synchronisation",
    });
    expect(review.weakestSkillTarget).toEqual({ kind: "core", id: "picking" });
    expect(review.recommendedNextFocus).toContain("Picking");
  });

  it("excludes sessions from other months", () => {
    const review = buildMonthlyReview({
      year: 2026,
      month: 6,
      timezone: "UTC",
      sessionsPerWeek: 3,
      sessions: [
        {
          date: "2026-07-07",
          estimatedMinutes: 30,
          status: "completed",
        },
      ],
      logs: [],
      skillRatings: [],
      achievementsUnlockedThisMonth: 0,
      longestStreakDays: 0,
    });

    expect(review.sessionsCompleted).toBe(0);
    expect(review.totalMinutes).toBe(0);
    expect(review.practiceDays).toBe(0);
  });
});

describe("computeMonthlyReviewBounds", () => {
  it("returns earliest month with practice data and current month", () => {
    const bounds = computeMonthlyReviewBounds({
      timezone: "UTC",
      now: Date.parse("2026-07-15T12:00:00Z"),
      sessionDates: ["2026-05-10", "2026-07-01"],
      logDates: [Date.parse("2026-06-02T12:00:00Z")],
    });

    expect(bounds.currentYear).toBe(2026);
    expect(bounds.currentMonth).toBe(7);
    expect(bounds.earliestYear).toBe(2026);
    expect(bounds.earliestMonth).toBe(5);
  });
});

describe("compareYearMonth", () => {
  it("orders year-month pairs chronologically", () => {
    expect(compareYearMonth(2026, 5, 2026, 7)).toBeLessThan(0);
    expect(compareYearMonth(2026, 7, 2026, 7)).toBe(0);
  });
});
