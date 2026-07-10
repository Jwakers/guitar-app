# Bends

## Definition

Bends raise a fretted note to a higher pitch by pushing or pulling the string. For MVP drills, only **half-step** (1 semitone) and **whole-step** (2 semitone) bends are supported.

Bend amount is stored as `technique: "bend"` with an octave-qualified `targetPitch` — the adapter infers interval from fretted pitch → target.

## Not This Skill

Do **not** author minor thirds, perfect fourths, or multi-semitone bends. Do **not** guess pitch names without calculating the interval from the fretted note.

| Fretted (std tuning) | Valid half-step target | Valid whole-step target | Invalid |
| --- | --- | --- | --- |
| B string fret 7 (F#4) | `G4` | `G#4` | `A4` (minor 3rd) |
| G string fret 5 (C4) | `C#4` | `D4` | `E4` (major 3rd) |

Wrong octave on `targetPitch` is a common generator failure — e.g. `G6` from F#4 implies an impossible interval.

## Why It Matters

Accurate half- and whole-step bends are the foundation of blues and rock phrasing, intonation, and call-and-response lines. Training with absurd bend intervals teaches the wrong physical motion and produces misleading tab playback.

## Primary Purpose

Train pitch-accurate half- and whole-step bends with controlled attack, steady pressure, and reliable target pitch.

## Secondary Benefits

- Left-hand strength and control
- Ear training for common melodic intervals
- Foundation for bends into vibrato and releases
- Expressive phrasing in pentatonic and blues vocabulary

## How It Is Measured

Highest repeatable clean BPM (or accuracy/control score at fixed BPM) on a pattern where bends consistently reach the written `targetPitch`.

## Primary Progress Metric

`accuracy_score` or `clean_bpm` depending on drill design

## Supporting Metrics

- Training Verdict
- Pitch accuracy self-rating
- Control / cleanliness

## Attention Focus

Listen for the bend reaching the target pitch before release or vibrato. Feel even pressure — not a sudden jerk. Match the written half or whole step exactly.

## Additive Learning Path

1. Single half-step bend, slow quarter notes, hold at pitch
2. Single whole-step bend, slow quarter notes
3. Bend → hold → release or vibrato on target note
4. Short melodic phrase with alternating half/whole bends
5. Tempo increase while maintaining pitch accuracy

## Regression Path

Step back when bends fall short of pitch, overshoot, or waver. Reduce BPM and return to isolated half-step bends on one fret.

## Prerequisites

- Comfortable fretting and single-note picking
- Basic pitch awareness on one string

## Advanced Techniques Unlocked

- Pre-bends and releases
- Bend into vibrato
- Multi-note phrases combining bends with legato and slides

## Mastery Definition

Half- and whole-step bends at performance tempos with consistent pitch, tone, and control — repeatable across sessions.

## Maintenance Recommendations

Short bend accuracy checks 1–2× per week at comfortable tempo once mastered.

## Tab Authoring Rules

```json
{ "string": 2, "fret": 7, "technique": "bend", "targetPitch": "G4" }
```

- `targetPitch` must be **octave-qualified** (e.g. `"G4"`, not `"G"`)
- Interval from fretted note to target must be **exactly 1 or 2 semitones**
- AlphaTeX renders: 1 semitone → `1/2`, 2 semitones → `full`

Hard rejection at validation:

```txt
Invalid bend: only half-step and whole-step bends are supported.
```

## Common Mistakes

- Wrong octave producing huge implied bends
- Minor third or larger interval labeled as bend
- Bending without reaching target pitch before vibrato
- Inconsistent bend speed (rushing the pitch)

## Common Weaknesses

- Bends falling flat (under-pitch)
- Overshooting whole-step bends
- Weak tone during bend
- Difficulty hearing target pitch
