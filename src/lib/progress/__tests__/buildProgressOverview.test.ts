import { describe, expect, it } from "vitest";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  buildProgressOverview,
  labelFromSkillTargetKey,
} from "../../../../convex/lib/buildProgressOverview";

const ex1 = "ex1" as Id<"exercises">;
const ex2 = "ex2" as Id<"exercises">;

const exerciseTitles = {
  [ex1]: "Spider Walk",
  [ex2]: "String Skip Ladder",
};

describe("labelFromSkillTargetKey", () => {
  it("resolves core and sub skill labels", () => {
    expect(labelFromSkillTargetKey("core:picking")).toBe("Picking");
    expect(labelFromSkillTargetKey("sub:string_crossing")).toBe(
      "String Crossing",
    );
  });
});

describe("buildProgressOverview", () => {
  it("aggregates skills, personal bests, reliable performance, and week rollup", () => {
    const weekStartDate = "2026-07-07";
    const todayDate = "2026-07-11";

    const overview = buildProgressOverview({
      weekStartDate,
      todayDate,
      timezone: "UTC",
      currentStreakDays: 4,
      longestStreakDays: 7,
      skillRatings: [
        {
          skillTargetKey: "core:synchronisation",
          rating: 42,
          status: "developing",
        },
        {
          skillTargetKey: "core:picking",
          rating: 55,
          status: "stable",
          trend7Day: 3,
        },
      ],
      logs: [
        {
          exerciseId: ex1,
          date: Date.parse("2026-07-10T12:00:00Z"),
          trainingVerdict: "nailed_it",
          objectiveResult: {
            metric: "clean_bpm",
            actualValue: 96,
            unit: "bpm",
          },
          isPersonalBest: true,
        },
        {
          exerciseId: ex2,
          date: Date.parse("2026-07-09T12:00:00Z"),
          trainingVerdict: "nearly_there",
          objectiveResult: {
            metric: "clean_bpm",
            actualValue: 88,
            unit: "bpm",
          },
          isPersonalBest: false,
        },
        {
          exerciseId: ex1,
          date: Date.parse("2026-07-01T12:00:00Z"),
          trainingVerdict: "nailed_it",
          objectiveResult: {
            metric: "clean_bpm",
            actualValue: 90,
            unit: "bpm",
          },
          isPersonalBest: true,
        },
      ],
      exerciseStates: [
        {
          exerciseId: ex1,
          reliablePerformance: {
            metric: "clean_bpm",
            value: 92,
            unit: "bpm",
          },
          peakPerformance: {
            metric: "clean_bpm",
            value: 96,
            unit: "bpm",
          },
          lastPractisedAt: Date.parse("2026-07-10T12:00:00Z"),
          updatedAt: Date.parse("2026-07-10T12:00:00Z"),
        },
        {
          exerciseId: ex2,
          updatedAt: Date.parse("2026-07-09T12:00:00Z"),
        },
      ],
      completedSessionsThisWeek: [
        { date: "2026-07-09", estimatedMinutes: 25 },
        { date: "2026-07-11", estimatedMinutes: 30 },
      ],
      exerciseTitles,
    });

    expect(overview.streak).toEqual({
      currentStreakDays: 4,
      longestStreakDays: 7,
    });

    expect(overview.sessionRollup).toEqual({
      sessionsCompleted: 2,
      totalMinutes: 55,
      personalBestsThisWeek: 1,
    });

    expect(overview.skills.map((skill) => skill.label)).toEqual([
      "Picking",
      "Synchronisation",
    ]);
    expect(overview.skills[0]?.trend7Day).toBe(3);

    expect(overview.personalBests).toHaveLength(2);
    expect(overview.personalBests[0]?.exerciseTitle).toBe("Spider Walk");
    expect(overview.personalBests[0]?.objectiveResult.actualValue).toBe(96);

    expect(overview.reliablePerformance).toHaveLength(1);
    expect(overview.reliablePerformance[0]?.reliablePerformance?.value).toBe(
      92,
    );
    expect(overview.reliablePerformance[0]?.peakPerformance?.value).toBe(96);

    expect(overview.recentActivity).toHaveLength(3);
    expect(overview.recentActivity[0]?.exerciseId).toBe(ex1);
    expect(overview.recentActivity[1]?.exerciseTitle).toBe(
      "String Skip Ladder",
    );
  });

  it("returns empty sections when there is no practice data", () => {
    const overview = buildProgressOverview({
      weekStartDate: "2026-07-07",
      todayDate: "2026-07-11",
      timezone: "UTC",
      currentStreakDays: 0,
      longestStreakDays: 0,
      skillRatings: [],
      logs: [],
      exerciseStates: [],
      completedSessionsThisWeek: [],
      exerciseTitles: {},
    });

    expect(overview.skills).toEqual([]);
    expect(overview.personalBests).toEqual([]);
    expect(overview.reliablePerformance).toEqual([]);
    expect(overview.recentActivity).toEqual([]);
    expect(overview.sessionRollup).toEqual({
      sessionsCompleted: 0,
      totalMinutes: 0,
      personalBestsThisWeek: 0,
    });
  });
});
