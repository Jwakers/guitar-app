# Guitar Training App — Technical Specification

## 1. Product Definition

This application is a data-driven guitar training platform for intermediate electric guitarists.

It is not a song-learning app, theory app, tab library, video lesson platform, or social community.

The core product promise is:

> Train guitar fundamentals like an athlete trains their body: structured sessions, progressive overload, measurable performance, adaptive programming, and long-term progress tracking.

The app must answer one question every time the user opens it:

> What should I train today?

---

## 2. MVP Technical Goals

The MVP must support:

* User onboarding and skill assessment
* Goal and focus-area selection
* Daily training sessions generated from weekly plans
* Exercise-level tracking
* Self-scored performance logging
* BPM tracking where relevant
* Non-BPM primary metrics where appropriate
* Adaptive future sessions based on performance
* Skill ratings
* Training blocks
* Streaks, medals, and monthly reviews
* A simple subscription-ready account model
* Clean tab rendering
* Mobile-first practice flow

Post-MVP features such as audio analysis, advanced periodisation, community features, uploaded exercises, and video are explicitly out of scope.

---

## 3. Stack

### Frontend

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui or equivalent component primitives
* Client components for interactive training flows
* Server components for static or low-interaction pages

Next.js App Router is the default routing architecture. It supports layouts, nested routes, server components, and client components. Server Actions are available for server-side mutations, but Convex mutations should be the default write path for application data.

### Backend

* Convex
* Convex schema validation
* Convex queries, mutations, and actions
* Convex indexes for all user-scoped lookups

Convex should use a defined `schema.ts` for type safety and validation. Queries should use indexes rather than broad filtering wherever possible.

### Auth

Preferred MVP auth:

* Clerk + Convex

Alternative:

* Convex Auth

The app must not rely on anonymous long-term local-only state. Practice history is core product data and must be account-bound.

---

## 4. App Architecture

Recommended route structure:

```txt
/app
  /(marketing)
    page.tsx
    pricing/page.tsx

  /(auth)
    sign-in/page.tsx
    sign-up/page.tsx

  /(app)
    layout.tsx
    today/page.tsx
    train/[sessionId]/page.tsx
    progress/page.tsx
    progress/skills/[skillId]/page.tsx
    training/page.tsx
    exercises/page.tsx
    exercises/[exerciseId]/page.tsx
    review/monthly/page.tsx
    achievements/page.tsx
    profile/page.tsx
    settings/page.tsx

/components
  app-shell/
  training/
  exercises/
  progress/
  onboarding/
  tabs/
  charts/
  ui/

/convex
  schema.ts
  users.ts
  onboarding.ts
  skills.ts
  exercises.ts
  trainingBlocks.ts
  sessions.ts
  logs.ts
  progression.ts
  achievements.ts
  reviews.ts
  subscriptions.ts

/lib
  training-engine/
  scoring/
  progression/
  tabs/
  dates/
  constants/
```

---

## 5. Core Domain Model

### User

A user represents a guitarist using the system.

Key fields:

```ts
userId
authProviderId
email
displayName
createdAt
onboardingCompleted
subscriptionTier
timezone
```

---

### User Profile

Stores training preferences.

```ts
userId
experienceLevel // intermediate for MVP
guitarType // electric only for MVP
primaryGoals[]
focusSkills[]
availableDays[]
defaultSessionLengthMinutes
preferredIntensity
dataTonePreference
createdAt
updatedAt
```

---

### Skill

A skill is a trainable guitar capability.

Initial MVP skills:

```txt
alternate_picking
fretting_accuracy
synchronisation
rhythm
string_crossing
string_skipping
legato
bends
vibrato
muting
chord_changes
endurance
speed
```

Each skill has:

```ts
skillId
name
description
category
isMvp
sortOrder
```

---

### User Skill Rating

Stores a user’s current rating per skill.

```ts
userId
skillId
rating // 0-100
confidence // 0-1
lastAssessedAt
lastTrainedAt
trend7Day
trend30Day
status // weak | developing | stable | strong | maintenance
```

Important: ratings are not vanity scores. They drive programming.

---

### Exercise

An exercise is a structured training item.

```ts
exerciseId
title
slug
description
primarySkillId
secondarySkillIds[]
difficultyLevel // 1-10
exerciseType
primaryProgressMetric
supportsBpm
defaultTargetBpm
tab
instructions
commonMistakes[]
successCriteria[]
progressionRules
regressionRules
estimatedMinutes
isMvp
```

Example `primaryProgressMetric` values:

```txt
clean_bpm
accuracy_score
timing_consistency
control_score
clean_reps
endurance_duration
noise_control
comfort_score
```

BPM may be logged on many exercises, but it is not always the primary progress metric.

---

### Exercise Progression

Exercises should not be treated as static drills.

Each exercise belongs to a progression path.

Example:

```txt
Alternate Picking Level 1 — single string
Alternate Picking Level 2 — two strings
Alternate Picking Level 3 — string crossing
Alternate Picking Level 4 — position shifts
Alternate Picking Level 5 — accent displacement
Alternate Picking Level 6 — odd groupings
```

Fields:

```ts
progressionId
skillId
title
description
exerciseIds[]
```

---

### Training Block

A training block is a multi-week programme.

```ts
blockId
userId
title
blockType
startDate
endDate
durationWeeks
primaryGoal
focusSkillIds[]
supportSkillIds[]
status // active | completed | abandoned
currentWeek
intensity
deloadWeek
createdAt
```

Block types:

```txt
foundation
precision
speed
rhythm
lead_technique
maintenance
weakness_focus
```

---

### Weekly Plan

A weekly plan belongs to a block.

```ts
weeklyPlanId
blockId
userId
weekNumber
startDate
endDate
theme
targetSessionCount
plannedSessionIds[]
status
```

---

### Practice Session

A session is a single day’s training prescription.

```ts
sessionId
userId
blockId
weeklyPlanId
date
title
goal
estimatedMinutes
status // planned | active | completed | skipped
sessionType // standard | light | test | deload
exerciseItems[]
createdAt
completedAt
```

Exercise item:

```ts
exerciseId
slotType // warmup | primary | secondary | accessory | isolation | test
targetMetric
targetValue
targetBpm
sets
durationMinutes
instructionsOverride
```

---

### Exercise Log

A log is the user’s recorded performance after completing an exercise.

```ts
logId
userId
sessionId
exerciseId
skillId
date
primaryMetric
targetValue
actualValue
bpm
cleanlinessScore // 1-5
difficultyRating // easy | okay | hard | impossible
controlScore // optional 1-5
timingScore // optional 1-5
notes
isPersonalBest
createdAt
```

---

### Session Summary

Generated at the end of a session.

```ts
sessionId
userId
durationMinutes
completedExerciseCount
skillRatingChanges[]
personalBests[]
streakUpdated
xpAwarded
achievementsUnlocked[]
createdAt
```

---

### Achievement

Light gamification only.

```ts
achievementId
title
description
category
triggerType
threshold
medalTier // bronze | silver | gold
isMvp
```

Examples:

```txt
First Session
7 Day Streak
30 Day Streak
Perfect Week
100 Exercises Logged
First Skill Rating 80
Five Personal Bests
Foundation Block Complete
```

---

### Monthly Review

Generated monthly.

```ts
reviewId
userId
month
year
practiceDays
totalMinutes
sessionsCompleted
exercisesCompleted
mostImprovedSkillId
weakestSkillId
personalBestCount
achievementsUnlocked[]
consistencyPercent
recommendedNextFocus
createdAt
```

---

## 6. Convex Schema Principles

All tables must be user-scoped where appropriate.

Every frequent query path must have an index.

Examples:

```ts
users.by_authProviderId
userProfiles.by_userId
userSkillRatings.by_userId
userSkillRatings.by_userId_skillId
trainingBlocks.by_userId_status
weeklyPlans.by_userId_startDate
practiceSessions.by_userId_date
practiceSessions.by_userId_status
exerciseLogs.by_userId_date
exerciseLogs.by_userId_exerciseId
exerciseLogs.by_userId_skillId
achievements.by_triggerType
userAchievements.by_userId
monthlyReviews.by_userId_month
```

Avoid querying large sets and filtering in application code.

---

## 7. Training Engine

The training engine is the most important business logic in the app.

It must generate training based on:

* User goals
* Focus skills
* Current skill ratings
* Recent exercise performance
* Missed sessions
* Training block phase
* Recent workload
* Weaknesses
* Exercise mastery
* Session length
* Practice-day availability

The engine should live in:

```txt
/lib/training-engine
/convex/progression.ts
```

Convex mutations should persist the generated plans and sessions.

---

## 8. Session Generation Rules

A standard session should follow this shape:

```txt
Warm-up
Primary skill work
Secondary skill work
Accessory work
Isolation or control work
Performance test or loggable benchmark
```

Example:

```txt
Warm-up: Chromatic synchronisation
Primary: Alternate picking progression
Secondary: Rhythm subdivision
Accessory: String crossing
Isolation: Muting control
Test: Maximum clean BPM
```

Rules:

* Do not overload the same skill too heavily on consecutive days.
* Prioritise weak skills unless the user has chosen a hyper-focused goal.
* Respect session length.
* Include measurable targets.
* Include at least one loggable performance metric per session.
* Include occasional maintenance work for strong skills.
* Include deload/light sessions when consistency drops or workload is high.

---

## 9. Progressive Overload Model

Each exercise can progress through one or more overload levers:

```txt
BPM increase
Longer duration
More repetitions
More sets
Higher rhythmic complexity
More strings
More position shifts
More accents
Lower error tolerance
Reduced rest
More difficult variation
```

The engine should increase difficulty only when recent logs show readiness.

Suggested readiness rule:

```txt
Progress exercise if:
- user completes target at least 2 times
- cleanliness score >= 4
- difficulty is easy or okay
- actual performance >= target
```

Suggested regression rule:

```txt
Regress or hold if:
- difficulty is hard/impossible twice in a row
- cleanliness score <= 2
- actual performance is below target by more than 10%
```

---

## 10. Scoring Model

Each exercise has a primary metric.

The app should calculate:

```txt
Exercise Score
Skill Rating Impact
Session Score
Weekly Consistency
Training Block Progress
```

Exercise score should be based on:

* Actual vs target
* Cleanliness
* Difficulty rating
* Consistency over recent attempts
* Personal best improvement
* Exercise difficulty

Example formula:

```txt
exerciseScore =
  targetCompletionScore * 0.4 +
  cleanlinessScore * 0.25 +
  difficultyAdjustment * 0.15 +
  consistencyScore * 0.15 +
  personalBestBonus * 0.05
```

This formula is not final. It should be implemented as a clearly isolated scoring function so it can be tuned.

---

## 11. Skill Ratings

Skill ratings are 0-100.

They should update gradually.

A single good day should not massively inflate a skill.

A single bad day should not punish the user heavily.

Suggested principles:

* Use rolling averages
* Weight recent logs more heavily
* Weight harder exercises more heavily
* Consider confidence level
* Separate performance from consistency
* Treat missed days as programming input, not punishment

---

## 12. User Feedback Inputs

After each exercise, collect:

```txt
Cleanliness: 1-5
Difficulty: easy / okay / hard / impossible
Primary metric result
BPM if relevant
Optional notes
```

After each session, optionally collect:

```txt
Overall fatigue
Session usefulness
Focus preference adjustment
```

MVP should keep this lightweight. The user should be logging, not filling out forms.

---

## 13. Tab Rendering

Tab display is critical.

MVP requirements:

* Monospace alignment
* Mobile-readable
* Horizontal scroll when needed
* Bar separators
* String labels
* BPM/tempo metadata
* Picking direction notation support
* Accent notation support
* Repeat markers
* Exercise notes below tab
* Copy-safe internal tab format

Recommended internal format:

```ts
tab: {
  tuning: ["E", "A", "D", "G", "B", "E"],
  bpmSuggestion?: number,
  notation: string,
  notes?: string[],
}
```

Example:

```txt
e|-------------------------|
B|-------------------------|
G|-------------------------|
D|-------------------------|
A|---------5-7-5-----------|
E|-5-7-8---------8-7-5-----|
   D U D U D U D U D U
```

Post-MVP may move to a richer structured tab schema, but MVP should favour reliability and readability.

---

## 14. Frontend State Rules

The practice player should be resilient.

During an active session:

* Keep current exercise state locally
* Persist completion immediately after each exercise
* Do not wait until the end of the session to save everything
* Allow resuming an interrupted session
* Avoid accidental navigation loss

Recommended local state:

```txt
currentExerciseIndex
temporaryInputValues
metronomeState
timerState
```

Persisted state:

```txt
session status
exercise logs
completed exercise items
session summary
```

---

## 15. Main Screens

MVP screens:

```txt
Onboarding
Today
Practice Player
Exercise Log
Session Complete
Progress
Skill Detail
Training Block
Exercise Library
Exercise Detail
Monthly Review
Achievements
Profile
Settings
Subscription
```

The Today screen is the app’s home screen.

The Practice Player is the most important interaction surface.

---

## 16. Convex Function Boundaries

Suggested function groups:

### users.ts

```txt
getCurrentUser
createOrUpdateUser
getUserProfile
updateUserProfile
```

### onboarding.ts

```txt
saveOnboardingAnswers
completeInitialAssessment
generateInitialTrainingBlock
```

### exercises.ts

```txt
listExercises
getExercise
listExercisesBySkill
getExerciseProgression
```

### sessions.ts

```txt
getTodaySession
startSession
logExerciseResult
completeSession
skipSession
```

### trainingBlocks.ts

```txt
getCurrentBlock
getWeeklyPlan
generateNextWeek
completeBlock
```

### progression.ts

```txt
calculateExerciseScore
updateSkillRatings
recommendNextExercises
generateSessionPlan
```

### achievements.ts

```txt
checkAchievements
listUserAchievements
```

### reviews.ts

```txt
generateMonthlyReview
getMonthlyReview
```

---

## 17. Content Management

MVP exercises may be seeded from code.

Recommended seed structure:

```txt
/seed
  skills.ts
  exercises/
    alternate-picking.ts
    rhythm.ts
    bends.ts
    vibrato.ts
    muting.ts
```

Each exercise should include:

* Title
* Description
* Skill category
* Difficulty
* Tab
* Instructions
* Mistakes
* Success criteria
* Metrics
* Progression rules

An admin interface is not required for MVP.

---

## 18. Subscription Readiness

MVP should include subscription-aware structure but does not need complex billing on day one.

Possible tiers:

```txt
free
pro
```

Free may include:

* Limited active training block
* Limited monthly review history
* Limited exercise history

Pro may include:

* Full adaptive training
* Full progress history
* Monthly reviews
* Advanced analytics
* More training blocks

Do not let subscription design pollute the core practice experience.

---

## 19. Gamification

Gamification must be light, professional, and data-led.

Allowed:

* Streaks
* Medals
* Personal bests
* Monthly summaries
* Block completion
* Skill milestones
* Consistency awards

Avoid:

* Cartoon mascots
* Random loot
* Social pressure
* Excessive notifications
* Fake urgency
* Childish language

Gamification exists to reinforce real progress, not distract from practice.

---

## 20. Analytics and Reviews

The app should track:

```txt
Practice days
Total minutes
Sessions completed
Exercises completed
Skill rating changes
Personal bests
Consistency
Weakest skill
Most improved skill
Current block progress
```

Monthly review should be generated from actual logs, not manually entered data.

---

## 21. Error Handling

The app must handle:

* No session generated
* Missed session
* User changes available days
* User changes focus skills
* Exercise deleted or deprecated
* Partial session completion
* Failed log save
* Subscription status unavailable
* Empty progress history

The user should always have a clear next action.

---

## 22. MVP Non-Goals

Do not build in MVP:

* Audio detection
* Video lessons
* Song learning
* Theory curriculum
* Community features
* Public profiles
* User-uploaded tabs
* Marketplace
* AI-generated tabs without review
* Complex admin CMS
* Social sharing
* Native mobile app

---

## 23. Engineering Principles

* Training logic must be isolated from UI.
* Scoring logic must be testable.
* Exercise content must be structured.
* All user data must be account-bound.
* All Convex writes must validate inputs.
* All common queries must use indexes.
* UI should be mobile-first.
* Practice flow should save progressively.
* Avoid premature complexity.
* Build the MVP as a serious training tool, not a general guitar platform.

---

## 24. Suggested Build Phases

### Phase 1 — Foundation

* Auth
* Convex schema
* User profile
* Skill taxonomy
* Seed exercises
* Basic app shell

### Phase 2 — Onboarding

* Questionnaire
* Goal selection
* Practice schedule
* Initial skill assessment
* Initial skill ratings

### Phase 3 — Training Engine v1

* Generate training block
* Generate weekly plan
* Generate today session
* Basic progressive overload rules

### Phase 4 — Practice Flow

* Today screen
* Exercise player
* Tab display
* Exercise logging
* Session completion

### Phase 5 — Progress

* Skill ratings
* Exercise history
* Personal bests
* Progress dashboard
* Skill detail pages

### Phase 6 — Gamification

* Streaks
* Medals
* Achievements
* Monthly review

### Phase 7 — Subscription Readiness

* Tier model
* Subscription page
* Feature gates
* Billing integration later

---

## 25. Definition of MVP Success

The MVP is successful if an intermediate electric guitarist can:

1. Complete onboarding
2. Receive a sensible first training block
3. Open the app and know exactly what to practise today
4. Complete a focused session
5. Log meaningful performance data
6. See progress over time
7. Feel that future sessions are adapting based on their performance

The MVP fails if it becomes:

* an exercise dump
* a generic practice timer
* a tab library
* a gamified toy
* a static planner
* a music theory product

The app must remain a progressive guitar training system.
