# Drill Generation & Validation

## 1. Purpose

This document defines the standard process for creating high-quality guitar drills.

The goal is not to create a large library quickly.

The goal is to create a small number of excellent drills that:

- train a clearly defined skill
- target a specific weakness
- are measurable
- can progress and regress
- include useful coaching
- include valid structured tab data
- support the adaptive training engine

The app should favour 40–80 excellent drills over hundreds of shallow exercises.

The source-of-truth taxonomy is:

```txt
Core Skill -> Sub-skill -> Drill
```

Training attributes are layered onto a core skill or sub-skill. They are not standalone skills.

```ts
type CoreSkill =
  | "picking"
  | "fretting_control"
  | "synchronisation"
  | "rhythm_timing"
  | "lead_articulation"
  | "chord_changes";

type SubSkill =
  | "alternate_picking"
  | "string_crossing"
  | "string_skipping"
  | "finger_independence"
  | "fretting_accuracy"
  | "position_shifting"
  | "legato"
  | "bends"
  | "vibrato"
  | "slides"
  | "subdivision_control"
  | "accent_control"
  | "palm_muting"
  | "fret_hand_muting"
  | "release_control";

type TrainingAttribute =
  | "speed"
  | "endurance"
  | "accuracy"
  | "control"
  | "consistency"
  | "cleanliness"
  | "noise_control";
```

Do not generate drills that classify `speed` or `endurance` as skills. Do not classify techniques such as `alternate_picking`, `string_crossing`, `legato`, `bends`, or `vibrato` as top-level skills; they are sub-skills under a core skill.

**Noise control is not a core skill.** It is a cross-cutting execution quality assessed inside meaningful drills via `trainingAttributes` (`noise_control`, `cleanliness`), optional feedback questions, success criteria, and coaching notes. `palm_muting`, `fret_hand_muting`, and `release_control` are supplementary technique tags — never the only sub-skills on a drill.

### Noise control principle

> Noise control should usually be trained inside meaningful musical or technical context, not as an isolated tab pattern.

Reject or heavily revise drills where:

- the primary skill is noise control
- the drill is just repeated open-string picking
- the tab does not create a meaningful musical or mechanical challenge
- the only training value is “try not to make noise”
- the drill would be better expressed as a success criterion inside another drill

Good uses: alternate picking across strings where unused strings may ring; rhythm riffs with palm muting and rests; chord changes with clean releases; lead articulation where bends/slides must not create excess noise.

Bad uses: dry `0-0-0-0` open-string alternate picking with no rhythmic or palm-muting purpose; two-note patterns where the only instruction is “keep it clean”.

---

## 2. Generation Philosophy

Drills may be drafted by AI, written manually, or produced by an internal generation tool.

However, generated drills are only candidates.

A generated drill must not enter seed data unless it passes:

1. Schema validation
2. Tab data validation
3. Exercise quality validation
4. Training-value scoring
5. Human playability review

AI or automated generation may assist with drafting, but it must not be the final authority.

### Pattern material

Chromatic patterns (including 5-6-7-8 fretting shapes) are acceptable when they are the best fit for the training goal — especially for finger independence, synchronisation, fretting accuracy, warm-ups, or isolated mechanical control.

Chromatic movement must **not** be the default pattern for every drill.

Where two patterns train the skill and target weakness equally well, prefer more musical source material, such as:

- pentatonic patterns
- major/minor scale fragments
- arpeggios
- chord tones
- triads
- double-stops
- simple melodic sequences
- rhythmically musical motifs

Training value still comes first. The drill must serve the target skill and weakness. Musicality is a tie-breaker, not a replacement for mechanical usefulness.

> Drills should be mechanically useful first, but musically meaningful wherever possible.

This does **not** turn the app into a song-learning or theory product. The goal is technical training that feels less sterile while remaining focused, measurable, and progressive.

---

## 3. Pattern Length, Musical Shape & Drill Completeness

Drills should be short enough to practise easily, but not so short that they feel dry, underdeveloped, or mechanically trivial.

A two-note or very small movement pattern is acceptable only when the drill is intentionally a **micro-drill** targeting one highly specific weakness, such as:

* synchronising a single finger change
* isolating a pick stroke problem
* correcting a specific string transition
* testing timing on one repeated movement
* reducing tension in one motion

However, micro-drills should not be the default output.

For most standard drills, prefer a complete musical or mechanical phrase of at least:

* 1–2 bars minimum
* 8–16 notes minimum for picking/synchronisation drills
* a clear loop point
* a recognisable shape, sequence, or motif
* enough movement to make repetition feel purposeful

Where possible, a drill should feel like a focused training phrase rather than a tiny fragment.

Good standard drill sources include:

* pentatonic sequences
* scale fragments
* triads
* arpeggio fragments
* chord-tone patterns
* rhythmic motifs
* repeated melodic cells
* call-and-response style phrases
* small position-based sequences

The drill should still prioritise the target skill. Do not make the pattern more musical if doing so weakens the training purpose.

> Use the smallest pattern that fully trains the weakness — but no smaller.

### Drill Type Classification

Each generated drill should declare one of these pattern types:

```ts
patternType:
  | "micro_drill"
  | "standard_loop"
  | "musical_sequence"
  | "benchmark"
```

Definitions:

#### micro_drill

A very small pattern, often 2–6 notes, used only for highly specific mechanical isolation.

Must explain why such a short pattern is justified.

#### standard_loop

A compact repeatable drill, usually 1–2 bars, designed for daily technical practice.

This should be the default for most MVP drills.

#### musical_sequence

A drill based on a more musical fragment, such as a pentatonic phrase, scale sequence, triad, arpeggio, or chord-tone idea.

Use when the skill can be trained without relying on sterile chromatic movement.

#### benchmark

A drill designed primarily to test progress. It should be measurable, repeatable, and slightly broader than a micro-drill.

### Short Drill Warning

If a generated drill contains fewer than 8 notes, the generator must include a warning:

```txt
Short pattern warning: this drill is very small. Confirm it is intentionally a micro-drill and not an underdeveloped standard drill.
```

### Rejection / Revision Rule

Mark a drill for revision if:

* it is only 2–4 notes long
* it is not explicitly labelled as a micro-drill
* it does not explain why the short pattern is necessary
* it could be expanded into a more musical loop without losing the training purpose
* it feels like a placeholder rather than a complete practice item

### Final Principle

A drill does not need to be long, but it should feel complete.

Short is good when it creates focus.

Short is bad when it feels unfinished.

---

## 4. Source-of-Truth Flow

Use this flow:

```txt
Knowledge Document
        ↓
Drill Brief
        ↓
Generated Candidate
        ↓
Validation
        ↓
Human Review
        ↓
Seed Data
        ↓
Convex Exercise Row
```

A drill should be traceable back to a knowledge document or skill taxonomy entry.

---

## 5. Drill Brief Format

Before a drill becomes seed data, it should exist as a human-readable drill brief.

Each brief must include:

```md
# Drill Name

## Purpose

## Core Skill

## Sub-skills

## Training Attributes

## Target Weakness

## Difficulty

## Exercise Type

## Primary Progress Metric

## Why This Drill Exists

## Tab / Pattern Description

## Instructions

## Success Criteria

## Common Mistakes

## Measurement Instructions

## Minimum Clean Standard

## Progression Rule

## Regression Rule

## Feedback Questions

## Reviewer Notes
```

The brief is for understanding and review. The seed object is for runtime use.

---

## 6. Required Drill Fields

Every production drill must define:

- title
- slug
- version
- status
- description
- purpose
- core skill
- sub-skills
- training attributes
- target weaknesses
- difficulty level
- exercise type
- primary progress metric
- BPM support
- default target BPM where relevant
- minimum clean standard
- measurement instructions
- success criteria
- common mistakes
- coaching notes
- progression rule
- regression rule
- feedback schema
- structured tab data
- estimated minutes
- MVP flag

A drill missing any required training-quality field should be rejected even if TypeScript accepts it.

---

## 7. Drill Quality Score

Every candidate drill should be scored out of 30.

| Category                       | Max Score |
| ------------------------------ | --------: |
| Clear training purpose         |         5 |
| Measurable outcome             |         5 |
| Mechanical usefulness          |         5 |
| Appropriate difficulty         |         5 |
| Progression/regression quality |         5 |
| Coaching quality               |         5 |

Thresholds:

```txt
26–30: strong candidate
21–25: usable after refinement
16–20: weak, needs redesign
0–15: reject
```

A drill should not be seeded unless it scores at least 24/30.

For the initial MVP library, aim for 26+ wherever possible.

---

## 8. Scoring Criteria

### Clear Training Purpose

Score highly when:

- the drill trains one obvious thing
- the purpose is specific
- the target weakness is clear
- the drill is not just a random finger pattern

Reject if:

- the purpose is vague
- the drill could mean anything
- the drill exists only because it looks like guitar practice

---

### Measurable Outcome

Score highly when:

- the primary metric is obvious
- the user knows what to log
- progress can be compared over time
- the metric helps the training engine make decisions

Reject if:

- there is no clear way to measure improvement
- the user must guess whether they improved
- the metric does not match the drill purpose

---

### Mechanical Usefulness

Score highly when:

- the movement trains the stated skill
- the tab pattern matches the purpose
- the drill isolates a useful technical demand
- the drill would likely improve the target weakness over time
- the pattern material fits the skill and avoids defaulting to sterile chromatic motion when a musical fragment would train the same weakness

Reject if:

- the tab does not actually train the claimed skill
- it is just a musical lick with no training logic
- it is unnecessarily awkward or risky

Mark for review (soft — not an automatic hard reject) when:

- the pattern is chromatic **and** the stated purpose does not clearly require chromatic isolation (e.g. finger independence, synchronisation, fretting accuracy, warm-up, or pure mechanical control)

---

### Appropriate Difficulty

Score highly when:

- the drill suits intermediate electric guitarists
- the difficulty rating is plausible
- the drill can be slowed down
- the drill has room to progress

Reject if:

- it is too easy to be useful
- it is too advanced for MVP
- it requires unavailable prerequisite skills
- it is likely to frustrate more than train

---

### Progression / Regression Quality

Score highly when:

- the drill has clear progression conditions
- the drill has clear regression conditions
- progression is based on repeatable performance, not one lucky attempt
- regression handles poor performance without punishment

Reject if:

- progression is simply “play faster”
- there is no regression path
- the rule ignores Training Verdict, confidence, or cleanliness

---

### Coaching Quality

Score highly when:

- coaching notes are practical
- common mistakes are realistic
- the user knows what to listen or feel for
- advice is concise enough to show in the app

Reject if:

- coaching is generic
- notes are too long
- advice does not relate to the drill
- the drill requires a video to understand

---

## 9. Red Flag Rejection List

Reject a drill immediately if any of these are true:

- It is just a random pattern.
- It has no clear training purpose.
- It does not target a specific weakness.
- It has no measurable outcome.
- It is basically a song riff.
- It requires theory knowledge to understand.
- It is too complex to explain quickly.
- Its tab data does not match the stated purpose.
- It cannot progress.
- It cannot regress.
- It asks the user to log too much.
- It is ergonomically risky.
- It requires video explanation for MVP.
- It does not suit electric guitar.
- It does not suit the MVP target user.
- Its tab pattern violates the declared sub-skill boundary (see §9.1).

### 9.1 Sub-skill boundary rules (picking)

When a sub-skill knowledge document is provided, it is authoritative for that sub-skill’s definition and “Not this skill” boundary.

Hard rules for the adjacent vs non-adjacent picking pair:

| Sub-skill ID       | Allowed string changes in `tabData`                               | Reject if                                                    |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `string_crossing`  | **Adjacent only** (string numbers differ by exactly 1)            | Any note-to-note jump skips a string (\|Δstring\| ≥ 2)       |
| `string_skipping`  | Must include **at least one** non-adjacent jump (\|Δstring\| ≥ 2) | Pattern only uses adjacent changes (that is string crossing) |

Notes:

- String numbers: 1 = high E (thinnest), 6 = low E (thickest).
- Alternate picking can be another `picking` sub-skill, but it does not override the string movement boundary.
- If the brief says “string crossing” but the pattern skips strings, retag to `string_skipping` or redesign the tab — do not keep the wrong sub-skill.

### 9.2 Lead articulation in musical context

Vibrato, bends, and legato should usually be trained in musical context.

Avoid generating full drills like:

```txt
7~~~~ 7~~~~
```

unless the drill is explicitly a `micro_drill` or `benchmark`.

Prefer drills like:

```txt
pentatonic phrase -> bend -> hold -> vibrato
```

or:

```txt
legato fragment -> target note -> controlled vibrato
```

The goal is still technical development, not song learning or theory teaching.

### 9.3 Musical variety (library review)

A single chromatic drill is fine when the mechanical goal justifies it.

This is a **library-level** review warning, not an automatic single-drill reject:

> If too many generated drills rely on 1-2-3-4 chromatic movement, the drill set should be reviewed for musical variety.

When generating a candidate that uses chromatic 1-2-3-4 (or similar) without a clear mechanical justification for that material, the generator may include a `redFlags` warning such as “chromatic pattern without clear isolation need — prefer musical fragment if skill allows.”

---

## 10. Validation Layers

A drill must pass three kinds of validation.

### 1. Schema Validation

The object conforms to the TypeScript and Convex schema.

Examples:

- required fields exist
- field values use valid enums
- arrays are not empty where required
- difficulty is within range
- status is valid
- version exists

### 2. Tab Data Validation

The `tabData` object is structurally valid.

Examples:

- tuning is valid
- string numbers are valid
- fret numbers are valid
- beat durations are valid
- bars contain beats
- notes belong to valid strings
- loop hints reference valid bars

#### Bends, target pitch, and fingering

Bend notes must set `technique: "bend"` and a correct `targetPitch` (octave-qualified preferred, e.g. `"G4"`).

The AlphaTab adapter infers bend amount from fretted pitch → `targetPitch` and emits AlphaTeX quarter-tones:

- `2` = half step (renders as `1/2`)
- `4` = whole step (renders as `full`)

Bend notes without a valid `targetPitch` fail tab validation and must not be rendered — the adapter throws rather than defaulting to a whole step.

Do not rely on tab fingering glyphs. The AlphaTab adapter never emits left-hand fingering (`lf`), even when `note.finger` or `displayHints.showFingering` is set — finger numbers collide with bend tip labels and are too prescriptive. Put finger guidance in coaching notes or the description instead. Optional `note.finger` may still be stored for future use, but it is not rendered.

### 3. Training-Value Validation

The drill is worth practising.

Examples:

- purpose matches the tab
- metric matches the purpose
- success criteria are observable
- mistakes are realistic
- progression/regression rules are meaningful
- feedback schema captures enough useful data without burdening the user

Passing schema validation alone is not enough.

---

## 11. Feedback Schema Requirements

Each drill must define a feedback schema that collects the minimum data needed to make the next training decision.

Most drills should include:

- objective result, such as clean BPM, reps, duration, or score
- Training Verdict
- one or two relevant subjective questions
- optional follow-up only when useful

Do not ask every question for every drill.

Feedback must be dynamic and drill-specific.

Example for BPM-based alternate picking:

```ts
feedbackSchema: [
  {
    id: "actual_bpm",
    label: "Clean BPM",
    type: "number",
    required: true,
  },
  {
    id: "training_verdict",
    label: "Training Verdict",
    type: "segmented",
    required: true,
    options: [
      { id: "nailed_it", label: "Nailed It" },
      { id: "nearly_there", label: "Nearly There" },
      { id: "needs_work", label: "Needs Work" },
    ],
  },
  {
    id: "difficulty",
    label: "Difficulty",
    type: "segmented",
    required: true,
    options: [
      { id: "easy", label: "Easy" },
      { id: "good", label: "Good" },
      { id: "hard", label: "Hard" },
      { id: "impossible", label: "Impossible" },
    ],
  },
];
```

---

## 12. Human Playability Review

Before seeding a drill, a human should play or inspect it.

The reviewer should answer:

- Can the drill be explained in one sentence?
- Can it be played slowly?
- Is the movement mechanically sensible?
- Does it train the stated skill?
- Does the tab match the purpose?
- Is the measurement obvious?
- Would practising this for two weeks improve the stated weakness?
- Is anything painful, awkward, or unclear?
- Is this suitable for an intermediate electric guitarist?

If the reviewer cannot confidently answer these questions, the drill should be revised before seeding.

---

## 13. Production Acceptance Rule

A drill may enter the production exercise library only when all of the following are true:

```txt
Schema validation: pass
Tab validation: pass
Training-value validation: pass
Quality score: 24/30 or higher
Human playability review: pass
Saved to dev Convex: yes
Knowledge doc authored: yes
```

The production library should never contain unreviewed generated drills. Promotion from dev → prod uses `pnpm migrate:exercises` (see [`docs/exercise-migration.md`](../../docs/exercise-migration.md)).

---

## 14. First MVP Drill Example

The first accepted candidate drill is:

```txt
Single String Alternate Picking Control
```

Purpose:

```txt
Build clean, repeatable alternate picking on one string before adding string changes or more complex coordination.
```

Core skill / sub-skill:

```txt
picking / alternate_picking
```

Primary metric:

```txt
clean_bpm
```

This drill is intentionally simple. It exists to validate the core app loop:

```txt
author drill in dev
→ render tab
→ prescribe session
→ log result
→ update UserExerciseState
→ adapt next session
```

Do not optimise the first drill for novelty. Optimise it for clarity, measurability, and system validation.

---

## 15. Drill Generator Tool Requirements

If building an internal tool that generates drills, it should output:

1. Human-readable drill brief
2. Structured exercise object (saved to dev Convex)
3. Quality score estimate
4. Pattern type (`micro_drill` | `standard_loop` | `musical_sequence` | `benchmark`)
5. Red flag warnings (including short-pattern warnings from §3 when applicable)
6. Validation status
7. Missing field report
8. Suggested reviewer checklist

The tool saves candidates to the dev deployment only. Production promotion requires human review and `pnpm migrate:exercises`.

The tool should help produce better candidates, not replace human judgement.

---

## 16. Final Principle

A drill is not good because the tab renders.

A drill is good because it creates a measurable training stimulus that helps the player improve.

Rendering proves the data is displayable.

Validation proves the object is well-formed.

Review proves the drill is worth practising.
