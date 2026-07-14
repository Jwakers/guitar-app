# Rating & Progression

This document describes how the app measures user capability, updates skill ratings from practice, and governs exercise-level progression and regression. It is the design authority for the training engine's rating and progression logic.

**Implementation references:**

- Skill ratings: `src/lib/training-engine/skill-ratings.ts`
- Exercise reliable performance & BPM targets: `src/lib/training-engine/reliable-performance.ts`
- Exercise selection scoring: `src/lib/training-engine/scoring.ts`
- Persistence & triggers: `convex/lib/recomputeSkillRatings.ts`, `convex/lib/logExerciseResult.ts`

---

## Two separate scales

The app uses two independent difficulty/capability scales. They must not be conflated.

| Concept | Scale | Purpose |
| --- | --- | --- |
| **Exercise difficulty** (`difficultyLevel`) | 1–10 | How hard a drill is in the catalog. See `knowledge/drills/drill-generation-and-validation.md`. |
| **Skill rating** (`userSkillRatings.rating`) | 0–100 | How capable the user is at a core or sub-skill, derived from practice logs. |

Changing the exercise difficulty rubric does **not** require remapping stored user skill ratings. Exercise difficulty affects session slot eligibility and drill authoring; skill ratings are driven by training verdicts and objective results.

---

## Skill ratings

### What they represent

A skill rating is a 0–100 estimate of the user's current capability for a **core skill** (e.g. Picking) or **sub-skill** (e.g. String Crossing). Ratings are used by the exercise selection engine to target weaknesses: lower ratings increase the likelihood that related drills are prescribed.

Ratings are **not** a permanent badge. They reflect recent practice performance and should move in both directions when logged results warrant it.

### Initial values

**Onboarding (core skills only):** The user self-assesses each core skill on a 1–5 scale. This maps to stored ratings as `rating × 20` (20, 40, 60, 80, 100) with `confidence: 0.5`.

**Sub-skills:** Not seeded at onboarding. On first log-driven recompute for a sub-skill with no existing row, the previous rating defaults to **60**.

**Practice-driven updates:** After every exercise log, ratings recompute for the exercise's core skill and each of its sub-skills.

### Bidirectional updates

Ratings increase when recent logs score above the current rating and decrease when recent logs score below it. The algorithm is symmetric:

- Same **±6 point cap** per recompute (`MAX_RATING_DELTA`)
- Same **65% inertia** toward the stored previous rating
- Same rolling window and recency weighting for all logs

A single poor session will not crater a rating; sustained underperformance is required for meaningful drops. Similarly, a single excellent session will not inflate a rating dramatically.

**Inactivity:** If the user stops practising a skill, the numeric rating does **not** decay. Strong skills (rating > 70) that have not been trained for 21+ days receive status `maintenance` instead of `strong`. This is a programming signal, not a punishment.

### Per-log performance score

Each exercise log is converted to a 0–100 performance score before aggregation.

**Training verdict base scores:**

| Verdict | Base score |
| --- | --- |
| Nailed It (`nailed_it`) | 85 |
| Nearly There (`nearly_there`) | 65 |
| Needs Work (`needs_work`) | 50 |

When feedback is missing, the default verdict is `nearly_there`.

**Objective metric blending (clean_bpm only):**

For exercises with primary metric `clean_bpm` and both target and actual BPM present:

```txt
score = verdictBase × 0.6 + min(actual/target, 1.2) × 100 × 0.4
```

Other metrics (`accuracy_score`, `control_score`, etc.) use the verdict base only. Objective blending for non-BPM metrics is planned future work.

### Rolling window aggregation

From the user's exercise logs for the skill target:

1. Take the **10 most recent** logs (`SKILL_RATING_WINDOW`)
2. Sort by date descending (newest first)
3. Compute a recency-weighted average of per-log scores: weight = `1 / (1 + index × 0.15)`
4. Blend with stored rating: `0.65 × previousRating + 0.35 × windowScore`
5. Clamp change to **±6** points and round to integer

### Derived fields

| Field | Logic |
| --- | --- |
| `status` | ≤40 weak · ≤55 developing · ≤56–70 stable · >70 strong; strong + 21 days idle → maintenance |
| `confidence` | `min(0.9, 0.5 + logCount × 0.03)` — grows with practice volume |
| `trend7Day` / `trend30Day` | Rating computed from all logs minus rating from logs before cutoff |
| `lastTrainedAt` | Most recent log date for this skill target |

### Status bands (runtime)

Onboarding uses a separate 1–5 → status mapping for the initial seed. After the first practice-driven recompute, status follows the 0–100 bands above.

---

## Training verdicts

Training verdicts are the primary subjective signal for both skill ratings and exercise progression.

| Verdict | User meaning | Skill rating impact | Exercise progression |
| --- | --- | --- | --- |
| Nailed It | Clean, controlled, met the target | High per-log score (85 base) | Contributes to progression readiness |
| Nearly There | Mostly there, minor issues | Mid per-log score (65 base) | Neutral; counts as reliable for BPM median |
| Needs Work | Breakdown, did not meet target | Low per-log score (50 base) | Triggers regression recommendation |

Verdicts are resolved from feedback responses at log time (`convex/lib/logExerciseResult.ts`).

---

## Reliable performance & peak performance

These are **per-exercise** metrics stored in `userExerciseState`, separate from skill ratings.

### Reliable performance

The median clean BPM from the **5 most recent** logs with reliable verdicts (`nailed_it` or `nearly_there`). Used to set the next session's target BPM for that exercise.

### Peak performance

The highest clean BPM ever logged for the exercise. Surfaced as a personal best reference.

### Progression and regression (exercise level)

After each log, the engine evaluates recent verdicts (last 5):

- **Progression ready:** At least 1 consecutive `nailed_it` at the end of recent verdicts → target BPM increases by 5
- **Regression recommended:** At least 1 consecutive `needs_work` → target BPM decreases by 5

Light and deload sessions apply an 0.85 intensity factor to the computed target BPM.

This is independent of skill rating movement. A user can regress on a specific exercise while their overall picking rating remains stable (inertia + other logs).

---

## Confidence

**Implemented (MVP):** Confidence is derived from **log count** for the skill target: baseline 0.5, +0.03 per log, capped at 0.9. It only increases; it does not decrease after poor sessions.

**Planned:** Infer confidence from verdict quality and consistency — e.g. high confidence when recent logs are predominantly `nailed_it` at varied difficulties; lower confidence when verdicts are mixed or sparse.

---

## Relationship to exercise difficulty

Exercise `difficultyLevel` (1–10) affects:

- Session slot eligibility (min/max difficulty bands in `session-templates.ts`)
- Exercise selection penalties (e.g. low-intensity sessions penalise difficulty > 4)

It does **not** currently affect skill rating recomputation. All logs contribute equally regardless of exercise difficulty.

**Planned:** Weight logs from harder exercises more heavily when updating skill ratings, so demonstrating capability on a level-6 drill moves the rating more than the same verdict on a level-2 drill.

---

## Exercise selection scoring

Skill ratings feed the **weakness match** component of exercise selection (`scoring.ts`):

```txt
weaknessScore = (100 - coreRating) / 100 + sum of ((100 - subRating) / 100 × 0.5)
```

Lower ratings increase the chance that related exercises are selected. This is independent of exercise difficulty filtering.

Several scoring components remain MVP placeholders (fixed neutral values): readiness, progression need, maintenance need.

---

## Future work

The following are documented design intentions not yet implemented in skill ratings:

| Feature | Rationale |
| --- | --- |
| Difficulty-weighted logs | Harder exercises should move ratings more when performed well (or poorly) |
| Numeric inactivity decay | Optional gentle rating decay when a skill is not practised for extended periods |
| Verdict-based confidence | Confidence should reflect quality of evidence, not just log count |
| Non-BPM objective blending | Extend ratio-based scoring to accuracy, control, and other metrics |
| Perceived difficulty feedback | Session feedback (Easy / Good / Hard / Impossible) wired into progression rules per technical spec |
| Manual re-assessment | Post-onboarding self-rating flow to reset core skill seeds |
| Separate performance vs consistency dimensions | Split rating into capability and reliability components |

---

## Long-term progression philosophy

1. **Gradual movement** — Ratings and targets change slowly. One session never defines capability.
2. **Bidirectional honesty** — Scores decrease when performance declines, not only when it improves.
3. **No punishment for absence** — Missing practice affects programming (maintenance status) but does not arbitrarily lower numeric ratings.
4. **Exercise vs skill separation** — Per-exercise BPM regression handles local failure; skill ratings reflect broader capability across all drills for that skill.
5. **Evidence over self-report** — After onboarding, practice logs are the primary rating input.
6. **Recomputable state** — All derived state (skill ratings, exercise state) can be rebuilt from raw `exerciseLogs`.

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-07 | Initial whitepaper documenting implemented MVP algorithm and planned extensions |
