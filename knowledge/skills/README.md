# Skill Taxonomy

This directory contains one document per trainable guitar skill.

Each skill document is the authoritative source of expertise for that skill area. The training engine should eventually consume structured data derived from these documents.

---

## Planned Skill Documents

- `alternate-picking.md`
- `synchronisation.md`
- `rhythm.md`
- `legato.md`
- `vibrato.md`
- `bends.md`
- `muting.md`
- `string-crossing.md`
- `string-skipping.md`
- `chord-changes.md`
- `endurance.md`
- `speed.md`
- `fretting-accuracy.md`

---

## Document Template

Each skill document must define the following sections:

```markdown
# [Skill Name]

## Definition
What this skill is.

## Why It Matters
The practical importance of this skill in a guitarist's playing.

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
Skills or techniques the player should have before prioritising this skill.

## Advanced Techniques Unlocked
What becomes available once this skill reaches a high level.

## Mastery Definition
The specific standard that constitutes mastery of this skill.

## Maintenance Recommendations
How often and at what intensity a mastered skill should be maintained.
```
