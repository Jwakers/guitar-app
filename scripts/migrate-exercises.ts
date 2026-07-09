#!/usr/bin/env tsx
/**
 * Migrate active exercises from Convex dev → production.
 *
 * Idempotent: keyed on slug + version (not Convex _id).
 *
 * Prerequisites — set in .env.local (gitignored) or export in shell:
 *   CONVEX_DEV_DEPLOY_KEY=dev:...
 *   CONVEX_PROD_DEPLOY_KEY=prod:...
 *
 * Usage:
 *   pnpm migrate:exercises              # promote active exercises
 *   pnpm migrate:exercises --dry-run    # preview without prod writes
 *   pnpm migrate:exercises --slug foo     # single exercise by slug
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type ExerciseSeed = Record<string, unknown>;

type ImportResult = {
  inserted: number;
  updated: number;
  skipped: number;
  rejected: number;
};

const BATCH_SIZE = 10;

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const slugIndex = argv.indexOf("--slug");
  const slug =
    slugIndex !== -1 && argv[slugIndex + 1] ? argv[slugIndex + 1] : undefined;
  return { dryRun, slug };
}

function requireDeployKey(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Set it in .env.local or your shell.`);
    process.exit(1);
  }
  return value;
}

function convexRun(
  functionPath: string,
  args: unknown,
  deployKey: string,
): string {
  const argsJson = JSON.stringify(args);
  const output = execSync(
    `npx convex run ${functionPath} '${argsJson.replace(/'/g, "'\\''")}'`,
    {
      env: { ...process.env, CONVEX_DEPLOY_KEY: deployKey },
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
    },
  );
  return output.trim();
}

function parseConvexJson<T>(raw: string): T {
  const start = raw.search(/[\[{]/);
  if (start === -1) {
    throw new Error(`Could not parse Convex output as JSON:\n${raw}`);
  }

  const end = findJsonValueEnd(raw, start);
  if (end === -1) {
    throw new Error(`Could not parse Convex output as JSON:\n${raw}`);
  }

  return JSON.parse(raw.slice(start, end + 1)) as T;
}

function findJsonValueEnd(raw: string, start: number): number {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i]!;
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{" || ch === "[") {
      stack.push(ch === "{" ? "}" : "]");
      continue;
    }

    if (stack.length > 0 && ch === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) {
        return i;
      }
    }
  }

  return -1;
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function sumResults(results: ImportResult[]): ImportResult {
  return results.reduce(
    (acc, r) => ({
      inserted: acc.inserted + r.inserted,
      updated: acc.updated + r.updated,
      skipped: acc.skipped + r.skipped,
      rejected: acc.rejected + r.rejected,
    }),
    { inserted: 0, updated: 0, skipped: 0, rejected: 0 },
  );
}

async function main() {
  loadEnvFile();
  const { dryRun, slug } = parseArgs(process.argv.slice(2));

  const devKey = requireDeployKey("CONVEX_DEV_DEPLOY_KEY");
  const prodKey = requireDeployKey("CONVEX_PROD_DEPLOY_KEY");

  console.log("Exporting active exercises from dev...");
  const exportRaw = convexRun("exercises:exportExerciseSeeds", {}, devKey);
  let exercises = parseConvexJson<ExerciseSeed[]>(exportRaw);

  if (slug) {
    exercises = exercises.filter((ex) => ex.slug === slug);
    if (exercises.length === 0) {
      console.error(`No active exercise found with slug "${slug}" in dev.`);
      process.exit(1);
    }
  }

  console.log(`Found ${exercises.length} active exercise(s) to migrate.`);

  if (exercises.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  if (dryRun) {
    console.log("Dry run — no writes to production.");
  }

  const batches = chunk(exercises, BATCH_SIZE);
  const results: ImportResult[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]!;
    console.log(
      `Importing batch ${i + 1}/${batches.length} (${batch.length} exercise(s))...`,
    );
    const importRaw = convexRun(
      "exercises:importExerciseSeeds",
      { exercises: batch, dryRun },
      prodKey,
    );
    const result = parseConvexJson<ImportResult>(importRaw);
    results.push(result);
    console.log(
      `  inserted=${result.inserted} updated=${result.updated} skipped=${result.skipped} rejected=${result.rejected}`,
    );
  }

  const totals = sumResults(results);
  console.log("\nMigration complete:");
  console.log(`  inserted: ${totals.inserted}`);
  console.log(`  updated:  ${totals.updated}`);
  console.log(`  skipped:  ${totals.skipped}`);
  console.log(`  rejected: ${totals.rejected}`);

  if (totals.rejected > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
