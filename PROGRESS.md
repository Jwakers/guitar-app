# GTPL — Build Progress

Track what is built and what remains. Update this file as features land.

---

## Phase 1: Foundation

### Infrastructure (complete)
- [x] Next.js 16 + Turbopack
- [x] Tailwind v4 + shadcn design system
- [x] Clerk authentication (sign-in, sign-up, proxy protection)
- [x] Convex database schema (14 tables, all indexes)
- [x] Convex + Clerk integration (ConvexProviderWithClerk, auth.config.ts)
- [x] Marketing landing page (`/`)
- [x] Auth proxy (public/protected route split)

### Phase 1 features
- [x] Convex user sync (`convex/users.ts` — createOrUpdateUser, getCurrentUser)
- [x] Convex auth helper (`convex/lib/auth.ts` — requireCurrentUser)
- [x] Static skill taxonomy (`src/lib/skills/taxonomy.ts` — Core Skill → Sub-skill)
- [x] Skills Convex functions (`convex/skills.ts` — taxonomy queries)
- [x] App shell layout (`src/app/(app)/layout.tsx`)
- [x] Bottom navigation (Today / Progress / Training / Profile)
- [x] UserSync component (creates Convex user record on first auth)
- [x] Exercise authoring workflow (dev Convex + `pnpm migrate:exercises` → prod)

---

## Phase 2: Onboarding

- [x] Onboarding questionnaire (experience level, guitar type, goals)
- [x] Practice schedule selection (available days, session length, intensity)
- [x] Initial skill self-assessment (rate 1–5 per skill)
- [x] Initial skill ratings written to Convex (`userSkillRatings`)
- [x] Onboarding completion flag set (`onboardingCompleted: true`)
- [x] Generate initial training block from profile + skill ratings
- [x] Redirect new users to onboarding before Today screen

---

## Phase 3: Training Engine v1

- [x] `convex/trainingBlocks.ts` — getCurrentBlock, createBlock
- [x] `convex/weeklyPlans.ts` — getWeeklyPlan, generateWeekPlan
- [x] `lib/training-engine/` — session generation logic
- [x] `convex/sessions.ts` — getTodaySession, generateSession
- [ ] Basic progressive overload rules
- [ ] Deload/light session logic

---

## Phase 4: Practice Flow

- [x] Today screen (`/today`) — shows today's session or generates one
- [x] Practice player (`/train/[sessionId]`) — exercise-by-exercise flow
- [x] Tab display component (monospace, mobile-readable) — AlphaTab in session context
- [x] Exercise logging (cleanliness, difficulty, primary metric, BPM) — `logExerciseResult` + BPM confirmation; full dynamic `feedbackSchema` TBD
- [x] Session completion screen with summary (stub — detailed feedback TBD)
- [x] Progressive save (logs each exercise item status immediately)
- [x] Session resume after interruption
- [x] Built-in metronome on exercise step (target BPM pre-set)
- [x] Same-day session replay (read-only — no re-logging)

---

## Phase 5: Progress

- [ ] Skill rating update logic (`convex/progression.ts`)
- [ ] Progress dashboard (`/progress`)
- [ ] Skill target detail page (`/progress/targets/[skillTarget]`)
- [ ] Exercise history view
- [ ] Personal best tracking
- [ ] Trend indicators (7-day, 30-day)

---

## Phase 6: Gamification

- [ ] Streak tracking
- [ ] Medal system (bronze / silver / gold)
- [ ] Achievements (`convex/achievements.ts`)
- [ ] Monthly review generation (`convex/reviews.ts`)
- [ ] Achievements screen (`/achievements`)
- [ ] Monthly review screen (`/review/monthly`)

---

## Phase 7: Subscription Readiness

- [ ] Subscription tier model (free / pro)
- [ ] Feature gate logic
- [ ] Subscription page (`/settings/subscription`)
- [ ] Billing integration (post-MVP)

---

## Screens status

| Screen | Route | Status |
|---|---|---|
| Marketing landing | `/` | Done |
| Sign in | `/sign-in` | Done |
| Sign up | `/sign-up` | Done |
| Today | `/today` | Done |
| Practice player | `/train/[sessionId]` | Done |
| Progress | `/progress` | Not built |
| Skill target detail | `/progress/targets/[skillTarget]` | Not built |
| Training blocks | `/training` | Not built |
| Exercise library | `/exercises` | Not built |
| Exercise detail | `/exercises/[exerciseId]` | Not built |
| Monthly review | `/review/monthly` | Not built |
| Achievements | `/achievements` | Not built |
| Profile | `/profile` | Not built |
| Settings | `/settings` | Not built |
| Onboarding | `/onboarding` | Done |
