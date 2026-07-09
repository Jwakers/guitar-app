# Drill Bible

This directory is the canonical source for all training drills.

No drill should enter the production exercise library without a corresponding document here that satisfies the Exercise Quality Contract defined in `docs/technical-spec.md` (section: Tab Rendering & Exercise Quality Architecture).

The platform targets approximately 40–80 exceptional drills, not hundreds of mediocre ones.

**Process & scoring authority:** [`drill-generation-and-validation.md`](./drill-generation-and-validation.md) — how drills are generated, scored, reviewed, validated, and accepted. The internal drill-generation tool must use this document as intelligence for drafting and quality checks. Generated drills are candidates only; they must not enter production without schema validation, training-value review, human playability review, and migration via [`docs/exercise-migration.md`](../../docs/exercise-migration.md).

---

## Exercise migration

Exercises are authored in Convex **dev** and promoted to **production** with:

```bash
pnpm migrate:exercises
```

See [`docs/exercise-migration.md`](../../docs/exercise-migration.md) for deploy keys, idempotency rules, and workflow.

---

## Planned Drill Documents

Organised by core skill and sub-skill:

**Picking / Alternate Picking**
- `alternate-picking-single-string-l1.md`
- `alternate-picking-two-string-l2.md`
- `alternate-picking-string-crossing-l3.md`

**Synchronisation**
- `chromatic-synchronisation-l1.md`

**Rhythm & Timing / Subdivision Control**
- `rhythm-subdivision-quarter-l1.md`
- `rhythm-subdivision-eighth-l2.md`

**Lead Articulation / Legato**
- `hammer-on-pull-off-l1.md`

**Lead Articulation / Bends**
- `whole-step-bend-l1.md`

**Lead Articulation / Vibrato**
- `vibrato-control-l1.md`

**Muting & Noise Control / Palm Muting**
- `palm-muting-control-l1.md`

*(Remaining drills to be authored before exercise seed work begins.)*

---

## Document Template

Each drill document must define the following sections:

```markdown
# [Drill Title]

## Purpose
The specific training goal this drill addresses.

## Core Skill
Broad trainable area.

## Sub-skills
Specific technique IDs trained by the drill.

## Training Attributes
Modifiers such as speed, endurance, accuracy, control, and consistency.

## Target Weakness
The specific gap or weakness this drill exposes and develops.

## Difficulty
1–10 scale with justification.

## Fatigue Cost
Low | Medium | High — how taxing this drill is on the hands and focus.

## Training Phase Suitability
Which session slot types this drill suits (warmup | primary | secondary | accessory | isolation | test).

## Success Criteria
What successful execution looks, sounds, and feels like.

## Common Mistakes
The errors players most frequently make on this drill.

## Coaching Notes
Technique and mindset guidance to accompany this drill.

## Progression Rules
The conditions under which a player should advance to a harder variation.

## Regression Rules
The conditions under which a player should step back to an easier variation.

## Measurement Method
How the player quantifies their performance.

## Tab Reference
Reference to the structured tab data for this drill (stored in Convex dev/prod).

## Session Suitability
Recommended session types and slot positions.

## Related Drills
Links to drills that complement or follow from this one.

## Prerequisites
Core skills, sub-skills, or drills the player should have before attempting this drill.
```
