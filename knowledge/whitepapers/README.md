# White Papers

This directory contains long-form design documents that describe core intellectual property.

Whitepapers explain *why* the algorithms exist rather than how they are coded. They are the bridge between training methodology and software implementation.

---

## Planned Whitepapers

| Document | Status | Priority |
|---|---|---|
| `rating-and-progression.md` | Not started | High |
| `practice-methodology.md` | Not started | High |
| `adaptive-training-engine.md` | Not started | High |
| `skill-rating-methodology.md` | Not started | High |
| `periodisation-model.md` | Not started | Medium |
| `confidence-vs-capability.md` | Not started | Medium |
| `reliable-performance-model.md` | Not started | Medium |
| `exercise-scoring.md` | Not started | Medium |

---

## High Priority: Rating & Progression White Paper

See `TODO.md` at the repository root for the full scope of `rating-and-progression.md`.

This is the first whitepaper to author. It underpins the skill rating system, reliable performance model, training verdict definitions, and the progression/regression rules implemented by the exercise selection engine.

---

## High Priority: Practice Methodology White Paper

See `TODO.md` for the full scope of `practice-methodology.md`.

This whitepaper expands the operational source [`knowledge/principles/practice-methodology.md`](../principles/practice-methodology.md) into long-form IP covering interleaved vs blocked practice, edge-of-ability training, chunking, hands-separate practice, targeted troubleshooting, practice journaling, mental rehearsal, singing/humming before playing, and guardrails against neuroscience overclaims.

The principles document is the day-to-day source of truth for developers and authors. The whitepaper is the deep design artefact — written manually, not auto-generated.

---

## Whitepaper Guidelines

- Written manually as product design artefacts, not auto-generated.
- Represent core intellectual property and must be reviewed before merging.
- Should be accessible to a non-engineer who understands guitar and training theory.
- Must be referenced in the relevant implementation code via comments pointing to the document.
