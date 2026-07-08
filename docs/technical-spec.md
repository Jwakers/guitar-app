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

*Section 5 describes the conceptual domain model. Where a later section defines a more specific runtime type, the later runtime type is authoritative for implementation.*

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

Stores a user's current rating per skill.

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

An exercise is a structured training item. See `## Tab Rendering & Exercise Quality Architecture` for the full `Exercise` type definition, validation rules, and quality contract.

```ts
exerciseId
title
slug
description
purpose
primarySkillId
secondarySkillIds[]
targetWeaknesses[]
difficultyLevel // 1-10
exerciseType // warmup | primary | secondary | accessory | isolation | test
primaryProgressMetric
supportsBpm
defaultTargetBpm
minimumCleanStandard
measurementInstructions
tabData // structured TabData — see Tab Rendering & Exercise Quality Architecture
successCriteria[]
commonMistakes[]
coachingNotes[]
progressionRule
regressionRule
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

A session is a single day's training prescription.

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
type PracticeSessionItem = {
  exerciseId: Id<"exercises">;
  slotType: SessionSlotType;
  order: number;

  targetMetric: PrimaryProgressMetric;
  targetValue?: number;
  targetBpm?: number;

  sets?: number;
  durationMinutes: number;

  status: "pending" | "active" | "completed" | "skipped";
  startedAt?: number;
  completedAt?: number;

  reasonCodes: ExerciseSelectionReasonCode[];
  scoreBreakdown?: ExerciseSelectionScoreBreakdown;

  instructionsOverride?: string;
};
```

The `reasonCodes` and `scoreBreakdown` fields enable session resume, partial completion tracking, debugging, and deterministic AI explanations. See `# Exercise Selection Engine` for the full type definitions.

---

### Exercise Log

The canonical `ExerciseLog` type is defined in `# Canonical Runtime Data Model`. That section is authoritative.

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

Superseded by `# Exercise Selection Engine`, which is authoritative for all engine logic.

---

## 8. Session Generation Rules

Superseded by `# Exercise Selection Engine`, which defines typed `SessionSlot` templates, session purpose, and generation rules.

---

## 9. Progressive Overload Model

Superseded by `# Exercise Selection Engine`. Progression and regression are governed by Training Verdicts as defined in `# Progress Tracking, Feedback & Adaptive Data Collection`.

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

MVP skill ratings may begin as simple derived scores from recent exercise logs. The exact methodology — rolling averages, confidence weighting, recency decay — will be formally defined in `knowledge/whitepapers/rating-and-progression.md`. Do not over-engineer the initial implementation; a working placeholder is sufficient to validate the core loop.

---

## 12. User Feedback Inputs

Superseded by `# Progress Tracking, Feedback & Adaptive Data Collection`, which defines the schema-driven `FeedbackQuestion` model.

---

## 13. Tab Rendering

Superseded by `## Tab Rendering & Exercise Quality Architecture`, which defines the alphaTab adapter pattern, `TabData` schema, and all rendering constraints.

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

The Today screen is the app's home screen.

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

Each exercise must satisfy the full `Exercise` type and pass the quality contract checklist defined in `## Tab Rendering & Exercise Quality Architecture`. See that section for the complete list of required fields and validation rules.

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
* Tab display (alphaTab)
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

---

## Tab Rendering & Exercise Quality Architecture

This section is the authoritative source of truth for how tab data is stored, rendered, and validated, and for the quality standards every exercise must meet before being added to the app.

---

### 1. Structured Exercise Data is the Source of Truth

The app owns its exercise data. The rendering layer does not.

* Do not store raw ASCII tab as the canonical exercise format.
* Do not author exercises directly as renderer-specific data.
* Store all exercises as structured, validated domain objects conforming to the `TabData` and `Exercise` types defined in this section.
* alphaTab is an output adapter only. It receives a transformed representation of the internal schema. It does not define the schema.

Any change to the rendering library must not require changes to exercise data.

---

### 2. alphaTab Responsibilities

alphaTab is the MVP tab rendering layer. Its responsibilities are:

* Render tablature clearly and correctly from structured input.
* Support responsive tab display on mobile and desktop.
* Support playback and metronome-related affordances where useful.
* Support future richer notation features (bends, slides, vibrato notation, etc.).
* Remain replaceable. No other part of the application should depend on alphaTab-specific data formats or APIs directly — all alphaTab interaction must go through the adapter layer in `/lib/tabs`.

---

### 3. Internal Tab Schema

The following types define the canonical internal representation for tab data. These types live in `/lib/tabs/internal-schema.ts` and are imported by exercise seed files, validation functions, and the alphaTab adapter.

```ts
type TabData = {
  tuning: string[];
  capo?: number;
  tempo: number;
  timeSignature: {
    beats: number;
    beatValue: number;
  };
  bars: TabBar[];
  displayHints?: {
    showPicking?: boolean;
    showAccents?: boolean;
    showFingering?: boolean;
    loopStartBar?: number;
    loopEndBar?: number;
  };
};

type TabBar = {
  beats: TabBeat[];
};

type TabBeat = {
  duration: "whole" | "half" | "quarter" | "eighth" | "sixteenth" | "triplet";
  notes: TabNote[];
  picking?: "down" | "up" | "alternate" | "economy" | "sweep";
  accent?: boolean;
  rest?: boolean;
};

type TabNote = {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  finger?: 1 | 2 | 3 | 4;
  technique?: "picked" | "hammer_on" | "pull_off" | "slide" | "bend" | "release" | "vibrato" | "mute" | "harmonic";
  targetPitch?: string;
};
```

String numbering follows standard guitar convention: `1` is the highest-pitched string (high E), `6` is the lowest (low E).

---

### 4. Renderer Adapter

The file `/lib/tabs/alphatab-adapter.ts` is the only place in the codebase that is permitted to produce alphaTab-compatible output.

* It accepts `TabData` as input.
* It returns alphaTab-compatible input (e.g. AlphaTab's `Score` object or equivalent input format).
* No component, page, or Convex function may import alphaTab APIs directly except through this adapter.
* The adapter is the seam that makes alphaTab replaceable.

Supporting files:

```txt
/lib/tabs/internal-schema.ts   — TabData, TabBar, TabBeat, TabNote type definitions
/lib/tabs/validate-tab-data.ts — runtime validation of TabData objects
/lib/tabs/alphatab-adapter.ts  — converts TabData → alphaTab input
/lib/tabs/render-config.ts     — rendering configuration (display options, theming)
```

---

### 5. Exercise Quality Contract

Every exercise added to the app must define the following fields. An exercise that cannot answer all of these questions is not ready to be added.

```txt
Purpose               — What is the training goal of this exercise?
Primary skill         — Which single skill does this primarily develop?
Secondary skills      — Which supporting skills does it touch?
Target weakness       — What specific weakness or gap does it address?
Success criteria      — What does successful execution look like?
Common mistakes       — What errors do players typically make on this exercise?
Progression rule      — Under what conditions should this exercise advance?
Regression rule       — Under what conditions should this exercise regress?
Primary progress      — What is the primary measurable output (e.g. clean_bpm)?
  metric
Measurement           — How exactly should the user measure their performance?
  instructions
Minimum clean         — What is the lowest acceptable standard for logging a
  standard              clean performance?
Coaching notes        — What technique or mindset advice should accompany this
                        exercise?
Valid tab data        — A complete, validated TabData object.
```

---

### 6. Exercise Schema

The full `Exercise` type definition. This is the authoritative contract for exercise seed files and the Convex `exercises` table.

```ts
type Exercise = {
  title: string;
  slug: string;
  description: string;
  purpose: string;
  primarySkillId: SkillId;
  secondarySkillIds: SkillId[];
  targetWeaknesses: string[];
  difficultyLevel: number; // 1-10
  exerciseType: "warmup" | "primary" | "secondary" | "accessory" | "isolation" | "test";
  primaryProgressMetric:
    | "clean_bpm"
    | "accuracy_score"
    | "timing_consistency"
    | "control_score"
    | "clean_reps"
    | "endurance_duration"
    | "noise_control"
    | "comfort_score";
  supportsBpm: boolean;
  defaultTargetBpm?: number;
  minimumCleanStandard: string;
  measurementInstructions: string;
  successCriteria: string[];
  commonMistakes: string[];
  coachingNotes: string[];
  progressionRule: string;
  regressionRule: string;
  tabData: TabData;
  estimatedMinutes: number;
  isMvp: boolean;
};
```

The `tabData` field replaces the previous `tab.notation: string` field. The Convex `exercises` table must be migrated accordingly before exercise seed data is written. See the schema migration note at the end of this section.

---

### 7. Exercise Validation Rules

The following rules must be enforced at seed time and at any future write path that creates or updates an exercise. Implement these in `/lib/exercises/validate-exercise.ts`.

* Exercises cannot be saved without a `purpose`.
* Exercises cannot be saved without a `primarySkillId`.
* Exercises cannot be saved without at least one entry in `successCriteria`.
* Exercises cannot be saved without at least one entry in `commonMistakes`.
* Exercises cannot be saved without a `progressionRule`.
* Exercises cannot be saved without a `regressionRule`.
* Exercises cannot be saved without a `primaryProgressMetric`.
* Exercises cannot be saved without a valid, fully structured `tabData` object.
* `tabData` must be validated against the `TabData` schema (tuning length, fret range, string range, beat duration values).
* Exercises where `supportsBpm` is `true` must include a `defaultTargetBpm`.
* Exercises where `supportsBpm` is `false` must include `measurementInstructions` describing exactly how performance is quantified.

---

### 8. Content Philosophy

The app must prefer a small number of excellent, deeply structured exercises over a large library of shallow drills.

The MVP should target roughly 40–80 high-quality exercises, each connected to a progression path and a measurable training outcome.

An exercise that passes validation but has a vague purpose, no coaching notes, or tab data that does not match the training intent is not an acceptable MVP exercise.

Quality over quantity is a hard constraint, not a preference.

---

### 9. Exercise Review Checklist

Every new exercise must be reviewed against this checklist before it is committed to the seed data.

* What skill does this train?
* What weakness does it target?
* What does good execution look, sound, and feel like?
* What should the user measure?
* How does the exercise progress?
* When should it regress?
* What common mistakes does it expose?
* Why would the training engine prescribe this exercise today?
* Is the tab data musically and mechanically sensible?
* Is the exercise suitable for intermediate electric guitarists?

An exercise that cannot answer all ten questions should not be added.

---

### 10. Non-Goals

The following are explicitly out of scope for this architecture:

* Do not store raw ASCII tab as canonical exercise data.
* Do not allow unreviewed or auto-generated exercises into the MVP seed.
* Do not treat tab display and exercise quality as the same concern.
* Do not optimise for a large exercise library at the expense of training value.

---

### 11. Implementation Structure

The following folders and files define the implementation boundary for tab and exercise logic. None of this logic should be placed inside `/convex`, `/components`, or `/app` directly.

```txt
/lib/tabs
  internal-schema.ts      — TabData, TabBar, TabBeat, TabNote type definitions
  validate-tab-data.ts    — Runtime validation of TabData objects
  alphatab-adapter.ts     — Converts TabData → alphaTab-compatible input
  render-config.ts        — Rendering configuration and display options

/lib/exercises
  exercise-schema.ts      — Exercise type definition and SkillId union
  validate-exercise.ts    — Enforces exercise quality contract rules
  quality-contract.ts     — ExerciseQualityContract type and checklist helpers
  progression-paths.ts    — Progression path definitions linking exercise sequences

/seed/exercises
  alternate-picking.ts
  rhythm.ts
  bends.ts
  vibrato.ts
  muting.ts
```

Each file in `/seed/exercises` exports an array of `Exercise` objects that are validated against the full quality contract before being inserted into Convex.

---

### 12. Testing Requirements

The following tests must be written and must pass before any exercise seed data is merged.

* Unit tests for `validate-tab-data.ts`: valid and invalid `TabData` objects, including edge cases for string/fret ranges, beat durations, and tuning length.
* Unit tests for `validate-exercise.ts`: every validation rule must have a test for a passing case and a failing case.
* Snapshot or output tests for `alphatab-adapter.ts`: given a known `TabData` input, the adapter must produce stable, expected alphaTab-compatible output.
* Integration tests asserting that invalid exercises cannot be seeded — the seed process must throw on validation failure.
* Unit tests for progression and regression rule parsing and application in `progression-paths.ts`.

---

### 13. alphaTab Implementation Constraints

alphaTab is isolated to the client-side rendering layer. The following constraints apply to its integration.

* alphaTab must be lazy-loaded to avoid increasing the initial app bundle size. It must not be imported at the top level of any page or layout.
* alphaTab must not be server-side rendered unless its SSR safety is explicitly proven and tested.
* The renderer must only receive pre-validated `TabData`. It must not perform domain validation itself. Validation happens in `/lib/tabs/validate-tab-data.ts` before the adapter is called.
* A rendering failure must not crash the active practice session. The practice UI must catch renderer errors and fall back gracefully.
* A fallback component must always be available as an alternative to tab display.

Component structure:

```txt
/components/tabs
  AlphaTabRenderer.tsx    — wraps alphaTab, lazy-loaded
  TabRenderFallback.tsx   — shown if tab data is missing or renderer not yet loaded
  TabRenderError.tsx      — shown if renderer throws
```

---

### Schema Migration Note

The current `convex/schema.ts` `exercises` table stores tab data as:

```ts
tab: v.object({
  tuning: v.array(v.string()),
  bpmSuggestion: v.optional(v.number()),
  notation: v.string(), // ASCII tab string — no longer canonical
  notes: v.optional(v.array(v.string())),
})
```

This field must be replaced with a `tabData` field matching the structured `TabData` schema before exercise seed data is written. This is a breaking schema change and requires a Convex migration. The migration should be planned and executed as part of the exercise seed implementation task, not deferred.

---

# Progress Tracking, Feedback & Adaptive Data Collection

This section defines how user feedback should be collected, how progression data should be measured, and how the training engine should interpret it. This is implementation guidance and is the technical source of truth for all feedback, logging, and adaptive data concerns.

---

## 1. Guiding Principle

The application should collect the minimum amount of information required to make the next intelligent training decision.

Every additional question increases friction.

The system should prefer inferred data over requested data wherever possible.

The user should spend their time practising, not filling out forms.

---

## 2. Objective vs Subjective Data

All logged information falls into one of two categories.

### Objective Data

Objective data is factual and measurable. It should never require interpretation.

It is either calculated automatically or directly entered by the user.

Examples:

* Actual BPM achieved
* Number of repetitions
* Duration completed
* Accuracy percentage
* Target completed (true/false)
* Personal bests
* Session duration

### Subjective Data

Subjective data represents how the exercise felt. It should always be quick to enter.

Examples:

* Difficulty
* Confidence
* Cleanliness
* Frustration
* Fatigue

---

## 3. One Tap Principle

Every subjective question must be answerable in a single tap.

Avoid:

* Sliders
* Percentages
* Free-text fields as required inputs
* Long questionnaires

Use:

* Segmented controls
* Buttons
* Icons
* Simple choice lists

The only free-text field permitted in the exercise log is optional notes.

---

## 4. Dynamic Exercise Logging

The application must not ask identical questions for every exercise. Each exercise defines its own feedback requirements via a `feedbackSchema` field.

```ts
feedbackSchema: FeedbackQuestion[]
```

Each question defines:

* `id` — unique identifier for the question
* `label` — display text shown to the user
* `type` — input type (`segmented`, `rating`, `number`, `boolean`, `choice`)
* `options` — available answers where applicable
* `required` — whether the question must be answered before logging
* `followUpRules` — conditional questions triggered by specific answers

Example per-exercise feedback requirements:

**Alternate Picking**
* Actual BPM (objective, required)
* Cleanliness (subjective, required)
* Difficulty (subjective, required)

**Legato**
* Smoothness (subjective, required)
* Difficulty (subjective, required)

**Rhythm**
* Timing confidence (subjective, required)

**Bends**
* Pitch confidence (subjective, required)

**Muting**
* Noise control (subjective, required)

New exercise types must not require frontend code changes to collect feedback. The UI renders questions dynamically from the exercise's `feedbackSchema`.

---

## 5. Progressive Questioning

The application should ask follow-up questions only when the answer to a prior question indicates they would improve future training recommendations.

Example:

**Question:** How difficult was this exercise?

**Options:** Easy / Good / Hard / Impossible

- If **Easy**: no follow-up questions.
- If **Impossible**: display a follow-up question.

**Follow-up question:** What caused the difficulty?

**Options:** Too fast / Coordination / Hand fatigue / Pain / Didn't understand / Other

Follow-up rules are defined in the exercise's `feedbackSchema` using the `followUpRules` field and are evaluated deterministically at runtime.

---

## 6. Training Verdict

Every exercise concludes with a single overall verdict.

Permitted values:

* **Nailed It**
* **Nearly There**
* **Needs Work**

### Nailed It

Target achieved cleanly. User is confident repeating it. Suitable for progression consideration.

### Nearly There

Exercise completed. Needs more consistency. Remain at current level.

### Needs Work

Target not achieved. The training engine should adapt future sessions accordingly.

The Training Verdict is one of the most important pieces of data the application collects. It directly informs the adaptive programming layer.

---

## 7. Confidence vs Capability

The application tracks two separate and distinct concepts.

**Capability**

The highest recorded performance for a given exercise or metric. Examples: highest BPM achieved, longest endurance, highest accuracy score.

**Confidence**

The level at which the user consistently believes they can perform. This is informed by the Training Verdict and recent log history, not by peak performance alone.

Training recommendations must prioritise Confidence over isolated peak Capability.

Example:

```txt
Highest BPM:     145
Confidence BPM:  125
```

Future session targets should be generated from approximately 125 BPM, not 145 BPM. This mirrors the progressive overload principle used in athletic training — consistent repeatable performance is more valuable than occasional peaks.

---

## 8. Reliable Performance

The concept of "Best BPM" or "Personal Best" must be separated into two distinct metrics.

**Peak Performance**

The user's best-ever recorded value for a given metric. This is celebrated and displayed but does not drive future programming.

**Reliable Performance**

The user's consistently repeatable value, derived from recent logs weighted by Training Verdict. This is the value the training engine uses to generate session targets.

Training targets must be generated from Reliable Performance. Peak Performance must be surfaced in progress views but must not cause the engine to overshoot programming targets.

---

## 9. Automatic Metrics

The following metrics must be calculated automatically from logged data. They must never require manual user input.

* Personal Bests (per exercise, per metric)
* Streaks (daily and weekly)
* Weekly completion rate
* Monthly completion rate
* Session duration
* Practice frequency
* Skill rating improvements
* Training block completion
* Consistency trends

---

## 10. Weekly Reflection

At the end of each completed training week, the application should ask a single optional question.

**Question:** What would you like to prioritise next week?

**Options:**

* Speed
* Accuracy
* Control
* Endurance
* Maintain Current Plan

The answer influences future block generation but must not completely override the adaptive engine. If the user skips this question, the engine continues with its current programming logic.

---

## 11. Monthly Review

Monthly reviews must be generated entirely from logged data. No user input is required to produce a review.

A review must include:

* Practice days
* Practice hours
* Sessions completed
* Exercises completed
* Most improved skill
* Current weakest skill
* Personal bests achieved
* Longest streak
* Consistency percentage
* Recommended next block

The monthly review should resemble a professional training report rather than a statistics dashboard. The tone should be analytical and encouraging.

---

## 12. Honesty Principle

The application must never punish honesty.

If a user reports poor performance, the system must adapt training rather than penalise progress or reduce ratings aggressively.

Poor sessions are valuable training data. The application must reinforce accurate self-reporting positively.

Avoid messaging such as:

> "You lost progress."

Prefer messaging such as:

> "Today's training has been adjusted."

This principle applies to all user-facing copy related to performance reporting, skill ratings, and session adaptation.

---

## 13. AI Usage Philosophy

The application must be deterministic wherever practical. Core business logic must never depend on AI availability.

AI enhances the coaching experience. It does not implement core system behaviour.

**Use deterministic code for:**

* Skill rating calculations
* Progression rules
* Regression rules
* Personal best detection
* Streak calculation
* Session generation
* Exercise validation
* Data validation
* Monthly statistics

**Use AI for:**

* Coaching explanations
* Technique advice
* Motivational copy
* Exercise descriptions
* Clarifying common mistakes
* Personalised encouragement
* Generating contextual feedback
* Explaining why a session was generated
* Future roadmap suggestions for the player

The application must remain fully functional if AI services are unavailable.

---

## 14. Feedback Architecture

The following types define the canonical feedback model. These types live in `/lib/exercises/feedback-schema.ts`.

```ts
type FeedbackQuestion = {
  id: string;
  label: string;
  type:
    | "segmented"
    | "rating"
    | "number"
    | "boolean"
    | "choice";
  required: boolean;
  options?: FeedbackOption[];
  followUpRules?: FollowUpRule[];
};

type FeedbackOption = {
  id: string;
  label: string;
};

type FollowUpRule = {
  ifOptionId: string;
  showQuestionId: string;
};
```

This architecture ensures every exercise can define its own feedback while remaining completely data-driven and deterministic. The UI renders questions from the schema. The training engine consumes structured feedback objects. Neither the UI nor the engine needs to know which specific exercise is being logged in order to function correctly.

---

## 15. Technical Principles

The following engineering rules apply to all feedback collection, logging, and adaptive data systems.

* Feedback collection must be schema-driven. Questions are defined in exercise data, not in UI components.
* The UI must render feedback questions dynamically from exercise metadata.
* New exercise types must not require frontend code changes to collect feedback.
* The training engine must consume structured feedback objects rather than UI-specific values.
* Exercise logging must be extensible without database redesign.
* Follow-up questions must be deterministic and rule-based. No AI may determine which follow-up questions are shown.
* AI may interpret feedback after it has been collected and structured, but must not determine what questions are asked.
* Objective data and subjective data must be stored separately and labelled accordingly.
* Reliable Performance and Peak Performance must be tracked as distinct fields, not conflated into a single "best" value.

The result is a flexible, programmatic feedback system that minimises user effort while providing the adaptive training engine with high-quality, structured data suitable for long-term progression analysis.

---

# Exercise Selection Engine

This section defines how the app selects exercises for daily sessions, weekly plans, and training blocks. This is implementation guidance and is the technical source of truth for all exercise selection, session generation, progression, regression, and training adaptation logic.

---

## 1. Core Decision

The exercise selection engine must be deterministic-first.

AI may explain, summarise, or suggest refinements, but AI must not be the authority responsible for core exercise selection.

The system must remain capable of generating valid training sessions even if AI services are unavailable.

---

## 2. Selection Philosophy

The engine must not ask: *What exercise should this user do?*

It must ask: *What training stimulus does this user need today?*

Exercises are selected because they provide the right training stimulus at the right time.

Selection must account for:

* User goals
* Current training block
* Weekly plan
* Skill ratings
* Weaknesses
* Strengths
* Reliable performance
* Recent workload
* Missed sessions
* Fatigue signals
* Exercise mastery
* Practice time available
* Maintenance needs
* Variety
* Progression readiness

---

## 3. Selection Pipeline

The exercise selection pipeline is:

```txt
User Training State
        ↓
Determine Session Purpose
        ↓
Build Session Template
        ↓
Filter Eligible Exercises
        ↓
Score Candidate Exercises
        ↓
Select Exercises Per Slot
        ↓
Generate Targets
        ↓
Persist Practice Session
        ↓
Optional AI Explanation
```

Each step must be implemented as an isolated, testable function. No step may depend on AI to produce output.

---

## 4. Session Purpose

Before selecting exercises, the engine must determine the purpose of the session.

```ts
type SessionPurpose = {
  primaryFocusSkillId: SkillId;
  secondaryFocusSkillIds: SkillId[];
  sessionType: "standard" | "light" | "test" | "deload" | "maintenance";
  intensity: "low" | "moderate" | "high";
  estimatedMinutes: number;
  reasonCodes: SessionReasonCode[];
};

type SessionReasonCode =
  | "USER_GOAL"
  | "WEAKNESS_PRIORITY"
  | "BLOCK_FOCUS"
  | "MAINTENANCE_DUE"
  | "RECENT_MISSED_SESSION"
  | "HIGH_RECENT_WORKLOAD"
  | "PROGRESSION_READY"
  | "DELOAD_WEEK"
  | "CONSISTENCY_RECOVERY";
```

Reason codes must be machine-readable and are used by the AI explanation layer to generate natural-language session summaries.

---

## 5. Session Templates

The engine builds sessions from predefined templates, not from arbitrary exercise lists.

**Standard session:**

```txt
Warm-up
Primary
Secondary
Accessory
Isolation
Test
```

**Light session:**

```txt
Warm-up
Maintenance
Control Work
Reflection
```

**Test session:**

```txt
Warm-up
Benchmark 1
Benchmark 2
Benchmark 3
```

Each slot within a template is defined as:

```ts
type SessionSlot = {
  slotType:
    | "warmup"
    | "primary"
    | "secondary"
    | "accessory"
    | "isolation"
    | "test"
    | "maintenance";
  targetSkillIds: SkillId[];
  minDifficulty: number;
  maxDifficulty: number;
  estimatedMinutes: number;
  requiredMetricType?: PrimaryProgressMetric;
};
```

---

## 6. Eligibility Filtering

Before scoring, the engine must remove all exercises that are unsuitable for the current session.

An exercise is ineligible if:

* It is outside the user's current difficulty level range.
* It does not match the session slot type.
* It targets a skill not relevant to the session purpose.
* It is too difficult for the user's current reliable performance level.
* It was trained too recently, unless intentional repetition is warranted.
* It does not fit within the available session time.
* It is not part of an unlocked progression path.
* It requires a prerequisite the user has not met.
* It has incomplete or missing quality-contract metadata.
* It has invalid or unvalidated tab data.
* It is deprecated.

Eligibility filtering must be deterministic and independently testable.

---

## 7. Candidate Scoring

After filtering, each eligible exercise is scored using a weighted scoring function.

```ts
exerciseSelectionScore =
  goalMatchScore       * 0.20 +
  weaknessMatchScore   * 0.20 +
  blockRelevanceScore  * 0.15 +
  readinessScore       * 0.15 +
  progressionNeedScore * 0.10 +
  maintenanceNeedScore * 0.10 +
  varietyScore         * 0.05 -
  recentFatiguePenalty * 0.10 -
  tooSoonRepeatPenalty * 0.10 -
  difficultyMismatchPenalty * 0.15;
```

The exact weights may be tuned over time. The scoring function must remain deterministic, isolated, and fully testable. Scoring logic lives in `/lib/training-engine/scoring.ts`.

---

## 8. Score Components

### Goal Match Score

Higher when the exercise directly supports the user's declared goals.

### Weakness Match Score

Higher when the exercise targets a skill with a low or declining rating.

### Block Relevance Score

Higher when the exercise is aligned with the current training block's focus skills.

### Readiness Score

Higher when recent performance logs indicate the user is prepared for this exercise at its current difficulty.

### Progression Need Score

Higher when the exercise is the next logical step in an active, unlocked progression path.

### Maintenance Need Score

Higher when a skill marked as strong or mastered has not been trained recently enough.

### Variety Score

Higher when the exercise introduces useful variation without disrupting the training plan.

### Recent Fatigue Penalty

Applied when the exercise would heavily stress a skill area that has already been trained at high intensity recently.

### Too Soon Repeat Penalty

Applied when the exact exercise was used in a recent session without deliberate progression intent.

### Difficulty Mismatch Penalty

Applied when the exercise is significantly too easy or too hard relative to the user's current reliable performance level.

---

## 9. Reliable Performance Over Peak Performance

Exercise targets must be generated from Reliable Performance, not Peak Performance.

Peak Performance is celebrated in the progress UI but must not drive training load.

Example:

```txt
Peak clean BPM:     145
Reliable BPM:       125
Next target:        127–130
```

This prevents the engine from over-prescribing based on isolated high scores that the user cannot consistently reproduce.

---

## 10. Progression and Regression

The engine must evaluate whether to progress, hold, or regress each exercise based on recent logs and Training Verdicts.

**Default progression rule:**

```txt
Progress if:
- target met at least twice recently
- Training Verdict is "Nailed It"
- difficulty was Easy or Good
- confidence/cleanliness signals are positive
```

**Default hold rule:**

```txt
Hold if:
- target was met but verdict was "Nearly There"
- confidence is low
- performance is inconsistent across recent attempts
```

**Default regression rule:**

```txt
Regress if:
- target missed repeatedly
- verdict is "Needs Work"
- difficulty was Hard or Impossible
- user reports pain, confusion, or major coordination failure
```

All progression, hold, and regression decisions must be implemented deterministically and must not depend on AI.

---

## 11. Repetition Rules

The engine must intentionally repeat exercises when repetition provides training value. Repetition must not be avoided purely for the sake of variety.

**Repeat when:**

* The exercise is part of an active progression path.
* The user is near mastery and needs consolidation.
* The skill requires consistency work.
* The previous Training Verdict was "Nearly There".
* The session type is test or benchmark.

**Avoid repeating when:**

* The same skill has been trained at high intensity recently.
* The user has failed the exercise repeatedly with no performance change.
* The exercise no longer provides a meaningful training stimulus.
* Maintenance work at a lower intensity would be more appropriate.

---

## 12. Maintenance Work

Skill areas marked as strong or mastered must not disappear from the training plan. The engine must periodically prescribe maintenance exercises.

Maintenance work must be:

* Lower in volume than active development work.
* Lower in frequency than weak-skill work.
* Lower in priority than underdeveloped skills.
* Sufficient to prevent skill regression.

---

## 13. Missed Sessions and Recovery

Missed sessions affect future programming and must be handled explicitly.

When a user misses sessions:

* Do not stack missed work onto the next session.
* Recalculate the remaining week.
* Reduce intensity if the number of missed sessions is significant.
* Preserve the primary goal of the current training block.
* Prioritise consistency recovery over catching up on volume.

Missed sessions are scheduling data, not moral failure. The system must treat them as neutral programming input and must not produce punitive messaging.

---

## 14. Fatigue and Workload

The engine must track recent workload per skill to avoid overtraining the same technical area.

Minimum workload model:

```ts
type SkillWorkload = {
  skillId: SkillId;
  sessionsLast7Days: number;
  minutesLast7Days: number;
  highIntensitySessionsLast7Days: number;
  lastTrainedAt?: number;
};
```

For MVP, fatigue is inferred from:

* Recent session volume per skill
* Repeated Hard or Impossible Training Verdicts
* Low confidence signals across recent logs
* Missed sessions following high-volume periods
* Optional session-level fatigue feedback from the user

Explicit biometric or physiological data is not required in MVP.

---

## 15. Deterministic Explainability

Every generated session must include machine-readable reason codes for each selected exercise.

```ts
type SelectedExerciseReason = {
  exerciseId: Id<"exercises">;
  slotType: SessionSlotType;
  reasonCodes: ExerciseSelectionReasonCode[];
  scoreBreakdown: {
    goalMatch: number;
    weaknessMatch: number;
    blockRelevance: number;
    readiness: number;
    progressionNeed: number;
    maintenanceNeed: number;
    variety: number;
    penalties: number;
    total: number;
  };
};
```

These reason codes allow the AI explanation layer to generate natural-language copy such as:

> This exercise was selected because synchronisation is a current weak point, it supports your Foundation Block, and your recent logs show you are ready for the next variation.

The explanation is AI-generated. The selection is not.

---

## 16. AI Role

AI is permitted after deterministic selection for:

* Explaining why the session was generated using reason codes
* Rewriting reason codes into natural language for the user
* Offering technique reminders alongside exercises
* Summarising monthly progress in an encouraging tone
* Suggesting focus areas for the next training block

AI must not be responsible for:

* Selecting exercises from candidate lists
* Calculating or adjusting scores
* Determining progression or regression
* Validating exercises or tab data
* Detecting personal bests
* Calculating skill ratings
* Enforcing prerequisites
* Deciding streaks or achievements

**AI proposes language. Deterministic code decides training.**

---

## 17. Implementation Structure

```txt
/lib/training-engine
  determine-session-purpose.ts
  build-session-template.ts
  filter-eligible-exercises.ts
  score-candidate-exercises.ts
  select-session-exercises.ts
  generate-exercise-targets.ts
  reason-codes.ts
  workload.ts
  progression.ts
  regression.ts
  index.ts
```

Convex functions in `convex/sessions.ts` and `convex/progression.ts` should call into these utilities. Business logic must not live inside Convex handlers.

---

## 18. Testing Requirements

The following tests must be written. The engine must be fully testable without rendering UI and without calling AI services.

* Session purpose generation from user training state
* Session template selection by session type
* Eligibility filtering — each disqualification rule must have a passing and failing test
* Candidate scoring — each score component and penalty in isolation
* Exercise selection by slot type
* Target generation from Reliable Performance
* Progression rule evaluation from Training Verdict and recent logs
* Regression rule evaluation from Training Verdict and recent logs
* Missed-session recalculation logic
* Workload and fatigue penalty calculation
* Reason-code generation for a fully selected session
* AI unavailability fallback — engine must produce a valid session without AI

---

## 19. MVP Requirement

The MVP exercise engine does not need to be perfect.

It must be:

* Deterministic
* Explainable
* Testable
* Data-driven
* Adaptable over time
* Independent of AI availability
* Good enough to generate sensible sessions from a curated exercise library

Do not build complex machine learning models or adaptive neural approaches in MVP.

Start with a clearly structured weighted scoring system. Document the weights. Make the weights configurable. The system can be tuned as real user data accumulates.

---

# Domain Knowledge Architecture

This section defines the long-term architecture for the application's knowledge base. Its purpose is to separate software implementation from guitar training expertise. The technical specification remains focused on software architecture; domain knowledge lives in dedicated documentation that evolves independently.

---

## 1. Guiding Principle

The application's greatest long-term asset is not its UI or backend.

It is the structured knowledge that powers the adaptive training engine.

This knowledge must be treated as version-controlled product intellectual property.

Changes to this knowledge should be reviewed with the same care as production code.

---

## 2. Repository Structure

All domain knowledge lives under a top-level `knowledge/` directory. This directory is not application code. It contains the documents that define the behaviour of the training platform.

```txt
knowledge/
  principles/
  skills/
  drills/
  training-blocks/
  progression/
  research/
  whitepapers/
```

---

## 3. Product Principles

The philosophical foundation of the project is documented in:

```txt
knowledge/principles/product-principles.md
```

This document defines the North Star, Mission, Product Test, and Core Principles that govern all product decisions. It is required reading before implementing significant product features.

---

## 4. Skill Taxonomy

```txt
knowledge/skills/
```

Each trainable skill must eventually have its own document. These documents are the authoritative source of expertise for each skill area and should eventually drive structured data consumed by the training engine.

Each skill document must define:

* Skill definition
* Why it matters
* Primary purpose
* Secondary benefits
* How it is measured
* Primary progress metric
* Supporting metrics
* Common weaknesses
* Common mistakes
* Coaching cues
* Related drills
* Progression path
* Regression path
* Prerequisites
* Advanced techniques unlocked
* Mastery definition
* Maintenance recommendations

---

## 5. Drill Bible

```txt
knowledge/drills/
```

This directory is the canonical source for all drills. Each drill document must satisfy the Exercise Quality Contract defined in `## Tab Rendering & Exercise Quality Architecture`.

Each drill document must contain:

* Purpose
* Target skill
* Target weakness
* Difficulty
* Fatigue cost
* Training phase suitability
* Success criteria
* Common mistakes
* Coaching notes
* Progression rules
* Regression rules
* Measurement method
* Tab reference
* Session suitability
* Related drills
* Prerequisites

No drill should enter the production exercise library without satisfying this standard. The application targets approximately 40–80 exceptional drills, not hundreds of mediocre ones.

---

## 6. Training Blocks

```txt
knowledge/training-blocks/
```

Each block document describes a structured multi-week training programme type.

Each block document must contain:

* Block objective
* Typical duration
* Weekly structure
* Target workload
* Primary skills
* Secondary skills
* Progression philosophy
* Deload strategy
* Completion criteria
* Typical next block

Planned block types: Foundation, Precision, Speed, Rhythm, Lead Technique, Maintenance, Weakness Focus.

---

## 7. Research

```txt
knowledge/research/
```

This directory stores practice methodology notes, motor learning research, deliberate practice references, sports science inspiration, ergonomics, injury prevention, and music education research. Documents in this folder must not directly affect production code until findings are validated and reviewed.

---

## 8. White Papers

```txt
knowledge/whitepapers/
```

Long-form design documents that describe core intellectual property. These documents explain why the algorithms exist rather than how they are coded.

Planned whitepapers:

* Rating & Progression System
* Adaptive Training Engine
* Skill Rating Methodology
* Periodisation Model
* Confidence vs Capability
* Reliable Performance Model
* Exercise Scoring

---

## 9. Documentation Philosophy

The codebase must implement the knowledge system. The knowledge system must not be embedded inside the codebase.

Wherever practical, the information flow should be:

```txt
Knowledge → Structured Data → Engine → UI
```

Avoid hardcoding guitar expertise directly into business logic. When a training decision depends on domain expertise, that expertise should be traceable to a document in `knowledge/`, not hidden inside a TypeScript function.

---

## 10. TODO

The first high-priority knowledge document to author is:

```txt
knowledge/whitepapers/rating-and-progression.md
```

See `TODO.md` at the repository root for the full scope of this document.

---

## 11. Source-of-Truth Hierarchy

All product decisions, engine logic, and user-facing copy flow from this hierarchy. Nothing should contradict a higher layer without an explicit documented reason.

```txt
Product Principles
        ↓
Knowledge Documents
        ↓
Structured Seed Data
        ↓
Deterministic Training Engine
        ↓
UI
        ↓
AI Explanation Layer
```

**Product Principles** (`knowledge/principles/product-principles.md`) define why the app exists. Every significant product decision must be traceable to a principle.

**Knowledge Documents** (`knowledge/skills/`, `knowledge/drills/`, `knowledge/whitepapers/`) define the guitar training expertise that powers the platform. They are the source of truth for training methodology.

**Structured Seed Data** (`seed/exercises/`, `seed/skills.ts`) implements reviewed knowledge. Seed data must satisfy the Exercise Quality Contract and must be traceable to a knowledge document.

**Deterministic Training Engine** (`/lib/training-engine`) applies structured data to each user's state and produces training decisions. It must not contain embedded guitar expertise — that lives in knowledge documents and seed data.

**UI** presents the engine's output to the user. It must not make training decisions. It must not bypass the engine.

**AI Explanation Layer** interprets engine reason codes into natural language. It explains. It does not decide.

---

> The long-term value of the platform lies not only in its software, but in the quality of its training methodology, structured knowledge, and adaptive programming philosophy. The software exists to deliver that knowledge consistently, measurably, and at scale.

---

# Canonical Runtime Data Model

This section defines the authoritative runtime types for exercise logging, feedback collection, and derived engine state. These types supersede older field lists in Section 5. Source files live in `/lib/exercises/` and `/convex/schema.ts`.

---

## Core Types

```ts
type TrainingVerdict = "nailed_it" | "nearly_there" | "needs_work";

type FeedbackResponse = {
  questionId: string;
  value: string | number | boolean;
  category: "objective" | "subjective";
};

type ObjectiveExerciseResult = {
  metric: PrimaryProgressMetric;
  targetValue?: number;
  actualValue?: number;
  unit?: "bpm" | "reps" | "seconds" | "score";
};
```

---

## ExerciseLog

The canonical log written after each exercise is completed.

```ts
type ExerciseLog = {
  userId: Id<"users">;
  sessionId: Id<"practiceSessions">;
  exerciseId: Id<"exercises">;
  skillId: SkillId;
  date: number;

  trainingVerdict: TrainingVerdict;
  objectiveResult: ObjectiveExerciseResult;
  feedbackResponses: FeedbackResponse[];

  notes?: string;
  isPersonalBest: boolean;

  createdAt: number;
};
```

Static fields from the earlier model (`cleanlinessScore`, `difficultyRating`, `controlScore`, `timingScore`) are represented as `FeedbackResponse` entries. For example, cleanliness becomes a `feedbackResponse` with `questionId: "cleanliness"` and `category: "subjective"`. If a specific field is later needed as a first-class column for query performance, it may be promoted at that point.

Raw logs are the immutable audit trail. They are never modified after creation.

---

## UserExerciseState

Derived state maintained per user per exercise. The training engine reads from this table rather than scanning raw logs on every decision. Raw logs remain the source of truth; this table is the materialised view.

```ts
type UserExerciseState = {
  userId: Id<"users">;
  exerciseId: Id<"exercises">;
  skillId: SkillId;

  currentLevel: number;

  masteryStatus:
    | "new"
    | "learning"
    | "developing"
    | "consistent"
    | "strong"
    | "mastered"
    | "maintenance";

  reliablePerformance?: {
    metric: PrimaryProgressMetric;
    value: number;
    unit: string;
    calculatedAt: number;
  };

  peakPerformance?: {
    metric: PrimaryProgressMetric;
    value: number;
    unit: string;
    achievedAt: number;
  };

  lastPractisedAt?: number;
  recentVerdicts: TrainingVerdict[];

  consecutiveNailed: number;
  consecutiveNeedsWork: number;

  progressionReady: boolean;
  regressionRecommended: boolean;

  updatedAt: number;
};
```

`UserExerciseState` is updated after each exercise log is written. It must be safe to recompute entirely from raw `ExerciseLog` records — it is never the only source of truth.

---

# Security, Auth & Data Access Rules

These rules apply to every Convex query, mutation, and action in the application.

* Every user-scoped Convex query or mutation must derive the authenticated user from the server auth context (`ctx.auth.getUserIdentity()`). Client-provided user IDs must never be trusted.
* Users may only read and write their own sessions, logs, skill ratings, exercise state, achievements, monthly reviews, user profile, and subscription state.
* Global seed data — skills, exercises, progression paths, training block definitions — is readable by all authenticated users. It is not user-scoped.
* Exercise seed data is not user-editable in MVP. Write access to the exercises table is restricted to seeding operations.
* Subscription tier gating must be enforced server-side. Client-reported tier values must not gate features.
* All Convex functions must validate inputs using Convex validators. Unvalidated input must never reach the handler.

---

# Idempotency & Retry Safety

All write paths must be safe to retry without corrupting state.

* `logExerciseResult` must be idempotent per the combination of `sessionId + exerciseId + sessionItemOrder`. A retry on an already-logged result must not create a duplicate log.
* Completing a session a second time must not create duplicate logs, duplicate XP awards, duplicate achievement unlocks, or duplicate streak updates.
* Achievement unlocks must be idempotent per `userId + achievementId`. Unlocking an already-unlocked achievement must be a no-op.
* Monthly review generation must be idempotent per `userId + month + year`. Regenerating an existing review must overwrite, not duplicate.
* Retried Convex mutations must not produce inconsistent derived state in `UserExerciseState` or skill ratings.
* `UserExerciseState` and skill ratings must be safe to recompute in full from raw `ExerciseLog` records if a corruption is detected.

---

# Observability & Product Analytics

Analytics serve two purposes: improving exercise quality and reducing practice friction. They are not vanity dashboards.

## MVP Funnel Events

Track the following events to understand where users drop off:

```txt
onboarding_started
onboarding_completed
first_training_block_generated
first_session_generated
first_session_started
first_exercise_logged
first_session_completed
session_abandoned
session_resumed
weekly_plan_completed
monthly_review_viewed
subscription_page_viewed
pro_conversion
```

## Training Quality Events

Track the following to identify exercises that need improvement:

```txt
exercise_skipped                    — which exercises are most skipped
exercise_failed                     — which exercises are most often logged as "needs_work"
exercise_nailed_it_rate             — which exercises have unusually high nailed_it rates (too easy)
exercise_needs_work_rate            — which exercises have high needs_work rates (too hard or unclear)
session_completion_by_length        — average completion rate by estimated session duration
session_completion_by_type          — average completion rate by session type
time_to_first_exercise              — average time between opening app and starting first exercise
```

These events should be instrumented without collecting unnecessary personal data.

---

# AI Operational Boundaries

AI is a presentation layer. It must not be a decision layer.

* AI output must never directly mutate training state, skill ratings, progression decisions, or exercise logs.
* AI explanations are generated from deterministic reason codes after the engine has already made its decisions. They are stored separately from the decisions they describe.
* If AI is unavailable, a deterministic fallback copy must be shown. The app must remain fully functional.
* AI-generated coaching text may be cached by `sessionId`, `exerciseId`, or `monthlyReviewId` to avoid redundant API calls.
* Personal data sent to external AI services must be minimised. User identifiers, detailed health information, and raw performance logs must not be sent unless strictly necessary for the feature.
* AI-generated drill or exercise content must never enter the MVP seed library without human review, quality-contract validation, and tab data validation. Unreviewed AI content is not an acceptable shortcut.

**AI explains. Deterministic code decides.**

---

# Terminology

Consistent terminology across code, copy, and documentation reduces confusion.

| Context | Preferred term |
|---|---|
| Code, database tables, schemas, engine logic | `Exercise` |
| User-facing product copy | `Drill` (where it feels clearer and more training-oriented) |
| Referring to app users | `Player` or `Guitarist` |
| Referring to a training session | `Training Session` or `Session` |
| A measurable performance ceiling | `Reliable Performance` |
| A once-achieved high score | `Personal Best` or `Peak Performance` |
| A multi-week programme | `Training Block` or `Block` |
| A loggable performance threshold | `Benchmark` |

Avoid using `Lesson`, `Course`, or `Student` anywhere in the product. These terms imply a teacher-led educational product, which this is not.

---

# Build Priority

Before implementing advanced scoring, AI coaching, subscription features, or gamification, the following must be in place and working end-to-end.

1. **Validated exercise schema** — `TabData`, `Exercise`, and all validation functions in `/lib/tabs` and `/lib/exercises`
2. **Tab rendering adapter** — `alphatab-adapter.ts` converting `TabData` to alphaTab input, with fallback components
3. **Seed skill taxonomy** — 3–5 skills seeded and queryable (not all 13; see First Implementation Milestone below)
4. **10–15 excellent MVP drills** — fully validated exercises covering the first 3–5 skills, with real tab data, passing the quality contract checklist
5. **Onboarding** — goal selection, schedule, initial skill assessment producing initial skill ratings
6. **Today session generation** — engine generating a valid `PracticeSession` from user state
7. **Exercise logging** — `logExerciseResult` writing an `ExerciseLog` with `TrainingVerdict` and `feedbackResponses`
8. **Derived `UserExerciseState`** — updated after each log, consumed by the engine for next-session decisions

This sequence validates the core training loop before any further investment. If any of these steps does not work end-to-end, the rest of the product has no foundation.

## First Implementation Milestone

Do not attempt to seed all 13 MVP skills before proving the full loop. Seed 3–5 skills and 10–15 drills, prove the loop works, then expand.

Recommended first skill areas:

* Alternate picking
* Synchronisation
* Rhythm
* Muting
* Fretting accuracy

These five provide enough variety to exercise the session generation, feedback, and progression logic without requiring a full content library upfront.

---

# Seed Data Versioning

Exercises, skills, progression paths, and training block definitions are versioned domain data. They must be treated with the same care as a database migration: a change that breaks existing meaning requires a new version, not an overwrite.

## Required versioning fields on exercises

```ts
version: number;
status: "active" | "deprecated" | "archived";
replacedByExerciseId?: Id<"exercises">;
createdAt: number;
updatedAt: number;
```

## Rules

* Historical `ExerciseLog` records must continue to reference the exact exercise version that was active at the time of logging. Log data must not be retroactively invalidated by exercise changes.
* Do not mutate the meaning of an existing exercise in a way that makes previous logs uninterpretable — for example, changing the primary metric, substantially rewriting the tab, or altering the progression level.
* If a drill changes substantially, create a new exercise entry with an incremented version and set `replacedByExerciseId` on the old entry. Mark the old entry as `deprecated`.
* Minor corrections (typos, coaching note rewording, description improvements) that do not affect logging semantics are acceptable as in-place updates.
* Skill definitions, progression paths, and training block types should follow the same principle: significant changes to meaning warrant a new version.

The goal is to ensure that historical performance data remains meaningful as the content library evolves.
