import { describe, expect, it } from "vitest";
import {
  evaluateNewlyUnlockedAchievements,
  isAchievementUnlocked,
  MVP_ACHIEVEMENTS,
} from "../achievements";

describe("isAchievementUnlocked", () => {
  const firstSession = MVP_ACHIEVEMENTS[0]!;

  it("unlocks when stats meet threshold", () => {
    expect(
      isAchievementUnlocked(firstSession, {
        sessionsCompleted: 1,
        currentStreakDays: 0,
        personalBestCount: 0,
        maxSkillRating: 0,
      }),
    ).toBe(true);
  });

  it("stays locked when stats are below threshold", () => {
    expect(
      isAchievementUnlocked(firstSession, {
        sessionsCompleted: 0,
        currentStreakDays: 0,
        personalBestCount: 0,
        maxSkillRating: 0,
      }),
    ).toBe(false);
  });
});

describe("evaluateNewlyUnlockedAchievements", () => {
  it("returns only achievements not already unlocked", () => {
    const achievements = MVP_ACHIEVEMENTS.map((achievement, index) => ({
      ...achievement,
      _id: `ach-${index}`,
    }));

    const unlocked = evaluateNewlyUnlockedAchievements(
      achievements,
      new Set(["ach-0"]),
      {
        sessionsCompleted: 1,
        currentStreakDays: 0,
        personalBestCount: 0,
        maxSkillRating: 0,
      },
    );

    expect(unlocked).toHaveLength(0);
  });
});
