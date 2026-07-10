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
Repeating the same exercise at the same difficulty level indefinitely does not produce improvement. The engine must identify when to progress, hold, or regress — and act accordingly.

**Respect the player's time.**
The user's most limited resource is practice time. Every interaction — logging, navigation, feedback — should be as fast as possible. The app earns trust by respecting the session, not by demanding attention.

**Earn trust through deterministic, explainable recommendations.**
The training engine must produce recommendations that a thoughtful musician would recognise as sensible. If the app cannot explain why it prescribed a session, the session should not be prescribed.

**Hide taxonomy complexity from the player.**
The internal model is Core Skill → Sub-skill → Drill with training attributes layered on top. That structure exists so the app can make better practice decisions; user-facing copy should stay simple unless the extra detail helps the guitarist practise.
