# TODO

This file tracks outstanding product design and knowledge authoring tasks.

For engineering implementation tasks, use the project issue tracker or `PROGRESS.md`.

---

## High Priority

### Rating & Progression White Paper

**File:** `knowledge/whitepapers/rating-and-progression.md`

This is the first whitepaper to author. It underpins the skill rating system, reliable performance model, training verdict definitions, and all progression and regression rules implemented by the exercise selection engine.

This document should be written manually as part of product design. It represents core intellectual property and should be treated as a foundational design artefact. Do not auto-generate it.

**Topics to cover:**

- Skill ratings — how they are defined, scaled, and updated
- Reliable Performance — definition and how it is calculated from logs
- Peak Performance — definition, how it differs from Reliable Performance, and when it is surfaced
- Confidence — definition, how it is inferred from Training Verdicts and log history
- Training Verdicts — Nailed It / Nearly There / Needs Work — how they feed back into the rating model
- Exercise progression — the conditions under which the engine advances an exercise
- Exercise regression — the conditions under which the engine steps an exercise back
- Skill confidence decay — how ratings are affected by inactivity or missed sessions
- Weighting of recent sessions — how recency is factored into rolling performance calculations
- Long-term progression philosophy — the principles that govern how a player develops over months, not days

**Acceptance criteria:**

A developer implementing `lib/training-engine/scoring.ts` and `lib/training-engine/progression.ts` should be able to read this document and understand precisely what they are building and why.

---

### Practice Methodology White Paper

**File:** `knowledge/whitepapers/practice-methodology.md`

Write this manually as part of product design. It represents core intellectual property. Do not auto-generate it.

The operational source of truth is [`knowledge/principles/practice-methodology.md`](knowledge/principles/practice-methodology.md). This whitepaper expands that document into long-form design IP.

**Topics to cover:**

- Interleaved practice
- Blocked practice vs interleaved practice
- Edge-of-ability training
- Chunking and additive learning
- Hands-separate practice
- Targeted troubleshooting
- Practice journaling
- Mental rehearsal
- Singing/humming before playing
- Avoiding overclaims about neuroscience

**Acceptance criteria:**

A developer implementing session generation, drill authoring, or feedback follow-ups should be able to read this document and understand the *why* behind evidence-informed practice design — not just the rules in the principles doc.
