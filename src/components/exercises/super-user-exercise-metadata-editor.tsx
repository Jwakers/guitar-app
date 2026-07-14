"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useMemo, useState, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  PATTERN_TYPES,
  type ExerciseStatus,
  type ExerciseType,
  type PatternType,
  type PrimaryProgressMetric,
} from "@/lib/exercises/exercise-schema";
import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";
import type { TabData } from "@/lib/tabs/internal-schema";
import type {
  CoreSkill,
  SubSkill,
  TrainingAttribute,
} from "@/lib/skills/taxonomy";
import { cn } from "@/lib/utils";

const EXERCISE_TYPES: ExerciseType[] = [
  "warmup",
  "primary",
  "secondary",
  "accessory",
  "isolation",
  "test",
];

const PRIMARY_PROGRESS_METRICS: PrimaryProgressMetric[] = [
  "clean_bpm",
  "accuracy_score",
  "timing_consistency",
  "control_score",
  "clean_reps",
  "endurance_duration",
  "noise_control",
  "comfort_score",
];

const EXERCISE_STATUSES: ExerciseStatus[] = [
  "active",
  "deprecated",
  "replaced",
];

/** Public exercise shape from getExercise (no adminNotes). */
export type EditableExercise = {
  _id: Id<"exercises">;
  updatedAt: number;
  title: string;
  description: string;
  purpose: string;
  targetWeaknesses: string[];
  minimumCleanStandard: string;
  measurementInstructions: string;
  coachingNotes: string[];
  coreSkillId: CoreSkill;
  subSkillIds: SubSkill[];
  trainingAttributes: TrainingAttribute[];
  difficultyLevel: number;
  exerciseType: ExerciseType;
  primaryProgressMetric: PrimaryProgressMetric;
  supportsBpm: boolean;
  defaultTargetBpm?: number;
  successCriteria: string[];
  commonMistakes: string[];
  progressionRule: string;
  regressionRule: string;
  tabData: TabData;
  patternType: PatternType;
  microDrillJustification?: string;
  feedbackSchema: FeedbackQuestion[];
  estimatedMinutes: number;
  isMvp: boolean;
  status: ExerciseStatus;
  replacedBySlug?: string;
};

type FormState = {
  title: string;
  description: string;
  purpose: string;
  targetWeaknessesText: string;
  minimumCleanStandard: string;
  measurementInstructions: string;
  coachingNotesText: string;
  coreSkillId: CoreSkill;
  subSkillIds: SubSkill[];
  trainingAttributes: TrainingAttribute[];
  difficultyLevel: number;
  exerciseType: ExerciseType;
  primaryProgressMetric: PrimaryProgressMetric;
  supportsBpm: boolean;
  defaultTargetBpm: string;
  successCriteriaText: string;
  commonMistakesText: string;
  progressionRule: string;
  regressionRule: string;
  patternType: PatternType;
  microDrillJustification: string;
  feedbackSchemaJson: string;
  estimatedMinutes: number;
  isMvp: boolean;
  status: ExerciseStatus;
};

function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function listToLines(items: string[]): string {
  return items.join("\n");
}

function exerciseToForm(exercise: EditableExercise): FormState {
  return {
    title: exercise.title,
    description: exercise.description,
    purpose: exercise.purpose,
    targetWeaknessesText: listToLines(exercise.targetWeaknesses),
    minimumCleanStandard: exercise.minimumCleanStandard,
    measurementInstructions: exercise.measurementInstructions,
    coachingNotesText: listToLines(exercise.coachingNotes),
    coreSkillId: exercise.coreSkillId,
    subSkillIds: [...exercise.subSkillIds],
    trainingAttributes: [...exercise.trainingAttributes],
    difficultyLevel: exercise.difficultyLevel,
    exerciseType: exercise.exerciseType,
    primaryProgressMetric: exercise.primaryProgressMetric,
    supportsBpm: exercise.supportsBpm,
    defaultTargetBpm:
      exercise.defaultTargetBpm !== undefined
        ? String(exercise.defaultTargetBpm)
        : "",
    successCriteriaText: listToLines(exercise.successCriteria),
    commonMistakesText: listToLines(exercise.commonMistakes),
    progressionRule: exercise.progressionRule,
    regressionRule: exercise.regressionRule,
    patternType: exercise.patternType,
    microDrillJustification: exercise.microDrillJustification ?? "",
    feedbackSchemaJson: JSON.stringify(exercise.feedbackSchema, null, 2),
    estimatedMinutes: exercise.estimatedMinutes,
    isMvp: exercise.isMvp,
    status: exercise.status,
  };
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

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

const inputClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

const textareaClassName = `${inputClassName} min-h-24 resize-y`;

export function SuperUserExerciseMetadataEditor({
  exercise,
}: {
  exercise: EditableExercise;
}) {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const isSuperUser = user?.isSuperUser === true;

  if (!isSuperUser) {
    return null;
  }

  // Remount when the exercise identity/version changes so form state resets
  // without syncing via useEffect.
  return (
    <SuperUserExerciseMetadataEditorForm
      key={`${exercise._id}-${exercise.updatedAt}`}
      exercise={exercise}
    />
  );
}

function SuperUserExerciseMetadataEditorForm({
  exercise,
}: {
  exercise: EditableExercise;
}) {
  const coreSkills = useQuery(api.skills.listCoreSkills, {});
  const subSkills = useQuery(api.skills.listSubSkills, {
    coreSkillId: undefined,
  });
  const trainingAttributes = useQuery(api.skills.listTrainingAttributes, {});

  const updateMetadata = useMutation(api.exercises.updateExerciseMetadata);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => exerciseToForm(exercise));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSubSkills = useMemo(() => {
    if (!subSkills) return [];
    return subSkills.filter((s) => s.coreSkillId === form.coreSkillId);
  }, [subSkills, form.coreSkillId]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSubSkill = (id: string) => {
    const subId = id as SubSkill;
    setForm((prev) => {
      const exists = prev.subSkillIds.includes(subId);
      return {
        ...prev,
        subSkillIds: exists
          ? prev.subSkillIds.filter((s) => s !== subId)
          : [...prev.subSkillIds, subId],
      };
    });
  };

  const toggleAttribute = (id: string) => {
    const attrId = id as TrainingAttribute;
    setForm((prev) => {
      const exists = prev.trainingAttributes.includes(attrId);
      return {
        ...prev,
        trainingAttributes: exists
          ? prev.trainingAttributes.filter((a) => a !== attrId)
          : [...prev.trainingAttributes, attrId],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let feedbackSchema: FeedbackQuestion[];
      try {
        feedbackSchema = JSON.parse(form.feedbackSchemaJson) as FeedbackQuestion[];
        if (!Array.isArray(feedbackSchema)) {
          throw new Error("feedbackSchema must be a JSON array");
        }
      } catch (parseError) {
        throw new Error(
          parseError instanceof Error
            ? `Invalid feedbackSchema JSON: ${parseError.message}`
            : "Invalid feedbackSchema JSON",
        );
      }

      const bpmRaw = form.defaultTargetBpm.trim();
      const defaultTargetBpm =
        bpmRaw === "" ? undefined : Number(bpmRaw);
      if (
        defaultTargetBpm !== undefined &&
        (!Number.isFinite(defaultTargetBpm) || defaultTargetBpm <= 0)
      ) {
        throw new Error("defaultTargetBpm must be a positive number");
      }

      if (
        !Number.isInteger(form.difficultyLevel) ||
        form.difficultyLevel < 1 ||
        form.difficultyLevel > 10
      ) {
        throw new Error("difficultyLevel must be an integer from 1 to 10");
      }

      await updateMetadata({
        id: exercise._id,
        patch: {
          title: form.title.trim(),
          description: form.description.trim(),
          purpose: form.purpose.trim(),
          targetWeaknesses: linesToList(form.targetWeaknessesText),
          minimumCleanStandard: form.minimumCleanStandard.trim(),
          measurementInstructions: form.measurementInstructions.trim(),
          coachingNotes: linesToList(form.coachingNotesText),
          coreSkillId: form.coreSkillId,
          subSkillIds: form.subSkillIds,
          trainingAttributes: form.trainingAttributes,
          difficultyLevel: form.difficultyLevel,
          exerciseType: form.exerciseType,
          primaryProgressMetric: form.primaryProgressMetric,
          supportsBpm: form.supportsBpm,
          ...(defaultTargetBpm !== undefined ? { defaultTargetBpm } : {}),
          successCriteria: linesToList(form.successCriteriaText),
          commonMistakes: linesToList(form.commonMistakesText),
          progressionRule: form.progressionRule.trim(),
          regressionRule: form.regressionRule.trim(),
          patternType: form.patternType,
          ...(form.microDrillJustification.trim() !== ""
            ? { microDrillJustification: form.microDrillJustification.trim() }
            : {}),
          feedbackSchema,
          estimatedMinutes: form.estimatedMinutes,
          isMvp: form.isMvp,
          status: form.status,
          ...(exercise.replacedBySlug !== undefined
            ? { replacedBySlug: exercise.replacedBySlug }
            : {}),
        },
      });

      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save metadata");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400">
            SUPER USER
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {open ? "Hide metadata editor" : "Edit metadata"}
          </p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-amber-500/20 px-4 py-4">
          <div>
            <p className="mb-4 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              CATALOG FIELDS
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel>Title</FieldLabel>
              <input
                className={inputClassName}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Purpose</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.purpose}
                onChange={(e) => setField("purpose", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Coaching notes (one per line)</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.coachingNotesText}
                onChange={(e) => setField("coachingNotesText", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Target weaknesses (one per line)</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.targetWeaknessesText}
                onChange={(e) =>
                  setField("targetWeaknessesText", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Minimum clean standard</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.minimumCleanStandard}
                onChange={(e) =>
                  setField("minimumCleanStandard", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Measurement instructions</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.measurementInstructions}
                onChange={(e) =>
                  setField("measurementInstructions", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Success criteria (one per line)</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.successCriteriaText}
                onChange={(e) =>
                  setField("successCriteriaText", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Common mistakes (one per line)</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.commonMistakesText}
                onChange={(e) =>
                  setField("commonMistakesText", e.target.value)
                }
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Progression rule</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.progressionRule}
                onChange={(e) => setField("progressionRule", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Regression rule</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.regressionRule}
                onChange={(e) => setField("regressionRule", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Difficulty (1–10)</FieldLabel>
              <input
                type="number"
                min={1}
                max={10}
                className={inputClassName}
                value={form.difficultyLevel}
                onChange={(e) =>
                  setField("difficultyLevel", Number(e.target.value))
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                1–3 start · 4 solid · 5–6 advanced · 7–8 stretch · 9–10 mastery
              </p>
            </div>
            <div>
              <FieldLabel>Estimated minutes</FieldLabel>
              <input
                type="number"
                min={1}
                className={inputClassName}
                value={form.estimatedMinutes}
                onChange={(e) =>
                  setField("estimatedMinutes", Number(e.target.value))
                }
              />
            </div>
            <div>
              <FieldLabel>Exercise type</FieldLabel>
              <select
                className={inputClassName}
                value={form.exerciseType}
                onChange={(e) =>
                  setField("exerciseType", e.target.value as ExerciseType)
                }
              >
                {EXERCISE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Pattern type</FieldLabel>
              <select
                className={inputClassName}
                value={form.patternType}
                onChange={(e) =>
                  setField("patternType", e.target.value as PatternType)
                }
              >
                {PATTERN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Primary progress metric</FieldLabel>
              <select
                className={inputClassName}
                value={form.primaryProgressMetric}
                onChange={(e) =>
                  setField(
                    "primaryProgressMetric",
                    e.target.value as PrimaryProgressMetric,
                  )
                }
              >
                {PRIMARY_PROGRESS_METRICS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                className={inputClassName}
                value={form.status}
                onChange={(e) =>
                  setField("status", e.target.value as ExerciseStatus)
                }
              >
                {EXERCISE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Default target BPM</FieldLabel>
              <input
                type="number"
                min={1}
                className={inputClassName}
                value={form.defaultTargetBpm}
                onChange={(e) => setField("defaultTargetBpm", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Micro-drill justification</FieldLabel>
              <textarea
                className={textareaClassName}
                value={form.microDrillJustification}
                onChange={(e) =>
                  setField("microDrillJustification", e.target.value)
                }
              />
            </div>
            <div>
              <FieldLabel>Supports BPM</FieldLabel>
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  checked={form.supportsBpm}
                  onChange={(e) => setField("supportsBpm", e.target.checked)}
                />
                Yes
              </label>
            </div>
            <div>
              <FieldLabel>MVP</FieldLabel>
              <label className="flex items-center gap-2 font-mono text-sm">
                <input
                  type="checkbox"
                  checked={form.isMvp}
                  onChange={(e) => setField("isMvp", e.target.checked)}
                />
                Yes
              </label>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Core skill</FieldLabel>
              <select
                className={inputClassName}
                value={form.coreSkillId}
                onChange={(e) => {
                  const next = e.target.value as CoreSkill;
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          coreSkillId: next,
                          subSkillIds: [],
                        }
                      : prev,
                  );
                }}
              >
                {(coreSkills ?? []).map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Sub-skills</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {filteredSubSkills.map((skill) => (
                  <ToggleChip
                    key={skill.id}
                    id={skill.id}
                    label={skill.name}
                    selected={form.subSkillIds.includes(skill.id)}
                    onToggle={toggleSubSkill}
                  />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Training attributes</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {(trainingAttributes ?? []).map((attr) => (
                  <ToggleChip
                    key={attr.id}
                    id={attr.id}
                    label={attr.name}
                    selected={form.trainingAttributes.includes(attr.id)}
                    onToggle={toggleAttribute}
                  />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Feedback schema (JSON)</FieldLabel>
              <textarea
                className={`${textareaClassName} min-h-40 font-mono text-xs`}
                value={form.feedbackSchemaJson}
                onChange={(e) =>
                  setField("feedbackSchemaJson", e.target.value)
                }
                spellCheck={false}
              />
            </div>
            </div>
          </div>

          {error && (
            <p className="font-mono text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? "Saving…" : "Save metadata"}
            </Button>
            <p className="font-mono text-[10px] text-muted-foreground">
              Does not edit tab data · bumps version
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
