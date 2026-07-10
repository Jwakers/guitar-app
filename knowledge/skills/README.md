# Skill Knowledge Docs

This directory contains one document per sub-skill where extra mechanical guidance is useful.

The canonical taxonomy is:

```txt
Core Skill -> Sub-skill -> Drill
```

Core skills live in code at `src/lib/skills/taxonomy.ts`. These markdown files add deeper authoring guidance for sub-skills, especially boundaries like "string crossing" vs "string skipping".

Muting-related sub-skills (`palm_muting`, `fret_hand_muting`, `release_control`) are **cross-cutting technique tags**. They attach to valid core skills (e.g. rhythm + palm muting, picking + fret-hand muting) and are not a standalone core skill category. Noise control is assessed via training attributes (`noise_control`, `cleanliness`), not as a top-level skill.

**Practice methodology:** Sub-skill authoring should align with [`knowledge/principles/practice-methodology.md`](../principles/practice-methodology.md) — attention focus, additive learning paths, hands-separate entry points, and troubleshooting guidance inform how drills for each sub-skill are designed.

---

## Sub-skill Documents

### Written

- `string-crossing.md`
- `string-skipping.md`
- `legato.md`
- `bends.md`

### Planned

- `alternate-picking.md`
- `finger-independence.md`
- `fretting-accuracy.md`
- `position-shifting.md`
- `vibrato.md`
- `slides.md`
- `palm-muting.md`
- `fret-hand-muting.md`
- `release-control.md`
- `subdivision-control.md`
- `accent-control.md`

The drill generator loads `knowledge/skills/{sub-skill-with-hyphens}.md` for selected sub-skills that have docs. Missing docs fall back to the taxonomy description.

---

## Document Template

Each skill document must define the following sections:

```markdown
# [Sub-skill Name]

## Definition
What this sub-skill is.

## Why It Matters
The practical importance of this sub-skill in a guitarist's playing.

## Primary Purpose
The core training goal.

## Secondary Benefits
Supporting skills and techniques developed alongside this skill.

## How It Is Measured
The specific, observable output used to track progress.

## Primary Progress Metric
One of: clean_bpm | accuracy_score | timing_consistency | control_score |
        clean_reps | endurance_duration | noise_control | comfort_score

## Supporting Metrics
Additional data points collected but not used as the primary metric.

## Attention Focus
What the player should actively listen for, feel, or notice while practising drills for this sub-skill.

## Additive Learning Path
Typical practiceSteps layering for this sub-skill (e.g. fretting shape → picking pattern → combine slowly → add rhythm → add speed).

## Hands-Separate Entry Points
When fretting-only or picking-only preparation helps before combining (optional — use when isolation reduces overload).

## Troubleshooting
Common breakdown causes (too fast, picking hand, fretting hand, synchronisation, etc.) and typical repair drills or strategies.

## Common Weaknesses
Typical gaps in this skill for intermediate guitarists.

## Common Mistakes
The most frequent technical errors made when practising this skill.

## Coaching Cues
Short, memorable technique reminders for the player.

## Related Drills
Links to drill documents in knowledge/drills/ that develop this skill.

## Progression Path
How a player advances from beginner to mastery in this skill.

## Regression Path
The conditions under which a player should step back to an earlier level.

## Prerequisites
Core skills, sub-skills, or techniques the player should have before prioritising this sub-skill.

## Advanced Techniques Unlocked
What becomes available once this skill reaches a high level.

## Mastery Definition
The specific standard that constitutes mastery of this skill.

## Maintenance Recommendations
How often and at what intensity a mastered skill should be maintained.
```
