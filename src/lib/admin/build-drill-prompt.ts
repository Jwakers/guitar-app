import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ExerciseSummaryForPrompt = {
  title: string;
  slug: string;
  purpose: string;
  difficultyLevel: number;
  exerciseType: string;
  primarySkillSlug: string;
  primarySkillName: string;
};

export type SkillForPrompt = {
  name: string;
  slug: string;
  description: string;
  category: string;
};

export type BuildDrillPromptInput = {
  primarySkillSlug: string;
  secondarySkillSlugs: string[];
  /** Explicit difficulty, or omit when the server inferred one. */
  difficultyLevel: number;
  difficultyInferred: boolean;
  difficultyDistribution?: string;
  exerciseType: string;
  targetBpm?: number;
  direction?: string;
  existingDrills: ExerciseSummaryForPrompt[];
  skills: SkillForPrompt[];
  priorExerciseJson?: string;
  refineInstruction?: string;
};

let cachedKnowledgeDoc: string | null = null;
const skillDocCache = new Map<string, string | null>();

/** Map skill slug `string_crossing` → knowledge file `string-crossing.md`. */
export function skillSlugToKnowledgeFilename(slug: string): string {
  return `${slug.replace(/_/g, "-")}.md`;
}

export function loadDrillGenerationKnowledge(): string {
  if (cachedKnowledgeDoc) return cachedKnowledgeDoc;
  const path = join(
    process.cwd(),
    "knowledge/drills/drill-generation-and-validation.md",
  );
  cachedKnowledgeDoc = readFileSync(path, "utf8");
  return cachedKnowledgeDoc;
}

/**
 * Load a skill knowledge document if present.
 * Returns null when the file has not been authored yet.
 */
export function loadSkillKnowledge(slug: string): string | null {
  if (skillDocCache.has(slug)) {
    return skillDocCache.get(slug) ?? null;
  }
  const path = join(
    process.cwd(),
    "knowledge/skills",
    skillSlugToKnowledgeFilename(slug),
  );
  if (!existsSync(path)) {
    skillDocCache.set(slug, null);
    return null;
  }
  const content = readFileSync(path, "utf8");
  skillDocCache.set(slug, content);
  return content;
}

const SCHEMA_CONSTRAINTS = `
## Runtime schema constraints (must obey)

ExerciseSeed fields:
- primarySkillId / secondarySkillIds are skill SLUGS (snake_case), not DB IDs
- difficultyLevel: integer 1–10
- exerciseType: warmup | primary | secondary | accessory | isolation | test
- primaryProgressMetric: clean_bpm | accuracy_score | timing_consistency | control_score | clean_reps | endurance_duration | noise_control | comfort_score
- status: active | deprecated | replaced (use "active" for new drills)
- version: positive integer (use 1 for new drills)
- feedbackSchema MUST include a question with id "training_verdict"
- If supportsBpm is true, defaultTargetBpm must be a positive number

TabData:
- tuning: exactly 6 strings, ordered low E → high E (e.g. ["E","A","D","G","B","E"])
- string numbers: 1 = high E (thinnest), 6 = low E (thickest)
- fret: integer 0–24
- duration: whole | half | quarter | eighth | sixteenth (NO standalone "triplet")
- For triplets use duration + tuplet: 3 (e.g. duration "eighth", tuplet 3)
- loopStartBar / loopEndBar are 0-based bar indexes within bars.length
- Prefer 2–4 bars for MVP drills; keep patterns clear and playable

Quality scoring:
- Score each of the 6 categories 0–5; total must equal the sum
- Seed threshold is 24/30; aim for 26+ for MVP
- List any red flags from the knowledge document
`.trim();

const FEW_SHOT_STRUCTURE = `
## Few-shot structure reference (do NOT copy content)

Example shape from Single String Alternate Picking Control:
- primarySkillId: "alternate_picking"
- secondarySkillIds: ["rhythm", "synchronisation"]
- exerciseType: "primary"
- primaryProgressMetric: "clean_bpm"
- supportsBpm: true, defaultTargetBpm: 90
- tabData: 2 bars of eighth notes on string 6, frets 5–8, alternating down/up picking
- feedbackSchema includes actual_bpm, training_verdict, difficulty, cleanliness (+ optional follow-up)
- isMvp: true, version: 1, status: "active"
`.trim();

function formatSkillDocSection(
  label: string,
  slug: string,
  skills: SkillForPrompt[],
): string {
  const meta = skills.find((s) => s.slug === slug);
  const doc = loadSkillKnowledge(slug);
  const header = `### ${label}: \`${slug}\``;
  const blurb = meta
    ? `${meta.name} [${meta.category}] — ${meta.description}`
    : "(skill not found in taxonomy list)";

  if (doc) {
    return [
      header,
      `Short description: ${blurb}`,
      "",
      "Authoritative skill knowledge document (obey Definition and Not This Skill):",
      doc,
    ].join("\n");
  }

  return [
    header,
    `Short description: ${blurb}`,
    "",
    "(No skill knowledge document yet — use the short description and do not invent overlapping skill boundaries.)",
  ].join("\n");
}

export function buildDrillPrompt(input: BuildDrillPromptInput): {
  system: string;
  prompt: string;
} {
  const knowledge = loadDrillGenerationKnowledge();

  const existingList =
    input.existingDrills.length === 0
      ? "(none yet)"
      : input.existingDrills
          .map(
            (d) =>
              `- ${d.title} (${d.slug}) | skill=${d.primarySkillSlug} | difficulty=${d.difficultyLevel} | type=${d.exerciseType} | purpose: ${d.purpose}`,
          )
          .join("\n");

  const skillsList = input.skills
    .map((s) => `- ${s.slug}: ${s.name} [${s.category}] — ${s.description}`)
    .join("\n");

  const system = [
    "You are an expert guitar training drill designer for an adaptive practice app.",
    "You draft high-quality ExerciseSeed candidates. You are NOT the final authority — humans review before seed acceptance.",
    "Follow the knowledge document and schema constraints exactly.",
    "When a skill knowledge document is provided, its Definition and Not This Skill sections are binding for tab design.",
    "Never duplicate an existing drill's title, purpose, pattern, or skill focus.",
    "",
    "# Knowledge document (authoritative process & scoring)",
    knowledge,
    "",
    SCHEMA_CONSTRAINTS,
    "",
    FEW_SHOT_STRUCTURE,
  ].join("\n");

  const parts: string[] = [
    "## Generation request",
    `Primary skill slug: ${input.primarySkillSlug}`,
    `Secondary skill slugs: ${input.secondarySkillSlugs.join(", ") || "(none)"}`,
    `Exercise type: ${input.exerciseType}`,
  ];

  if (input.difficultyInferred) {
    parts.push(
      `Difficulty level: ${input.difficultyLevel} (AUTO-INFERRED — do not change this)`,
      "Difficulty was chosen because this skill's library is under-filled at this level.",
      "Library difficulty targets follow a mid-heavy bell curve focused on 4–8; extremes (1–2, 9–10) stay sparse.",
      ...(input.difficultyDistribution
        ? [
            `Current difficulty counts for this skill: ${input.difficultyDistribution}`,
          ]
        : []),
    );
  } else {
    parts.push(`Difficulty level: ${input.difficultyLevel} (explicitly requested)`);
  }

  if (input.targetBpm != null) {
    parts.push(`Target BPM hint: ${input.targetBpm}`);
  }
  if (input.direction?.trim()) {
    parts.push(`Additional direction from reviewer:\n${input.direction.trim()}`);
  }

  parts.push(
    "",
    "## Primary skill context (authoritative)",
    formatSkillDocSection("Primary skill", input.primarySkillSlug, input.skills),
  );

  if (input.secondarySkillSlugs.length > 0) {
    parts.push("", "## Secondary skill context");
    for (const slug of input.secondarySkillSlugs) {
      parts.push(formatSkillDocSection("Secondary skill", slug, input.skills));
      parts.push("");
    }
  }

  parts.push("", "## Available skills (use these slugs only)", skillsList);
  parts.push(
    "",
    "## Existing drills — DO NOT DUPLICATE",
    "Do not create a drill that overlaps title, purpose, pattern, or skill focus with these:",
    existingList,
  );

  if (input.priorExerciseJson && input.refineInstruction?.trim()) {
    parts.push(
      "",
      "## Prior candidate (refine this)",
      input.priorExerciseJson,
      "",
      "## Refine instruction",
      input.refineInstruction.trim(),
    );
  }

  parts.push(
    "",
    "## Output requirements",
    "Return a single structured object with:",
    "- exercise: full ExerciseSeed (skill slugs, valid tabData, feedbackSchema with training_verdict)",
    "- briefMarkdown: human-readable brief using the sections from the knowledge doc §4",
    "- qualityScore: six category scores 0–5 plus total (must equal sum)",
    "- redFlags: list any red-flag issues (empty array if none)",
    "- missingFields: any gaps vs required fields (empty if complete)",
    "- reviewerChecklist: suggested human playability review questions for this drill",
    "- refinePrompt: a ready-to-use continuation prompt if the reviewer wants to iterate further",
    "",
    "Tab patterns MUST obey the primary skill boundary (e.g. string_crossing = adjacent only; string_skipping = must include non-adjacent jumps).",
  );

  return { system, prompt: parts.join("\n") };
}
