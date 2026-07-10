import { existsSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import {
  CORE_SKILL_DEFINITIONS,
  CORE_SKILLS,
  SUB_SKILL_DEFINITIONS,
  TRAINING_ATTRIBUTES,
  coreSkillLabel,
  isSubSkill,
  skillKnowledgeFilename,
  subSkillLabel,
  trainingAttributeLabel,
  type CoreSkill,
  type SubSkill,
  type TrainingAttribute,
} from "@/lib/skills/taxonomy";

export type ExerciseSummaryForPrompt = {
  title: string;
  slug: string;
  purpose: string;
  difficultyLevel: number;
  exerciseType: string;
  coreSkillId: CoreSkill;
  coreSkillName: string;
  subSkillIds: SubSkill[];
  subSkillNames: string[];
  trainingAttributes?: TrainingAttribute[];
};

export type BuildDrillPromptInput = {
  coreSkillId: CoreSkill;
  subSkillIds: SubSkill[];
  trainingAttributes: TrainingAttribute[];
  trainingAttributesInferred?: boolean;
  trainingAttributeDistribution?: string;
  /** Explicit difficulty, or omit when the server inferred one. */
  difficultyLevel: number;
  difficultyInferred: boolean;
  difficultyDistribution?: string;
  exerciseType: string;
  targetBpm?: number;
  direction?: string;
  existingDrills: ExerciseSummaryForPrompt[];
  priorExerciseJson?: string;
  refineInstruction?: string;
};

let cachedKnowledgeDoc: string | null = null;
const skillDocCache = new Map<string, string | null>();

/**
 * Map skill slug `string_crossing` → knowledge file `string-crossing.md`.
 * Throws if the slug is not a known sub-skill identifier.
 */
export function skillSlugToKnowledgeFilename(slug: string): string {
  if (!isSubSkill(slug)) {
    throw new Error(`Invalid skill slug for knowledge lookup: "${slug}"`);
  }
  return skillKnowledgeFilename(slug);
}

function resolveSkillKnowledgePath(slug: string): string | null {
  let filename: string;
  try {
    filename = skillSlugToKnowledgeFilename(slug);
  } catch {
    return null;
  }

  const skillsDir = resolve(process.cwd(), "knowledge/skills");
  const candidate = resolve(skillsDir, filename);
  const prefix = skillsDir.endsWith(sep) ? skillsDir : `${skillsDir}${sep}`;
  if (candidate !== skillsDir && !candidate.startsWith(prefix)) {
    return null;
  }
  return candidate;
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
 * Returns null when the slug is invalid, escapes knowledge/skills, or the file
 * has not been authored yet.
 */
export function loadSkillKnowledge(slug: string): string | null {
  if (skillDocCache.has(slug)) {
    return skillDocCache.get(slug) ?? null;
  }
  const path = resolveSkillKnowledgePath(slug);
  if (path === null || !existsSync(path)) {
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
- coreSkillId: ${CORE_SKILLS.map((id) => `\`${id}\``).join(" | ")}
- subSkillIds: known sub-skill IDs compatible with coreSkillId
- trainingAttributes: one or more of ${TRAINING_ATTRIBUTES.map((id) => `\`${id}\``).join(" | ")}
- patternType: micro_drill | standard_loop | musical_sequence | benchmark
- microDrillJustification: required when patternType is micro_drill
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
- Production acceptance threshold is 24/30; aim for 26+ for MVP
- List any red flags from the knowledge document
`.trim();

const FEW_SHOT_STRUCTURE = `
## Few-shot structure reference (do NOT copy content)

Example shape from Single String Alternate Picking Control:
- coreSkillId: "picking"
- subSkillIds: ["alternate_picking"]
- trainingAttributes: ["speed", "consistency"]
- exerciseType: "primary"
- primaryProgressMetric: "clean_bpm"
- supportsBpm: true, defaultTargetBpm: 90
- tabData: 2 bars of eighth notes on string 6, frets 5–8, alternating down/up picking
- feedbackSchema includes actual_bpm, training_verdict, difficulty, cleanliness (+ optional follow-up)
- patternType: "standard_loop"
- isMvp: true, version: 1, status: "active"
`.trim();

const NOISE_CONTROL_GUIDANCE = `
## Noise control (cross-cutting quality — NOT a core skill)

Noise control is assessed inside meaningful musical or technical context, not as an isolated tab pattern.

- NEVER use coreSkillId "muting_noise_control" or "noise_control"
- Use trainingAttributes such as "noise_control" or "cleanliness" when unwanted string noise is relevant
- palm_muting, fret_hand_muting, and release_control are supplementary technique tags — never the only sub-skills on a drill
- Optional feedbackSchema question id "noise_control" only when string noise genuinely matters

Good: alternate picking across strings where unused strings may ring; rhythm riffs with palm muting and rests; chord changes with clean releases.
Bad: repeated 0-0-0-0 open-string picking with no rhythm, accent, or palm-muting purpose; drills where the only instruction is "keep it clean".
`.trim();

function formatSkillDocSection(label: string, slug: SubSkill): string {
  const meta = SUB_SKILL_DEFINITIONS[slug];
  const doc = loadSkillKnowledge(slug);
  const header = `### ${label}: \`${slug}\``;
  const blurb = `${meta.label} [${coreSkillLabel(meta.primaryCoreSkillId)}] — ${meta.description}`;

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
              `- ${d.title} (${d.slug}) | core=${d.coreSkillId} | subSkills=${d.subSkillIds.join(", ") || "(none)"} | difficulty=${d.difficultyLevel} | type=${d.exerciseType} | purpose: ${d.purpose}`,
          )
          .join("\n");

  const taxonomyList = CORE_SKILLS
    .map((id) => {
      const core = CORE_SKILL_DEFINITIONS[id];
      return `- ${id}: ${core.label} — ${core.description}`;
    })
    .join("\n");

  const system = [
    "You are an expert guitar training drill designer for an adaptive practice app.",
    "You draft high-quality ExerciseSeed candidates. You are NOT the final authority — humans review before production acceptance.",
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
    "",
    NOISE_CONTROL_GUIDANCE,
  ].join("\n");

  const parts: string[] = [
    "## Generation request",
    `Core Skill: ${input.coreSkillId} (${coreSkillLabel(input.coreSkillId)})`,
    `Sub-skills: ${
      input.subSkillIds.map((id) => `${id} (${subSkillLabel(id)})`).join(", ") ||
      "(none)"
    }`,
    `Training attributes: ${input.trainingAttributes
      .map((id) => `${id} (${trainingAttributeLabel(id)})`)
      .join(", ")}${
      input.trainingAttributesInferred ? " (AUTO-INFERRED — do not change these)" : ""
    }`,
    `Exercise type: ${input.exerciseType}`,
  ];

  if (input.trainingAttributesInferred) {
    parts.push(
      "Training attributes were chosen to balance the library for this taxonomy slice.",
      ...(input.trainingAttributeDistribution
        ? [
            `Current training attribute counts for this taxonomy slice: ${input.trainingAttributeDistribution}`,
          ]
        : []),
    );
  }

  if (input.difficultyInferred) {
    parts.push(
      `Difficulty level: ${input.difficultyLevel} (AUTO-INFERRED — do not change this)`,
      "Difficulty was chosen because this taxonomy slice is under-filled at this level.",
      "Library difficulty targets follow a mid-heavy bell curve focused on 4–8; extremes (1–2, 9–10) stay sparse.",
      ...(input.difficultyDistribution
        ? [
            `Current difficulty counts for this taxonomy slice: ${input.difficultyDistribution}`,
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
    "## Core skill context",
    `${coreSkillLabel(input.coreSkillId)} — ${CORE_SKILL_DEFINITIONS[input.coreSkillId].description}`,
  );

  if (input.subSkillIds.length > 0) {
    parts.push("", "## Sub-skill context");
    for (const slug of input.subSkillIds) {
      parts.push(formatSkillDocSection("Sub-skill", slug));
      parts.push("");
    }
  }

  parts.push("", "## Available core skills (use these IDs only)", taxonomyList);
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
    "- exercise: full ExerciseSeed (coreSkillId, subSkillIds, trainingAttributes, patternType, valid tabData, feedbackSchema with training_verdict)",
    "- briefMarkdown: human-readable brief using the sections from the knowledge doc §5",
    "- qualityScore: six category scores 0–5 plus total (must equal sum)",
    "- patternType may also be returned at the top level for reviewer display, but exercise.patternType is the source of truth",
    "- redFlags: list any red-flag issues (empty array if none). If the tab has fewer than 8 notes, MUST include: \"Short pattern warning: this drill is very small. Confirm it is intentionally a micro-drill and not an underdeveloped standard drill.\"",
    "- missingFields: any gaps vs required fields (empty if complete)",
    "- reviewerChecklist: suggested human playability review questions for this drill",
    "- refinePrompt: a ready-to-use continuation prompt if the reviewer wants to iterate further",
    "",
    "Tab patterns MUST obey sub-skill boundaries (e.g. string_crossing = adjacent only; string_skipping = must include non-adjacent jumps).",
    "Prefer complete 1–2 bar loops (8–16+ notes for picking/sync) over tiny fragments unless patternType is micro_drill with a clear isolation justification.",
    "Do not create full drills for techniques that are only useful in isolation. For lead articulation, prefer musical-context phrases such as pentatonic phrase → bend → hold → vibrato, or legato fragment → target note → controlled vibrato.",
    "",
    NOISE_CONTROL_GUIDANCE,
  );

  return { system, prompt: parts.join("\n") };
}
