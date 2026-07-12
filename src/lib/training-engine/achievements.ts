export type AchievementTriggerType =
  | "sessions_completed"
  | "streak_days"
  | "personal_bests"
  | "skill_milestone";

export type AchievementSeed = {
  title: string;
  description: string;
  category: string;
  triggerType: AchievementTriggerType;
  threshold: number;
  medalTier: "bronze" | "silver" | "gold";
};

export const MVP_ACHIEVEMENTS: AchievementSeed[] = [
  {
    title: "First Session",
    description: "Complete your first practice session.",
    category: "consistency",
    triggerType: "sessions_completed",
    threshold: 1,
    medalTier: "bronze",
  },
  {
    title: "Regular Practice",
    description: "Complete 10 practice sessions.",
    category: "consistency",
    triggerType: "sessions_completed",
    threshold: 10,
    medalTier: "silver",
  },
  {
    title: "Dedicated Player",
    description: "Complete 25 practice sessions.",
    category: "consistency",
    triggerType: "sessions_completed",
    threshold: 25,
    medalTier: "gold",
  },
  {
    title: "Week Streak",
    description: "Practise on 7 consecutive days.",
    category: "consistency",
    triggerType: "streak_days",
    threshold: 7,
    medalTier: "bronze",
  },
  {
    title: "Month Streak",
    description: "Practise on 30 consecutive days.",
    category: "consistency",
    triggerType: "streak_days",
    threshold: 30,
    medalTier: "gold",
  },
  {
    title: "First Personal Best",
    description: "Set your first personal best.",
    category: "performance",
    triggerType: "personal_bests",
    threshold: 1,
    medalTier: "bronze",
  },
  {
    title: "Skill Breakthrough",
    description: "Reach a skill rating of 70 or higher.",
    category: "skills",
    triggerType: "skill_milestone",
    threshold: 70,
    medalTier: "silver",
  },
];

export type UserAchievementStats = {
  sessionsCompleted: number;
  currentStreakDays: number;
  personalBestCount: number;
  maxSkillRating: number;
};

export type AchievementDefinition = AchievementSeed & {
  _id: string;
};

export function isAchievementUnlocked(
  achievement: AchievementSeed,
  stats: UserAchievementStats,
): boolean {
  switch (achievement.triggerType) {
    case "sessions_completed":
      return stats.sessionsCompleted >= achievement.threshold;
    case "streak_days":
      return stats.currentStreakDays >= achievement.threshold;
    case "personal_bests":
      return stats.personalBestCount >= achievement.threshold;
    case "skill_milestone":
      return stats.maxSkillRating >= achievement.threshold;
    default:
      return false;
  }
}

export function evaluateNewlyUnlockedAchievements(
  achievements: AchievementDefinition[],
  alreadyUnlockedIds: Set<string>,
  stats: UserAchievementStats,
): AchievementDefinition[] {
  return achievements.filter(
    (achievement) =>
      !alreadyUnlockedIds.has(achievement._id) &&
      isAchievementUnlocked(achievement, stats),
  );
}
