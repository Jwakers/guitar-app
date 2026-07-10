"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { TabRenderer } from "@/components/tab-renderer/tab-renderer";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_DRILL_GENERATOR_MODEL,
  DRILL_GENERATOR_MODEL_OPTIONS,
  type DrillGeneratorModelOptionId,
} from "@/lib/admin/ai-models";
import type { QualityScore } from "@/lib/admin/exercise-seed-zod";
import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";
import { cn } from "@/lib/utils";

const EXERCISE_TYPES = [
  "warmup",
  "primary",
  "secondary",
  "accessory",
  "isolation",
  "test",
] as const;

type WorkingMode = "generate" | "refine";

function ToggleChip({
  id,
  label,
  selected,
  onToggle,
}: {
  id: string;
  label: string;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      key={id}
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(id)}
      className={cn(
        "rounded-md border px-3 py-1.5 font-mono text-xs font-semibold transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground hover:border-border/60 hover:bg-muted/50",
      )}
    >
      {label}
    </button>
  );
}

const GENERATE_STAGES = [
  { afterSec: 0, label: "Sending request to the model…" },
  { afterSec: 8, label: "Drafting drill structure and coaching copy…" },
  { afterSec: 20, label: "Building tab pattern and feedback schema…" },
  { afterSec: 40, label: "Scoring quality and checking for red flags…" },
  { afterSec: 70, label: "Still working — large structured outputs can take 1–2 minutes…" },
  { afterSec: 110, label: "Almost there — validating the candidate…" },
] as const;

const REFINE_STAGES = [
  { afterSec: 0, label: "Sending refine request…" },
  { afterSec: 8, label: "Revising the candidate against your notes…" },
  { afterSec: 25, label: "Updating tab and quality score…" },
  { afterSec: 50, label: "Still refining — this can take a minute…" },
] as const;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

function stageForElapsed(
  seconds: number,
  stages: readonly { afterSec: number; label: string }[],
): string {
  let label = stages[0]?.label ?? "Working…";
  for (const stage of stages) {
    if (seconds >= stage.afterSec) label = stage.label;
  }
  return label;
}

function WorkingStatus({
  mode,
  modelLabel,
}: {
  mode: WorkingMode;
  modelLabel: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const stages = mode === "refine" ? REFINE_STAGES : GENERATE_STAGES;
  const stage = stageForElapsed(elapsed, stages);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          {mode === "refine" ? "REFINING" : "GENERATING"}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {formatElapsed(elapsed)}
        </p>
      </div>
      <p className="mt-2 text-sm text-foreground">{stage}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Model: {modelLabel}. This is normal — hang tight until the candidate
        appears.
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}

type GenerateResponse = {
  exercise: ExerciseSeed;
  briefMarkdown: string;
  qualityScore: QualityScore;
  patternType?:
    | "micro_drill"
    | "standard_loop"
    | "musical_sequence"
    | "benchmark";
  redFlags: string[];
  missingFields: string[];
  reviewerChecklist: string[];
  refinePrompt: string;
  validationStatus: "passed" | "failed";
  description?: string;
  error?: string;
  validationError?: string;
  subSkillIds?: string[];
  subSkillIdsInferred?: boolean;
  subSkillDistribution?: string;
  difficultyLevel?: number;
  difficultyInferred?: boolean;
  difficultyDistribution?: string;
  trainingAttributes?: string[];
  trainingAttributesInferred?: boolean;
  trainingAttributeDistribution?: string;
};

type ApiErrorBody = {
  error?: string;
  details?: { message: string; path: (string | number)[] }[];
};

function formatApiError(data: ApiErrorBody, status: number): string {
  if (data.details?.length) {
    return data.details.map((d) => d.message).join(" ");
  }
  return data.error ?? `Request failed (${status})`;
}

const PATTERN_TYPE_LABELS: Record<
  NonNullable<GenerateResponse["patternType"]>,
  string
> = {
  micro_drill: "Micro-drill",
  standard_loop: "Standard loop",
  musical_sequence: "Musical sequence",
  benchmark: "Benchmark",
};

function CopyBlock({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          {label}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        className={cn(
          "max-h-80 overflow-auto rounded border border-border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap text-foreground",
          className,
        )}
      >
        {value}
      </pre>
    </div>
  );
}

export function DrillGenerator() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const coreSkills = useQuery(api.skills.listCoreSkills);
  const allSubSkills = useQuery(api.skills.listSubSkills, {});
  const trainingAttributeOptions = useQuery(api.skills.listTrainingAttributes);
  const saveExercise = useMutation(api.exercises.saveGeneratedExercise);

  const [coreSkillId, setCoreSkillId] = useState("");
  const [subSkillIds, setSubSkillIds] = useState<string[]>([]);
  const [trainingAttributes, setTrainingAttributes] = useState<string[]>([]);
  /** Empty string = auto-infer from library gaps (mid-heavy 4–8 curve). */
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [exerciseType, setExerciseType] =
    useState<(typeof EXERCISE_TYPES)[number]>("primary");
  const [model, setModel] = useState<DrillGeneratorModelOptionId>(
    DEFAULT_DRILL_GENERATOR_MODEL,
  );
  const [targetBpm, setTargetBpm] = useState("");
  const [direction, setDirection] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");

  const [workingMode, setWorkingMode] = useState<WorkingMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const loading = workingMode !== null;
  const modelLabel =
    DRILL_GENERATOR_MODEL_OPTIONS.find((m) => m.id === model)?.label ?? model;
  const alreadySaved =
    result?.exercise != null && savedSlug === result.exercise.slug;

  // Wait for Clerk/Convex auth and the user row before deciding access.
  // Calling notFound() on a pre-auth null was incorrectly 404ing super users.
  if (authLoading || (isAuthenticated && user === undefined)) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    user === null ||
    user === undefined ||
    user.isSuperUser !== true
  ) {
    notFound();
  }

  if (
    coreSkills === undefined ||
    allSubSkills === undefined ||
    trainingAttributeOptions === undefined
  ) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const effectiveCore = coreSkillId || coreSkills[0]?.id || "picking";
  const subSkillOptions = allSubSkills.filter(
    (skill) => skill.coreSkillId === effectiveCore,
  );
  const effectiveSubSkillIds =
    subSkillIds.filter((id) =>
      subSkillOptions.some((skill) => skill.id === id),
    ) || [];

  function toggleSubSkill(id: string) {
    setSubSkillIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function toggleTrainingAttribute(id: string) {
    setTrainingAttributes((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function runGenerate(mode: WorkingMode) {
    if (mode === "refine" && !refinePrompt.trim()) {
      setError("Enter a refine instruction first");
      return;
    }

    setWorkingMode(mode);
    setError(null);
    setSaveMessage(null);
    setSavedSlug(null);

    try {
      const parsedDifficulty = difficultyLevel.trim()
        ? Number(difficultyLevel)
        : null;

      const payload = {
        coreSkillId: effectiveCore,
        subSkillIds: effectiveSubSkillIds,
        trainingAttributes,
        difficultyLevel:
          parsedDifficulty != null &&
          Number.isInteger(parsedDifficulty) &&
          parsedDifficulty >= 1 &&
          parsedDifficulty <= 10
            ? parsedDifficulty
            : null,
        exerciseType,
        model,
        ...(targetBpm.trim()
          ? { targetBpm: Number(targetBpm) }
          : {}),
        ...(direction.trim() ? { direction: direction.trim() } : {}),
        ...(mode === "refine" && result?.exercise
          ? {
              priorExercise: result.exercise,
              refineInstruction: refinePrompt.trim(),
            }
          : {}),
      };

      const res = await fetch("/api/admin/generate-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as GenerateResponse & ApiErrorBody;

      if (!res.ok && data.validationStatus !== "failed") {
        throw new Error(formatApiError(data, res.status));
      }

      if (data.validationStatus === "failed") {
        setResult(null);
        setError(
          data.validationError ??
            data.error ??
            "Generated drill failed validation",
        );
        if (data.refinePrompt) setRefinePrompt(data.refinePrompt);
        return;
      }

      setResult(data);
      setRefinePrompt(data.refinePrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setWorkingMode(null);
    }
  }

  async function handleSave() {
    if (!result?.exercise || alreadySaved) return;
    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      const ex = result.exercise;
      const saved = await saveExercise({
        title: ex.title,
        slug: ex.slug,
        description: ex.description,
        purpose: ex.purpose,
        targetWeaknesses: ex.targetWeaknesses,
        minimumCleanStandard: ex.minimumCleanStandard,
        measurementInstructions: ex.measurementInstructions,
        coachingNotes: ex.coachingNotes,
        coreSkillId: ex.coreSkillId,
        subSkillIds: ex.subSkillIds,
        trainingAttributes: ex.trainingAttributes,
        difficultyLevel: ex.difficultyLevel,
        exerciseType: ex.exerciseType,
        primaryProgressMetric: ex.primaryProgressMetric,
        supportsBpm: ex.supportsBpm,
        defaultTargetBpm: ex.defaultTargetBpm,
        successCriteria: ex.successCriteria,
        commonMistakes: ex.commonMistakes,
        progressionRule: ex.progressionRule,
        regressionRule: ex.regressionRule,
        tabData: ex.tabData,
        patternType: ex.patternType,
        microDrillJustification: ex.microDrillJustification,
        feedbackSchema: ex.feedbackSchema,
        estimatedMinutes: ex.estimatedMinutes,
        isMvp: ex.isMvp,
        version: ex.version,
        status: ex.status,
        replacedBySlug: ex.replacedBySlug,
      });

      setSavedSlug(ex.slug);
      setSaveMessage(
        `Saved to dev (${saved.action}: ${saved.id}). When reviewed and accepted, run \`pnpm migrate:exercises\` to promote active exercises to production.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const score = result?.qualityScore;
  const belowThreshold = score != null && score.total < 24;

  return (
    <main className="py-8">
      <div className="mx-auto w-full max-w-2xl px-4">
        <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
          DRILL GENERATOR
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Super-user tool. Candidates only — save to dev, then migrate to prod.
          Guided by{" "}
          <code className="font-mono text-xs">
            knowledge/drills/drill-generation-and-validation.md
          </code>
          .
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void runGenerate("generate");
          }}
        >
          <label className="block space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              CORE SKILL
            </span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={effectiveCore}
              onChange={(e) => {
                setCoreSkillId(e.target.value);
                setSubSkillIds([]);
              }}
            >
              {coreSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              SUB-SKILLS (OPTIONAL)
            </span>
            <div className="flex flex-wrap gap-2">
              {subSkillOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No sub-skill required for this core skill.
                </p>
              ) : (
                subSkillOptions.map((skill) => (
                  <ToggleChip
                    key={skill.id}
                    id={skill.id}
                    label={skill.name}
                    selected={effectiveSubSkillIds.includes(skill.id)}
                    onToggle={toggleSubSkill}
                  />
                ))
              )}
            </div>
            {subSkillOptions.length > 0 && (
              <span className="block text-xs text-muted-foreground">
                Leave all unselected to auto-infer from library gaps for this
                core skill. Muting tags supplement another movement — they do
                not drive standalone drills.
              </span>
            )}
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              TRAINING ATTRIBUTES (OPTIONAL)
            </span>
            <div className="flex flex-wrap gap-2">
              {trainingAttributeOptions.map((attribute) => (
                <ToggleChip
                  key={attribute.id}
                  id={attribute.id}
                  label={attribute.name}
                  selected={trainingAttributes.includes(attribute.id)}
                  onToggle={toggleTrainingAttribute}
                />
              ))}
            </div>
            <span className="block text-xs text-muted-foreground">
              Leave all unselected to auto-infer from library gaps for this
              core/sub-skill. Muting tags (palm muting, fret-hand muting,
              release control) supplement another movement — they do not drive
              standalone drills.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                DIFFICULTY (OPTIONAL)
              </span>
              <input
                type="number"
                min={1}
                max={10}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                placeholder="Auto (mid 4–8 bias)"
              />
              <span className="block text-xs text-muted-foreground">
                Leave blank to fill library gaps — weighted toward 4–8, not flat
                across 1–10.
              </span>
            </label>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                EXERCISE TYPE
              </span>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={exerciseType}
                onChange={(e) =>
                  setExerciseType(
                    e.target.value as (typeof EXERCISE_TYPES)[number],
                  )
                }
              >
                {EXERCISE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              MODEL (AI GATEWAY)
            </span>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={model}
              onChange={(e) =>
                setModel(e.target.value as DrillGeneratorModelOptionId)
              }
            >
              {DRILL_GENERATOR_MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              TARGET BPM (OPTIONAL)
            </span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={targetBpm}
              onChange={(e) => setTargetBpm(e.target.value)}
              placeholder="e.g. 90"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              DIRECTION (OPTIONAL)
            </span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="Steer the AI — e.g. focus on string crossing with strict alternate picking, keep it 2 bars…"
            />
          </label>

          <Button type="submit" disabled={loading}>
            {workingMode === "generate" ? "Generating…" : "Generate drill"}
          </Button>
        </form>

        {workingMode && (
          <WorkingStatus
            key={workingMode}
            mode={workingMode}
            modelLabel={modelLabel}
          />
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {result?.exercise && !loading && (
        <>
          <div className="mx-auto mt-10 w-full max-w-2xl space-y-6 px-4">
            <div>
              <h2 className="font-mono text-lg font-bold tracking-tight">
                {result.exercise.title}
              </h2>
              <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
                DIFFICULTY {result.exercise.difficultyLevel}/10
                {result.difficultyInferred
                  ? " · AUTO-INFERRED FROM LIBRARY GAPS"
                  : ""}
              </p>
              {result.subSkillIds && result.subSkillIds.length > 0 && (
                <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
                  SUB-SKILLS{" "}
                  {result.subSkillIds
                    .map((id) => id.replaceAll("_", " ").toUpperCase())
                    .join(" · ")}
                  {result.subSkillIdsInferred
                    ? " · AUTO-INFERRED FROM LIBRARY GAPS"
                    : ""}
                </p>
              )}
              {result.subSkillIdsInferred && result.subSkillDistribution && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Sub-skill distribution before this candidate:{" "}
                  {result.subSkillDistribution}
                </p>
              )}
              {result.trainingAttributes && (
                <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
                  ATTRIBUTES{" "}
                  {result.trainingAttributes
                    .map((id) => id.replaceAll("_", " ").toUpperCase())
                    .join(" · ")}
                  {result.trainingAttributesInferred
                    ? " · AUTO-INFERRED FROM LIBRARY GAPS"
                    : ""}
                </p>
              )}
              {result.difficultyInferred && result.difficultyDistribution && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Skill distribution before this candidate:{" "}
                  {result.difficultyDistribution}
                </p>
              )}
              {result.trainingAttributesInferred &&
                result.trainingAttributeDistribution && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Attribute distribution before this candidate:{" "}
                    {result.trainingAttributeDistribution}
                  </p>
                )}
              <p className="mt-2 text-sm text-muted-foreground">
                {result.exercise.description}
              </p>
              <p className="mt-2 text-sm text-foreground">
                {result.exercise.purpose}
              </p>
            </div>

            {result.patternType && (
              <section className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                  PATTERN TYPE
                </h3>
                <p className="mt-1 text-sm font-medium">
                  {PATTERN_TYPE_LABELS[result.patternType]}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {result.patternType}
                </p>
              </section>
            )}

            {score && (
              <section
                className={cn(
                  "rounded-lg border p-4",
                  belowThreshold
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-card",
                )}
              >
                <h3 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                  QUALITY SCORE
                </h3>
                <p className="mt-1 font-mono text-2xl font-bold">
                  {score.total}
                  <span className="text-base text-muted-foreground">/30</span>
                </p>
                {belowThreshold && (
                  <p className="mt-1 text-sm text-destructive">
                    Below acceptance threshold (24). Refine before saving.
                  </p>
                )}
                <ul className="mt-3 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
                  <li>Purpose: {score.clearTrainingPurpose}/5</li>
                  <li>Measurable: {score.measurableOutcome}/5</li>
                  <li>Mechanical: {score.mechanicalUsefulness}/5</li>
                  <li>Difficulty: {score.appropriateDifficulty}/5</li>
                  <li>
                    Prog/reg: {score.progressionRegressionQuality}/5
                  </li>
                  <li>Coaching: {score.coachingQuality}/5</li>
                </ul>
              </section>
            )}

            {result.redFlags.length > 0 && (
              <section>
                <h3 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-destructive">
                  RED FLAGS
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
                  {result.redFlags.map((flag, i) => (
                    <li key={`red-flag-${i}-${flag}`}>{flag}</li>
                  ))}
                </ul>
              </section>
            )}

            {result.missingFields.length > 0 && (
              <section>
                <h3 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                  MISSING FIELDS
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {result.missingFields.map((f, i) => (
                    <li key={`missing-${i}-${f}`}>{f}</li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                REVIEWER CHECKLIST
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.reviewerChecklist.map((item, i) => (
                  <li key={`checklist-${i}-${item}`}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 px-4">
            <div className="mx-auto w-full max-w-6xl">
              <h3 className="mb-3 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                TAB
              </h3>
              <TabRenderer tabData={result.exercise.tabData} />
            </div>
          </section>

          <div className="mx-auto mt-8 w-full max-w-2xl space-y-6 px-4">
            <CopyBlock label="DRILL BRIEF" value={result.briefMarkdown} />

            <section className="space-y-2">
              <label className="block space-y-2">
                <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                  REFINE
                </span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="Describe how to refine this candidate…"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading || saving}
                  onClick={() => void runGenerate("refine")}
                >
                  {workingMode === "refine" ? "Refining…" : "Refine drill"}
                </Button>
                <Button
                  type="button"
                  disabled={saving || alreadySaved || loading}
                  onClick={() => void handleSave()}
                >
                  {saving
                    ? "Saving…"
                    : alreadySaved
                      ? "Saved to Convex"
                      : "Save candidate to Convex"}
                </Button>
              </div>
              {saveMessage && (
                <p
                  role="status"
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
                >
                  {saveMessage}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Save writes a DB candidate for tab testing
                {belowThreshold
                  ? " (score is below 24 — refine before production acceptance)"
                  : ""}
                . Production acceptance still requires schema + tab + training-value
                validation, score ≥ 24, human playability review, and{" "}
                <code className="text-xs">pnpm migrate:exercises</code> to prod.
              </p>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
