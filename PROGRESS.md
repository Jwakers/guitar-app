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
- [x] Skill taxonomy seed data (`seed/skills.ts` — 13 MVP skills)
- [x] Skills Convex functions (`convex/skills.ts` — seedSkills, listSkills)
- [x] App shell layout (`src/app/(app)/layout.tsx`)
- [x] Bottom navigation (Today / Progress / Training / Profile)
- [x] UserSync component (creates Convex user record on first auth)
- [ ] Exercise seed data (MVP set)

---

## Phase 2: Onboarding

- [ ] Onboarding questionnaire (experience level, guitar type, goals)
- [ ] Practice schedule selection (available days, session length, intensity)
- [ ] Initial skill self-assessment (rate 1–5 per skill)
- [ ] Initial skill ratings written to Convex (`userSkillRatings`)
- [ ] Onboarding completion flag set (`onboardingCompleted: true`)
- [ ] Generate initial training block from profile + skill ratings
- [ ] Redirect new users to onboarding before Today screen

---

## Phase 3: Training Engine v1

- [ ] `convex/trainingBlocks.ts` — getCurrentBlock, createBlock
- [ ] `convex/weeklyPlans.ts` — getWeeklyPlan, generateWeekPlan
- [ ] `lib/training-engine/` — session generation logic
- [ ] `convex/sessions.ts` — getTodaySession, generateSession
- [ ] Basic progressive overload rules
- [ ] Deload/light session logic

---

## Phase 4: Practice Flow

- [ ] Today screen (`/today`) — shows today's session or generates one
- [ ] Practice player (`/train/[sessionId]`) — exercise-by-exercise flow
- [ ] Tab display component (monospace, mobile-readable)
- [ ] Exercise logging (cleanliness, difficulty, primary metric, BPM)
- [ ] Session completion screen with summary
- [ ] Progressive save (logs each exercise immediately)
- [ ] Session resume after interruption

---

## Phase 5: Progress

- [ ] Skill rating update logic (`convex/progression.ts`)
- [ ] Progress dashboard (`/progress`)
- [ ] Skill detail page (`/progress/skills/[skillId]`)
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
| Today (stub) | `/today` | Stub |
| Practice player | `/train/[sessionId]` | Not built |
| Progress | `/progress` | Not built |
| Skill detail | `/progress/skills/[skillId]` | Not built |
| Training blocks | `/training` | Not built |
| Exercise library | `/exercises` | Not built |
| Exercise detail | `/exercises/[exerciseId]` | Not built |
| Monthly review | `/review/monthly` | Not built |
| Achievements | `/achievements` | Not built |
| Profile | `/profile` | Not built |
| Settings | `/settings` | Not built |
| Onboarding | `/onboarding` | Not built |
