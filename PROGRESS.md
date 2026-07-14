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

- [x] Subscription tier model (free / pro) with cached `users.subscriptionTier`
- [x] Central entitlements (`src/lib/subscriptions/entitlements.ts`)
- [x] Server-side feature gates (training, monthly review history, skill history)
- [x] Subscription page (`/settings/subscription`) — PricingTable-ready shell
- [x] Clerk Billing sync scaffold (`convex/http.ts` webhook + `syncFromClerkBilling`)
- [ ] Clerk Billing checkout UI + live webhook wiring (when billing enabled)

---

## Phase 8: Practice UX & Authoring Polish

Work these one at a time. Shared tab/exercise surfaces live in `src/components/exercises/exercise-detail-sections.tsx` (practice + drills).

- [x] **Tab MIDI / audio player** — Wire AlphaTab’s built-in player (default soundfont) into `TabRenderer` / `src/lib/tabs/render-config.ts`. Ship play/pause with tempo tied to exercise/target BPM wherever tabs render (practice, drill detail, admin preview). Coexist with the existing metronome; do not replace it.
- [x] **Super-user inline metadata editor** — When `users.isSuperUser`, show an editable panel under every tab. Editable: all useful exercise fields except `tabData` and immutable/system fields (`_id`, `_creationTime`, `slug`, etc.). Includes title, description, purpose, coachingNotes, targetWeaknesses, minimumCleanStandard, measurementInstructions, difficultyLevel, exerciseType, skills/attributes, progress metric + BPM fields, successCriteria, commonMistakes, progression/regression rules, patternType, microDrillJustification, estimatedMinutes, isMvp, feedbackSchema, status/replacedBySlug, and admin notes. Persist via a super-user-only Convex mutation (bump `version`/`updatedAt`). Tab note editing is out of scope.
- [x] **Redefine difficulty 1–10 (intermediate start → mastery)** — 1–3 starting band; 4 solid intermediate; 5–6 advanced; 7–8 stretch; 9–10 basic mastery (rare). Updated prompts, inference, session bands, docs; remapped existing catalog; removed `devReset`.
- [ ] **Coaching notes + purpose layout** — Move purpose (and short description if needed) above the tab. Make coaching notes sticky on desktop (side panel); stacked but prominent on mobile. Keep practice and `/drills/[id]` consistent via shared detail sections.
- [x] **Admin notes on exercises** — Add `adminNotes` (or equivalent) to `exercises` schema; super-user-only read/write. UI under the tab (same panel as metadata editor) so future tab/content edits can use prior review context. Hidden from normal users.
- [x] **Session progress “Exercise x of y”** — Already shown in `practice-player.tsx` as `EXERCISE {n} OF {total}`. Revisit only if visibility/placement still feels weak in use.

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
| Exercise library (drills) | `/drills` | Done |
| Exercise detail (drill) | `/drills/[id]` | Done |
| Monthly review | `/review/monthly` | Done |
| Achievements | `/achievements` | Done |
| Profile | `/profile` | Done |
| Settings | `/settings` | Done |
| Subscription | `/settings/subscription` | Done |
| Onboarding | `/onboarding` | Done |

Runtime routes use `/drills` and `/drills/[id]`. The technical spec's `/exercises` paths redirect here.
