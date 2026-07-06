import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authProviderId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    subscriptionTier: v.string(), // e.g. "free", "pro"
    timezone: v.string(),
  }).index("by_authProviderId", ["authProviderId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    experienceLevel: v.string(),
    guitarType: v.string(),
    primaryGoals: v.array(v.string()),
    focusSkills: v.array(v.string()),
    availableDays: v.array(v.string()),
    defaultSessionLengthMinutes: v.number(),
    preferredIntensity: v.string(),
    dataTonePreference: v.string(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  skills: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    isMvp: v.boolean(),
    sortOrder: v.number(),
  }),

  userSkillRatings: defineTable({
    userId: v.id("users"),
    skillId: v.id("skills"),
    rating: v.number(), // 0-100
    confidence: v.number(), // 0-1
    lastAssessedAt: v.optional(v.number()),
    lastTrainedAt: v.optional(v.number()),
    trend7Day: v.optional(v.number()),
    trend30Day: v.optional(v.number()),
    status: v.string(), // weak | developing | stable | strong | maintenance
  })
    .index("by_userId", ["userId"])
    .index("by_userId_skillId", ["userId", "skillId"]),

  exercises: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    primarySkillId: v.id("skills"),
    secondarySkillIds: v.array(v.id("skills")),
    difficultyLevel: v.number(), // 1-10
    exerciseType: v.string(),
    primaryProgressMetric: v.string(),
    supportsBpm: v.boolean(),
    defaultTargetBpm: v.optional(v.number()),
    tab: v.object({
      tuning: v.array(v.string()),
      bpmSuggestion: v.optional(v.number()),
      notation: v.string(),
      notes: v.optional(v.array(v.string())),
    }),
    instructions: v.string(),
    commonMistakes: v.array(v.string()),
    successCriteria: v.array(v.string()),
    progressionRules: v.string(),
    regressionRules: v.string(),
    estimatedMinutes: v.number(),
    isMvp: v.boolean(),
  }),

  exerciseProgressions: defineTable({
    skillId: v.id("skills"),
    title: v.string(),
    description: v.string(),
    exerciseIds: v.array(v.id("exercises")),
  }),

  trainingBlocks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    blockType: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    durationWeeks: v.number(),
    primaryGoal: v.string(),
    focusSkillIds: v.array(v.id("skills")),
    supportSkillIds: v.array(v.id("skills")),
    status: v.string(), // active | completed | abandoned
    currentWeek: v.number(),
    intensity: v.string(),
    deloadWeek: v.optional(v.number()),
  }).index("by_userId_status", ["userId", "status"]),

  weeklyPlans: defineTable({
    blockId: v.id("trainingBlocks"),
    userId: v.id("users"),
    weekNumber: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    theme: v.string(),
    targetSessionCount: v.number(),
    plannedSessionIds: v.array(v.id("practiceSessions")),
    status: v.string(),
  }).index("by_userId_startDate", ["userId", "startDate"]),

  practiceSessions: defineTable({
    userId: v.id("users"),
    blockId: v.optional(v.id("trainingBlocks")),
    weeklyPlanId: v.optional(v.id("weeklyPlans")),
    date: v.string(), // YYYY-MM-DD
    title: v.string(),
    goal: v.string(),
    estimatedMinutes: v.number(),
    status: v.string(), // planned | active | completed | skipped
    sessionType: v.string(), // standard | light | test | deload
    exerciseItems: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        slotType: v.string(), // warmup | primary | secondary | accessory | isolation | test
        targetMetric: v.string(),
        targetValue: v.number(),
        targetBpm: v.optional(v.number()),
        sets: v.number(),
        durationMinutes: v.number(),
        instructionsOverride: v.optional(v.string()),
      })
    ),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId_date", ["userId", "date"])
    .index("by_userId_status", ["userId", "status"]),

  exerciseLogs: defineTable({
    userId: v.id("users"),
    sessionId: v.id("practiceSessions"),
    exerciseId: v.id("exercises"),
    skillId: v.id("skills"),
    date: v.string(), // YYYY-MM-DD
    primaryMetric: v.string(),
    targetValue: v.number(),
    actualValue: v.number(),
    bpm: v.optional(v.number()),
    cleanlinessScore: v.number(), // 1-5
    difficultyRating: v.string(), // easy | okay | hard | impossible
    controlScore: v.optional(v.number()), // 1-5
    timingScore: v.optional(v.number()), // 1-5
    notes: v.optional(v.string()),
    isPersonalBest: v.boolean(),
  })
    .index("by_userId_date", ["userId", "date"])
    .index("by_userId_exerciseId", ["userId", "exerciseId"])
    .index("by_userId_skillId", ["userId", "skillId"]),

  sessionSummaries: defineTable({
    sessionId: v.id("practiceSessions"),
    userId: v.id("users"),
    durationMinutes: v.number(),
    completedExerciseCount: v.number(),
    skillRatingChanges: v.array(
      v.object({
        skillId: v.id("skills"),
        oldRating: v.number(),
        newRating: v.number(),
      })
    ),
    personalBests: v.array(v.id("exerciseLogs")),
    streakUpdated: v.boolean(),
    xpAwarded: v.number(),
    achievementsUnlocked: v.array(v.id("achievements")),
  }),

  achievements: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    triggerType: v.string(),
    threshold: v.number(),
    medalTier: v.string(), // bronze | silver | gold
    isMvp: v.boolean(),
  }).index("by_triggerType", ["triggerType"]),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
  }).index("by_userId", ["userId"]),

  monthlyReviews: defineTable({
    userId: v.id("users"),
    month: v.number(),
    year: v.number(),
    practiceDays: v.number(),
    totalMinutes: v.number(),
    sessionsCompleted: v.number(),
    exercisesCompleted: v.number(),
    mostImprovedSkillId: v.optional(v.id("skills")),
    weakestSkillId: v.optional(v.id("skills")),
    personalBestCount: v.number(),
    achievementsUnlocked: v.array(v.id("achievements")),
    consistencyPercent: v.number(),
    recommendedNextFocus: v.string(),
  }).index("by_userId_month", ["userId", "month"]),
});
