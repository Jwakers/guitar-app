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

## 3. Source-of-Truth Flow

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

## 4. Drill Brief Format

Before a drill becomes seed data, it should exist as a human-readable drill brief.

Each brief must include:

```md
# Drill Name

## Purpose

## Primary Skill

## Secondary Skills

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

## 5. Required Drill Fields

Every production drill must define:

- title
- slug
- version
- status
- description
- purpose
- primary skill
- secondary skills
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

## 6. Drill Quality Score

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

## 7. Scoring Criteria

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

## 8. Red Flag Rejection List

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
- Its tab pattern violates the primary skill’s boundary (see §8.1).

### 8.1 Skill boundary rules (picking)

When a skill knowledge document is provided, it is authoritative for that skill’s definition and “Not this skill” boundary.

Hard rules for the adjacent vs non-adjacent picking pair:

| Primary skill slug | Allowed string changes in `tabData`                               | Reject if                                                    |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `string_crossing`  | **Adjacent only** (string numbers differ by exactly 1)            | Any note-to-note jump skips a string (\|Δstring\| ≥ 2)       |
| `string_skipping`  | Must include **at least one** non-adjacent jump (\|Δstring\| ≥ 2) | Pattern only uses adjacent changes (that is string crossing) |

Notes:

- String numbers: 1 = high E (thinnest), 6 = low E (thickest).
- Alternate picking may be a secondary skill for either; it does not redefine the primary skill.
- If the brief says “string crossing” but the pattern skips strings, retag to `string_skipping` or redesign the tab — do not keep the wrong primary skill.

### 8.2 Musical variety (library review)

A single chromatic drill is fine when the mechanical goal justifies it.

This is a **library-level** review warning, not an automatic single-drill reject:

> If too many generated drills rely on 1-2-3-4 chromatic movement, the drill set should be reviewed for musical variety.

When generating a candidate that uses chromatic 1-2-3-4 (or similar) without a clear mechanical justification for that material, the generator may include a `redFlags` warning such as “chromatic pattern without clear isolation need — prefer musical fragment if skill allows.”

---

## 9. Validation Layers

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

## 10. Feedback Schema Requirements

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

## 11. Human Playability Review

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

## 12. Production Acceptance Rule

A drill may enter seed data only when all of the following are true:

```txt
Schema validation: pass
Tab validation: pass
Training-value validation: pass
Quality score: 24/30 or higher
Human playability review: pass
Seed object created: yes
Tests added: yes
```

The production seed library should never contain unreviewed generated drills.

---

## 13. First MVP Drill Example

The first accepted candidate drill is:

```txt
Single String Alternate Picking Control
```

Purpose:

```txt
Build clean, repeatable alternate picking on one string before adding string changes or more complex coordination.
```

Primary skill:

```txt
alternate_picking
```

Primary metric:

```txt
clean_bpm
```

This drill is intentionally simple. It exists to validate the core app loop:

```txt
seed drill
→ render tab
→ prescribe session
→ log result
→ update UserExerciseState
→ adapt next session
```

Do not optimise the first drill for novelty. Optimise it for clarity, measurability, and system validation.

---

## 14. Drill Generator Tool Requirements

If building an internal tool that generates drills, it should output:

1. Human-readable drill brief
2. Structured seed object
3. Quality score estimate
4. Red flag warnings
5. Validation status
6. Missing field report
7. Suggested reviewer checklist

The tool should never insert directly into production seed data without review.

The tool should help produce better candidates, not replace human judgement.

---

## 15. Final Principle

A drill is not good because the tab renders.

A drill is good because it creates a measurable training stimulus that helps the player improve.

Rendering proves the data is displayable.

Validation proves the object is well-formed.

Review proves the drill is worth practising.
