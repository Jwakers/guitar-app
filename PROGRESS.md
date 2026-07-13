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
- [x] Practice schedule preferences (session length, intensity, sessions-per-week target)
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
- [x] Basic progressive overload rules
- [x] Deload/light session logic

---

## Phase 4: Practice Flow

- [x] Today screen (`/today`) — shows today's session or generates one
- [x] Practice player (`/train/[sessionId]`) — exercise-by-exercise flow
- [x] Tab display component (monospace, mobile-readable) — AlphaTab in session context
- [x] Exercise logging (cleanliness, difficulty, primary metric, BPM) — dynamic `feedbackSchema` renderer + BPM confirmation
- [x] Session completion screen with detailed log summary
- [x] Progressive save (logs each exercise item status immediately)
- [x] Session resume after interruption
- [x] Built-in metronome on exercise step (target BPM pre-set)
- [x] Same-day session replay (read-only — no re-logging)

---

## Phase 5: Progress

- [x] Skill rating update logic (`convex/progression.ts`)
- [x] Progress dashboard (`/progress`)
- [x] Skill target detail page (`/progress/targets/[skillTarget]`)
- [x] Exercise history view
- [x] Personal best tracking
- [x] Trend indicators (7-day, 30-day)

---

## Phase 6: Gamification

- [x] Streak tracking
- [x] Medal system (bronze / silver / gold)
- [x] Achievements (`convex/achievements.ts`)
- [x] Monthly review generation (`convex/reviews.ts`)
- [x] Achievements screen (`/achievements`)
- [x] Monthly review screen (`/review/monthly`)

---

## Always-on training UX

- [x] Always-on practice (no rest-day gate; pending sessions resume)
- [x] Achievement catalog seeds on `/achievements` visit
- [x] Monthly review month-scoped stats with bounded navigation
- [x] `/training` extra + custom sessions
- [x] `/settings` practice preferences (`sessionsPerWeek`, length, intensity)
- [x] `availableDays` deprecated for session gating (kept for backwards compatibility)

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
| Progress | `/progress` | Done |
| Skill target detail | `/progress/targets/[skillTarget]` | Done |
| Training | `/training` | Done |
| Exercise library | `/exercises` | Not built |
| Exercise detail | `/exercises/[exerciseId]` | Not built |
| Monthly review | `/review/monthly` | Done |
| Achievements | `/achievements` | Done |
| Profile | `/profile` | Done |
| Settings | `/settings` | Done |
| Onboarding | `/onboarding` | Done |
