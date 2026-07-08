import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Shared validator fragments
// ---------------------------------------------------------------------------

const trainingVerdict = v.union(
  v.literal("nailed_it"),
  v.literal("nearly_there"),
  v.literal("needs_work"),
);

const primaryProgressMetric = v.union(
  v.literal("clean_bpm"),
  v.literal("accuracy_score"),
  v.literal("timing_consistency"),
  v.literal("control_score"),
  v.literal("clean_reps"),
  v.literal("endurance_duration"),
  v.literal("noise_control"),
  v.literal("comfort_score"),
);

const sessionSlotType = v.union(
  v.literal("warmup"),
  v.literal("primary"),
  v.literal("secondary"),
  v.literal("accessory"),
  v.literal("isolation"),
  v.literal("test"),
  v.literal("maintenance"),
);

// ---------------------------------------------------------------------------
// TabData validators — mirrors /lib/tabs/internal-schema.ts
// ---------------------------------------------------------------------------

const tabNote = v.object({
  string: v.union(
    v.literal(1),
    v.literal(2),
    v.literal(3),
    v.literal(4),
    v.literal(5),
    v.literal(6),
  ),
  fret: v.number(),
  finger: v.optional(
    v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)),
  ),
  technique: v.optional(
    v.union(
      v.literal("picked"),
      v.literal("hammer_on"),
      v.literal("pull_off"),
      v.literal("slide"),
      v.literal("bend"),
      v.literal("release"),
      v.literal("vibrato"),
      v.literal("mute"),
      v.literal("harmonic"),
    ),
  ),
  targetPitch: v.optional(v.string()),
});

const tabBeat = v.object({
  duration: v.union(
    v.literal("whole"),
    v.literal("half"),
    v.literal("quarter"),
    v.literal("eighth"),
    v.literal("sixteenth"),
  ),
  notes: v.array(tabNote),
  tuplet: v.optional(v.number()),
  picking: v.optional(
    v.union(
      v.literal("down"),
      v.literal("up"),
      v.literal("alternate"),
      v.literal("economy"),
      v.literal("sweep"),
    ),
  ),
  accent: v.optional(v.boolean()),
  rest: v.optional(v.boolean()),
});

const tabBar = v.object({
  beats: v.array(tabBeat),
});

const tabData = v.object({
  tuning: v.array(v.string()),
  capo: v.optional(v.number()),
  tempo: v.number(),
  timeSignature: v.object({
    beats: v.number(),
    beatValue: v.number(),
  }),
  bars: v.array(tabBar),
  displayHints: v.optional(
    v.object({
      showPicking: v.optional(v.boolean()),
      showAccents: v.optional(v.boolean()),
      showFingering: v.optional(v.boolean()),
      loopStartBar: v.optional(v.number()),
      loopEndBar: v.optional(v.number()),
    }),
  ),
});

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export default defineSchema({
  // -------------------------------------------------------------------------
  // Auth & user identity
  // -------------------------------------------------------------------------

  users: defineTable({
    authProviderId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    subscriptionTier: v.union(v.literal("free"), v.literal("pro")),
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

  // -------------------------------------------------------------------------
  // Domain seed data (global, read-only at runtime)
  // -------------------------------------------------------------------------

  skills: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    isMvp: v.boolean(),
    sortOrder: v.number(),
  }),

  exercises: defineTable({
    // Identity
    title: v.string(),
    slug: v.string(),
    description: v.string(),

    // Quality contract (all required per spec)
    purpose: v.string(),
    targetWeaknesses: v.array(v.string()),
    minimumCleanStandard: v.string(),
    measurementInstructions: v.string(),
    coachingNotes: v.array(v.string()),

    // Skill linkage
    primarySkillId: v.id("skills"),
    secondarySkillIds: v.array(v.id("skills")),

    // Difficulty & type
    difficultyLevel: v.number(), // 1–10
    exerciseType: v.union(
      v.literal("warmup"),
      v.literal("primary"),
      v.literal("secondary"),
      v.literal("accessory"),
      v.literal("isolation"),
      v.literal("test"),
    ),

    // Progress measurement
    primaryProgressMetric,
    supportsBpm: v.boolean(),
    defaultTargetBpm: v.optional(v.number()),

    // Outcome guidance
    successCriteria: v.array(v.string()),
    commonMistakes: v.array(v.string()),
    progressionRule: v.string(),
    regressionRule: v.string(),

    // Tab
    tabData,

    // Metadata
    estimatedMinutes: v.number(),
    isMvp: v.boolean(),

    // Feedback schema — defines the dynamic questions shown after this exercise
    feedbackSchema: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("segmented"),
          v.literal("rating"),
          v.literal("number"),
          v.literal("boolean"),
          v.literal("choice"),
        ),
        required: v.boolean(),
        options: v.optional(
          v.array(v.object({ id: v.string(), label: v.string() })),
        ),
        followUpRules: v.optional(
          v.array(
            v.object({ ifOptionId: v.string(), showQuestionId: v.string() }),
          ),
        ),
      }),
    ),

    // Seed data versioning
    version: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("deprecated"),
      v.literal("replaced"),
    ),
    replacedBySlug: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  exerciseProgressions: defineTable({
    skillId: v.id("skills"),
    title: v.string(),
    description: v.string(),
    exerciseIds: v.array(v.id("exercises")),
  }),

  // -------------------------------------------------------------------------
  // Training blocks & plans
  // -------------------------------------------------------------------------

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
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned"),
    ),
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

  // -------------------------------------------------------------------------
  // Practice sessions
  // -------------------------------------------------------------------------

  practiceSessions: defineTable({
    userId: v.id("users"),
    blockId: v.optional(v.id("trainingBlocks")),
    weeklyPlanId: v.optional(v.id("weeklyPlans")),
    date: v.string(), // YYYY-MM-DD — used for "today's session" lookups
    title: v.string(),
    goal: v.string(),
    estimatedMinutes: v.number(),
    status: v.union(
      v.literal("planned"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("skipped"),
    ),
    sessionType: v.union(
      v.literal("standard"),
      v.literal("light"),
      v.literal("test"),
      v.literal("deload"),
      v.literal("maintenance"),
    ),
    exerciseItems: v.array(
      v.object({
        exerciseId: v.id("exercises"),
        slotType: sessionSlotType,
        order: v.number(),
        targetMetric: v.string(),
        targetValue: v.optional(v.number()),
        targetBpm: v.optional(v.number()),
        sets: v.optional(v.number()),
        durationMinutes: v.number(),
        status: v.union(
          v.literal("pending"),
          v.literal("active"),
          v.literal("completed"),
          v.literal("skipped"),
        ),
        startedAt: v.optional(v.number()),
        completedAt: v.optional(v.number()),
        reasonCodes: v.array(v.string()),
        scoreBreakdown: v.optional(
          v.object({
            goalMatch: v.number(),
            weaknessMatch: v.number(),
            blockRelevance: v.number(),
            readiness: v.number(),
            progressionNeed: v.number(),
            maintenanceNeed: v.number(),
            variety: v.number(),
            penalties: v.number(),
            total: v.number(),
          }),
        ),
        instructionsOverride: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId_date", ["userId", "date"])
    .index("by_userId_status", ["userId", "status"]),

  // -------------------------------------------------------------------------
  // Exercise logging
  // -------------------------------------------------------------------------

  exerciseLogs: defineTable({
    userId: v.id("users"),
    sessionId: v.id("practiceSessions"),
    exerciseId: v.id("exercises"),
    skillId: v.id("skills"),
    date: v.number(), // Unix timestamp (ms)

    trainingVerdict,
    objectiveResult: v.object({
      metric: primaryProgressMetric,
      targetValue: v.optional(v.number()),
      actualValue: v.optional(v.number()),
      unit: v.optional(
        v.union(
          v.literal("bpm"),
          v.literal("reps"),
          v.literal("seconds"),
          v.literal("score"),
        ),
      ),
    }),
    feedbackResponses: v.array(
      v.object({
        questionId: v.string(),
        value: v.union(v.string(), v.number(), v.boolean()),
        category: v.union(v.literal("objective"), v.literal("subjective")),
      }),
    ),

    notes: v.optional(v.string()),
    isPersonalBest: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_userId_date", ["userId", "date"])
    .index("by_userId_exerciseId", ["userId", "exerciseId"])
    .index("by_userId_skillId", ["userId", "skillId"]),

  // -------------------------------------------------------------------------
  // Derived engine state
  // -------------------------------------------------------------------------

  userExerciseState: defineTable({
    userId: v.id("users"),
    exerciseId: v.id("exercises"),
    skillId: v.id("skills"),

    currentLevel: v.number(),
    masteryStatus: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("developing"),
      v.literal("consistent"),
      v.literal("strong"),
      v.literal("mastered"),
      v.literal("maintenance"),
    ),

    reliablePerformance: v.optional(
      v.object({
        metric: v.string(),
        value: v.number(),
        unit: v.string(),
        calculatedAt: v.number(),
      }),
    ),

    peakPerformance: v.optional(
      v.object({
        metric: v.string(),
        value: v.number(),
        unit: v.string(),
        achievedAt: v.number(),
      }),
    ),

    lastPractisedAt: v.optional(v.number()),
    recentVerdicts: v.array(trainingVerdict),

    consecutiveNailed: v.number(),
    consecutiveNeedsWork: v.number(),

    progressionReady: v.boolean(),
    regressionRecommended: v.boolean(),

    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_exerciseId", ["userId", "exerciseId"])
    .index("by_userId_skillId", ["userId", "skillId"]),

  // -------------------------------------------------------------------------
  // Skill ratings (onboarding assessment + ongoing updates)
  // -------------------------------------------------------------------------

  userSkillRatings: defineTable({
    userId: v.id("users"),
    skillId: v.id("skills"),
    rating: v.number(), // 0–100
    confidence: v.number(), // 0–1
    lastAssessedAt: v.optional(v.number()),
    lastTrainedAt: v.optional(v.number()),
    trend7Day: v.optional(v.number()),
    trend30Day: v.optional(v.number()),
    status: v.union(
      v.literal("weak"),
      v.literal("developing"),
      v.literal("stable"),
      v.literal("strong"),
      v.literal("maintenance"),
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_skillId", ["userId", "skillId"]),

  // -------------------------------------------------------------------------
  // Session summaries & achievements
  // -------------------------------------------------------------------------

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
      }),
    ),
    personalBests: v.array(v.id("exerciseLogs")),
    streakUpdated: v.boolean(),
    xpAwarded: v.number(),
    achievementsUnlocked: v.array(v.id("achievements")),
    createdAt: v.number(),
  }),

  achievements: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    triggerType: v.string(),
    threshold: v.number(),
    medalTier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold")),
    isMvp: v.boolean(),
  }).index("by_triggerType", ["triggerType"]),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // -------------------------------------------------------------------------
  // Monthly reviews
  // -------------------------------------------------------------------------

  monthlyReviews: defineTable({
    userId: v.id("users"),
    month: v.number(), // 1–12
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
  }).index("by_userId_year_month", ["userId", "year", "month"]),
});
