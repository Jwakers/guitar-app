# Evidence-Informed Practice Methodology

This document is the **source of truth** for how GTPL thinks about effective guitar practice.

It guides future development across the training engine, drill generator, feedback system, onboarding, session design, progress tracking, and monthly reviews.

**Related documents:**

- [`product-principles.md`](./product-principles.md) — philosophical foundation
- [`docs/technical-spec.md`](../../docs/technical-spec.md) — Exercise Selection Engine, feedback architecture, exercise schema
- [`knowledge/drills/drill-generation-and-validation.md`](../drills/drill-generation-and-validation.md) — drill authoring and validation
- [`knowledge/whitepapers/README.md`](../whitepapers/README.md) — long-form design artefacts (including planned `practice-methodology.md` whitepaper)

---

## Framing

GTPL is a **progressive guitar training platform**, not a lesson app.

> The app should think so the guitarist can practise.

This methodology is **evidence-informed practice design**. It draws on deliberate practice, motor learning, and sports-training principles where they apply to musical skill acquisition. It does **not** claim guaranteed neuroscience optimisation, clinical outcomes, or medical benefits. Avoid overclaiming in product copy, marketing, and feature descriptions.

---

## 1. Avoid Masked Practice

**Masked practice** is repeating the same material mindlessly while attention drops — playing on autopilot without listening, correcting, or making decisions.

The app should discourage long, passive repetition where the user is no longer actively engaged.

The app should favour:

- short focused drills
- clear targets
- measurable outcomes
- deliberate feedback
- variation when useful
- focused troubleshooting

> Repetition is only useful when attention, intent, and feedback remain active.

**Distinction:** Active repetition (consolidation after `nearly_there`, benchmark sessions, deliberate mastery work) is valuable. Masked practice is not. The training engine should repeat exercises when consolidation requires it, but must not prescribe long unbroken blocks of the same movement without variation or attention cues.

---

## 2. Use Interleaved Practice

The app should avoid creating sessions where the user repeats one technical idea for too long without variation.

Session generation should prefer rotating between related but distinct demands.

Example rotation:

```txt
Picking accuracy
→ Rhythm timing
→ Picking with string crossing
→ Fretting synchronisation
→ Benchmark
```

This forces recall and re-engagement rather than passive repetition.

**Training engine guidance:**

- Do not over-prescribe one drill for an entire session.
- Rotate between complementary drills in short blocks.
- Avoid excessive back-to-back drills that train the exact same movement unless the session is explicitly a focused micro-session.
- Use interleaving especially in standard and weekly sessions.
- Use blocked practice only when the user is first learning or repairing a specific movement.

---

## 3. Short, Focused Practice Chunks

The app should treat 15–20 minute focused blocks as highly valuable.

Do not assume longer sessions are always better.

Session generation should support:

```txt
10 minute quick session
15 minute focused session
20 minute focused session
30 minute standard session
45 minute extended session
```

For longer sessions, use internal sections rather than one long block.

Example:

```txt
45 minute session =
  10 min warm-up/control
  15 min primary focus
  10 min interleaved support work
  5 min benchmark
  5 min reflection/logging
```

> The app should optimise for quality of attention, not just practice duration.

---

## 4. Practice at the Edge

The app should aim to prescribe work near the player's current ability.

**Avoid:**

- drills that are too easy
- drills that are impossible
- constant comfort-zone repetition
- sudden unrealistic jumps

Use the existing **Reliable Performance**, **Training Verdict**, and **UserExerciseState** concepts to target the edge of ability.

**Ideal zone:**

```txt
Challenging but repeatable.
Uncomfortable but not chaotic.
Difficult enough to require attention.
Controlled enough to produce clean reps.
```

Training targets should usually be based slightly above Reliable Performance, not Peak Performance.

**Progression logic:**

| Difficulty | Training Verdict | Engine signal |
|---|---|---|
| Easy | Nailed It | progression may be needed |
| Good / Challenging | Nailed It | ideal growth zone |
| Hard | Nearly There | useful but monitor |
| Impossible | Needs Work | target probably too high or drill unsuitable |

---

## 5. Additive / Chunked Learning

The app should support the additive approach.

Instead of asking the player to perform a full difficult pattern immediately, drills and progression paths should be able to build in layers.

Example:

```txt
Step 1: fretting shape only
Step 2: picking pattern only
Step 3: combine slowly
Step 4: add rhythm
Step 5: add speed or complexity
```

Complex drills may include optional `practiceSteps` in the exercise schema:

```ts
type PracticeStep = {
  title: string;
  instruction: string;
  focus: "fretting" | "picking" | "rhythm" | "combined" | "listening" | "mental";
  estimatedMinutes?: number;
};
```

Use especially for:

- synchronisation
- string crossing
- chord changes
- lead articulation
- rhythm timing
- difficult picking patterns

---

## 6. Hands-Separate Practice

For technically demanding drills, the app should sometimes separate the hands before combining them.

Examples:

- fretting hand shape alone
- picking pattern on muted strings
- rhythm pattern without fretting complexity
- left-hand movement without tempo pressure
- combined version after isolated preparation

A drill may include optional `handsSeparateMode` when useful:

```ts
type HandsSeparateMode = {
  frettingOnly?: string;
  pickingOnly?: string;
  combined?: string;
};
```

This is not mandatory for every drill. Use it when it meaningfully improves clarity or reduces overload.

---

## 7. Targeted Troubleshooting

When the user fails, the app should not simply say "try again".

The app should identify the likely failure point and prescribe a smaller repair action.

If the user logs **Needs Work** or **Impossible**, ask a lightweight follow-up when useful:

```txt
What broke down?
- Too fast
- Picking hand
- Fretting hand
- Synchronisation
- Rhythm / timing
- Tension / fatigue
- Didn't understand
```

The system should then respond with a repair strategy:

```txt
Reduce target BPM
Repeat same drill
Switch to hands-separate version
Use a smaller chunk
Prescribe prerequisite drill
Turn the next session into a light/control session
```

> Mistakes should generate information, not punishment.

---

## 8. Practice Journal Built Into the App

The app itself should function as a practice journal.

The user should not need to decide from scratch what to practise.

The journal should track:

- what was planned
- what was completed
- what was difficult
- what improved
- what broke down
- what the app changed next

> The app plans practice before the player starts, then turns results into the next plan.

Avoid long written journal fields. Prefer structured logging, optional notes, and monthly/weekly summaries.

---

## 9. Mental Practice and Auditory Imagination

The app should eventually support light mental practice prompts.

This is not theory teaching and should not become a separate curriculum.

Examples:

- "Before playing, look at the tab and imagine the sound."
- "Hum the phrase once before playing."
- "Visualise the fretting movement before starting."
- "Say the rhythm out loud before playing."
- "Tap the rhythm before adding notes."

Optional drill field:

```ts
mentalCue?: string;
```

Use sparingly. Especially useful for:

- rhythm timing
- bends
- vibrato
- lead articulation
- phrasing-style drills
- chord changes

---

## 10. Sing / Hum Before Playing

Where musically appropriate, especially for lead articulation and rhythm drills, the app may ask the player to hum, sing, or internally hear the phrase before playing it.

This should be optional and lightweight.

Do not use this for purely mechanical micro-drills unless it adds value.

**Guidance:**

- Use for musical sequences.
- Use for bends and vibrato where target pitch matters.
- Use for rhythm motifs.
- Do not force it on every drill.

---

## Training Engine Implications

These rules apply to session generation in [`docs/technical-spec.md`](../../docs/technical-spec.md) (Exercise Selection Engine).

### Interleaving rule

Standard sessions should usually interleave related skills rather than repeat the same exact demand for too long.

**Primary focus: picking**

Good:

```txt
- picking control
- rhythm timing
- string crossing
- picking benchmark
```

Poor:

```txt
- single-string picking
- single-string picking variation
- single-string picking speed
- single-string picking endurance
```

### Edge-of-ability rule

Targets should aim for the productive challenge zone.

**Use:**

```txt
Reliable Performance + small progression
```

**Avoid:**

```txt
Peak Performance + aggressive progression
```

### Troubleshooting rule

If recent logs show repeated failure, the next prescription should usually become smaller, clearer, or more isolated.

Examples:

- reduce BPM
- shorten pattern
- switch to micro-drill
- use hands-separate step
- prescribe prerequisite drill
- lower intensity
- provide extra coaching

### Attention rule

If a session is long, split it into focused chunks.

Do not create long unbroken repetitions of the same movement.

---

## Drill Authoring Implications

See [`knowledge/drills/drill-generation-and-validation.md`](../drills/drill-generation-and-validation.md) for full authoring rules.

### Optional exercise fields

```ts
type Exercise = {
  // existing fields...

  patternType:
    | "micro_drill"
    | "standard_loop"
    | "musical_sequence"
    | "benchmark";

  practiceSteps?: PracticeStep[];
  handsSeparateMode?: HandsSeparateMode;
  mentalCue?: string;
  attentionFocus?: string;
  troubleshootingPrompts?: TroubleshootingPrompt[];
};

type TroubleshootingPrompt = {
  trigger:
    | "needs_work"
    | "impossible"
    | "low_confidence"
    | "timing_breakdown"
    | "tension_reported";
  response: string;
};
```

These fields are optional — not every drill needs them. Use when they improve practice quality. Not yet required for MVP schema validation.

### Required brief section: Attention Focus

Every drill brief must answer:

```txt
What should the player actively pay attention to while practising this drill?
```

Examples:

```txt
Listen for even note spacing.
Notice whether the picking hand tenses after the string change.
Focus on whether the bend reaches pitch before vibrato starts.
Feel whether the fretting hand releases cleanly between chords.
```

### Reject or revise drills that:

- encourage mindless repetition
- have no clear attention focus
- are too short without being justified as micro-drills
- are too long without chunking
- have no troubleshooting path
- do not explain what the user should notice

### Generation questions

Before accepting a drill, ask:

- Is this drill too repetitive?
- Does it encourage active attention?
- Could it benefit from a musical phrase instead of a sterile fragment?
- Is it best learned additively?
- Would hands-separate practice help?
- Does it sit at the edge of ability?
- What should the user listen or feel for?
- What should happen if the user fails?
- Is this a micro-drill, standard loop, musical sequence, or benchmark?

---

## Feedback Implications

When a user logs poor performance, collect one lightweight cause when useful.

Example `breakdown_cause` question (triggered only by poor verdicts or Impossible difficulty, not every time):

```ts
{
  id: "breakdown_cause",
  label: "What broke down?",
  type: "choice",
  required: false,
  options: [
    { id: "too_fast", label: "Too fast" },
    { id: "picking_hand", label: "Picking hand" },
    { id: "fretting_hand", label: "Fretting hand" },
    { id: "synchronisation", label: "Synchronisation" },
    { id: "rhythm_timing", label: "Rhythm / timing" },
    { id: "tension", label: "Tension / fatigue" },
    { id: "unclear", label: "Didn't understand" }
  ]
}
```

**Repair strategy mapping:**

| Breakdown cause | Typical engine response |
|---|---|
| too_fast | Reduce target BPM |
| picking_hand | Hands-separate picking step or prerequisite drill |
| fretting_hand | Hands-separate fretting step or smaller chunk |
| synchronisation | Additive practice steps; reduce tempo |
| rhythm_timing | Rhythm isolation drill; mental cue |
| tension | Light/control session; reduce intensity |
| unclear | Extra coaching notes; prerequisite drill |

---

## Product Copy Principles

**Prefer:**

- "Let's isolate the weak point."
- "Today's target sits just above your reliable level."
- "We'll reduce the pattern and rebuild it cleanly."
- "This session is short by design."
- "You are training accuracy before speed."

**Avoid:**

- "You failed."
- "You lost progress."
- "Just repeat until clean."
- "Play this 100 times."
- "No pain no gain."

---

## Final Principle

> The app should not simply generate things to repeat. It should generate focused training conditions that keep the player attentive, challenged, and able to correct the right thing.

This methodology should influence future development across the training engine, drill generator, feedback system, onboarding, progress tracking, and monthly reviews.
