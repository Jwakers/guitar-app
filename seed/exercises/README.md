# Exercise seed fixtures

JSON files in this directory are reference exercises for seeding, migration, and validation tests.

Every fixture must pass `validateExercise()` including legato rules:

- Use `articulationFromPrevious` for hammer-on, pull-off, slide, and picked connections
- Legato only connects notes on the **same string**
- Do not use deprecated `technique: hammer_on` / `pull_off` / `slide` / `picked`

Invalid generated drills are rejected before seeding.
