# Product Principles

This document is the philosophical foundation of the guitar training platform.

It is required reading before implementing significant product features.

---

## North Star

> Become the trusted training companion every guitarist opens before they practise.

---

## Mission

> The app should think so the guitarist can practise.

---

## Product Test

> If a feature doesn't help a guitarist practise better, measure progress more accurately, or build long-term consistency, it probably doesn't belong in the product.

---

## Core Principles

**Train, don't teach.**
The app prescribes structured training, not lessons. It assumes the user already plays guitar. The role of the app is to direct focused practice, not deliver music education.

**Measure what matters.**
Every session should produce at least one piece of useful, measurable data. Collecting data that doesn't drive future training decisions is friction without value.

**Progressive overload over static repetition.**
Repeating the same exercise at the same difficulty level indefinitely does not produce improvement. The engine must identify when to progress, hold, or regress — and act accordingly. Targets should be set from **Reliable Performance** with small, repeatable steps — not from peak scores or aggressive jumps. See [Practice at the Edge](./practice-methodology.md#4-practice-at-the-edge) in the practice methodology.

**Respect the player's time.**
The user's most limited resource is practice time. Every interaction — logging, navigation, feedback — should be as fast as possible. The app earns trust by respecting the session, not by demanding attention.

**Earn trust through deterministic, explainable recommendations.**
The training engine must produce recommendations that a thoughtful musician would recognise as sensible. If the app cannot explain why it prescribed a session, the session should not be prescribed.

**Hide taxonomy complexity from the player.**
The internal model is Core Skill → Sub-skill → Drill with training attributes layered on top. That structure exists so the app can make better practice decisions; user-facing copy should stay simple unless the extra detail helps the guitarist practise. Noise control is assessed inside real movement drills — it is not a standalone skill bucket.

**Focused attention over mindless repetition.**
The app must not prescribe long passive repetition where attention drops. Short, deliberate blocks with clear targets and feedback beat volume for its own sake. See [Avoid Masked Practice](./practice-methodology.md#1-avoid-masked-practice).

**Built-in practice journal.**
The app plans practice before the player starts, then turns results into the next plan. Structured logging and summaries replace blank notebooks — the user should not need to decide from scratch what to practise each day.

**Mistakes as information.**
Poor performance should trigger troubleshooting and adaptation, not punishment. Failures produce data that improves the next prescription.

---

## Evidence-Informed Practice Design

GTPL applies **evidence-informed practice design** — deliberate practice, interleaved training, chunking, edge-of-ability targeting, and targeted troubleshooting — without claiming guaranteed neuroscience optimisation or medical outcomes.

The operational source of truth is [`practice-methodology.md`](./practice-methodology.md). It governs session design, drill authoring, feedback follow-ups, and training engine behaviour. All significant product features in these areas should align with it.

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
- "No pain, no gain."

---

## Final Principle

> The app should not simply generate things to repeat. It should generate focused training conditions that keep the player attentive, challenged, and able to correct the right thing.

See [`practice-methodology.md`](./practice-methodology.md) for the full methodology.
