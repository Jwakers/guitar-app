# Legato

## Definition

Legato is smooth note connection on a **single string** using hammer-ons, pull-offs, and slides — without re-picking each note. Hammer-ons ascend to a higher fret; pull-offs descend to a lower or open fret; slides move along the same string between frets.

Legato does **not** connect notes across different strings. A string change requires a new pick attack unless an explicitly supported advanced technique applies (none in MVP).

## Not This Skill

Do **not** mark string changes as hammer-ons or pull-offs.

| Pattern | Valid? |
| --- | --- |
| `e\|--5h7--` (same string, ascending) | **Yes** — hammer-on |
| `e\|--7p5--` or `e\|--7p0--` (same string, descending) | **Yes** — pull-off |
| `e\|--5--` then `B\|--7h--` (different strings) | **No** — cross-string legato |
| Descending phrase across strings with pull-off markings | **No** — string changes are picked |

Hammer-ons from nowhere (no prior note on the same string) are advanced and out of MVP scope. If ever supported, they require an explicit separate technique value (`hammer_on_from_nowhere`) — never silent interpretation of cross-string hammer-ons.

## Why It Matters

Legato phrasing shapes melody, reduces pick noise, and builds left-hand independence and endurance. Invalid legato notation trains the wrong physical motion and produces misleading tab playback.

## Primary Purpose

Train even, controlled hammer-ons and pull-offs with consistent volume and timing on same-string fragments.

## Secondary Benefits

- Left-hand finger independence and strength
- Smoother phrasing in scales and melodic lines
- Foundation for trills and faster legato runs
- Reduced pick attack noise in melodic passages

## How It Is Measured

Highest repeatable clean BPM (or control score at a fixed BPM) on a legato pattern with valid same-string articulation markings.

## Primary Progress Metric

`clean_bpm`

## Supporting Metrics

- Evenness of volume between hammered and pulled notes
- Training Verdict
- Noise control / cleanliness

## Attention Focus

Listen for equal volume between picked, hammered, and pulled notes. Feel minimal excess finger motion — hammer with the tip of the finger; pull with a slight downward flick.

## Additive Learning Path

1. Two-note hammer-on on one string (e.g. 5h7), slow quarter notes
2. Two-note pull-off on one string (e.g. 7p5), slow quarter notes
3. Hammer-pull combinations (5h7p5) on one string
4. Short melodic fragments with picked string changes between legato groups
5. Faster subdivisions and longer loops at stable tempo

## Regression Path

Step back when notes are uneven, pulled notes are weak, or hammer-ons are buzzy. Reduce BPM and simplify to a two-note same-string pattern.

## Prerequisites

- Comfortable fretting with clear note separation
- Basic picking on single strings

## Advanced Techniques Unlocked

- Trills and faster legato runs
- Melodic legato lines across multiple strings (picked changes, legato within each string group)
- Integration with bends and vibrato on target notes

## Mastery Definition

Same-string hammer-ons and pull-offs at performance tempos with even tone, locked timing, and no excess left-hand motion — repeatable across sessions.

## Maintenance Recommendations

Short legato loops 1–2× per week at a comfortable clean BPM once mastered.

## Tab Authoring Rules

Use `articulationFromPrevious` on the destination note — not `technique`:

```json
{ "string": 1, "fret": 5 }
{ "string": 1, "fret": 7, "articulationFromPrevious": "hammer_on" }
{ "string": 1, "fret": 5, "articulationFromPrevious": "pull_off" }
```

Good musical-context example:

```txt
e|--5h7p5-----5h8p5-----|
B|--------8---------8---|
```

Only same-string movements are marked legato. String changes on the B string are picked.

Bad example (reject):

```txt
e|--5h8--
B|------7p5--
```

This example is invalid because the hammer-on and pull-off markings imply a cross-string legato connection instead of separate picked string changes.

## Common Mistakes

- Marking every descending note as pull-off across string changes
- Hammer-on from lower fret to higher fret on wrong string context
- Uneven volume on pulled notes
- Excess finger height after pull-offs

## Common Weaknesses

- Weak pull-offs (notes dying out)
- Hammer-ons that buzz or miss cleanly
- Timing drift in hammer-pull combinations
- Confusing legato with simply playing notes in sequence
