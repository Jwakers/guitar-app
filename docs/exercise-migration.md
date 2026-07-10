# Exercise migration (dev → production)

Exercises are authored in the **dev** Convex deployment via the drill generator, reviewed against the knowledge checklist, then promoted to **production** with a migration script. Convex is the source of truth for runtime exercise data.

## Stable identifiers

Convex `_id` values differ across deployments. Migration uses:

| Field | Purpose |
| --- | --- |
| `slug` | Primary cross-environment identity (unique index) |
| `version` | Monotonic content version; controls skip vs update |
| `replacedBySlug` | Links deprecated drills without `_id` |

## Idempotency

For each exercise on import:

- Same `slug`, prod version ≥ source version → **skipped**
- Same `slug`, prod version < source version → **patched**
- Slug not in prod → **inserted**

Re-running the script is safe.

Only exercises with `status: "active"` are exported from dev.

## Prerequisites

Create deploy keys in the Convex dashboard (Settings → Deploy Keys) for dev and prod.

Add to `.env.local` (gitignored):

```bash
CONVEX_DEV_DEPLOY_KEY=dev:...
CONVEX_PROD_DEPLOY_KEY=prod:...
```

## Commands

```bash
# Preview what would change in production (no writes)
pnpm migrate:exercises --dry-run

# Promote all active exercises from dev → prod
pnpm migrate:exercises

# Promote a single exercise by slug
pnpm migrate:exercises --slug half-step-bend-accuracy
```

## Workflow

1. Generate and review a drill in the admin drill generator
2. Save to dev (`saveGeneratedExercise`)
3. Complete the knowledge-doc acceptance checklist
4. Bump `version` when making substantive changes
5. Run `pnpm migrate:exercises` to promote to production

## Convex functions (internal)

- `exercises:exportExerciseSeeds` — export active exercises from current deployment
- `exercises:importExerciseSeeds` — idempotent import keyed on slug + version

Manual invocation:

```bash
CONVEX_DEPLOY_KEY=dev:... npx convex run exercises:exportExerciseSeeds
CONVEX_DEPLOY_KEY=prod:... npx convex run exercises:importExerciseSeeds '{"exercises":[...],"dryRun":false}'
```

## Taxonomy changes (dev reset)

When the skill taxonomy changes incompatibly (e.g. removing a core skill), wipe legacy dev data and re-author exercises.

**Side effects:** deletes all exercises, user skill ratings, and user profiles, and sets `onboardingCompleted: false` on every user (everyone must re-onboard).

```bash
# Dev deployment only — set guards first, then confirm the deployment in the dashboard.
npx convex env set DEPLOYMENT_TIER dev
npx convex env set ALLOW_TAXONOMY_RESET true
npx convex run devReset:resetLegacyTaxonomyData '{"confirm":"RESET_LEGACY_TAXONOMY_DATA"}'
```

The mutation refuses to run unless `DEPLOYMENT_TIER=dev` and `ALLOW_TAXONOMY_RESET=true` are set on the target deployment. Never set these on production. Re-save drills in dev under the new taxonomy before migrating to prod.
