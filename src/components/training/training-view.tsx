"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TrainingView() {
  const router = useRouter();
  const block = useQuery(api.trainingBlocks.getCurrentBlock);
  const exercises = useQuery(api.exercises.listExercises);
  const generateExtraSession = useMutation(api.training.generateExtraSession);
  const generateCustomSession = useMutation(api.training.generateCustomSession);

  const [selectedIds, setSelectedIds] = useState<Set<Id<"exercises">>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"extra" | "custom" | null>(null);

  const focusSkillIds = new Set([
    ...(block?.focusCoreSkillIds ?? []),
    ...(block?.focusSubSkillIds ?? []),
  ]);

  const filteredExercises =
    exercises?.filter(
      (exercise) =>
        focusSkillIds.size === 0 ||
        focusSkillIds.has(exercise.coreSkillId) ||
        exercise.subSkillIds.some((id) => focusSkillIds.has(id)),
    ) ?? [];

  function toggleExercise(id: Id<"exercises">) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 8) {
        next.add(id);
      }
      return next;
    });
  }

  async function startExtra() {
    setError(null);
    setLoading("extra");
    try {
      const sessionId = await generateExtraSession({});
      router.push(`/train/${sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start extra session",
      );
    } finally {
      setLoading(null);
    }
  }

  async function startCustom() {
    if (selectedIds.size === 0) {
      setError("Select at least one exercise.");
      return;
    }

    setError(null);
    setLoading("custom");
    try {
      const sessionId = await generateCustomSession({
        exerciseIds: [...selectedIds],
      });
      router.push(`/train/${sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start custom session",
      );
    } finally {
      setLoading(null);
    }
  }

  if (block === undefined || exercises === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          FREE-FORM PRACTICE
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          Training
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start an extra session or build your own from the exercise library.
        </p>

        {block && (
          <p className="mt-2 font-mono text-[10px] tracking-widest text-muted-foreground">
            {block.title.toUpperCase()} · WEEK {block.currentWeek}
          </p>
        )}

        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="font-mono text-sm font-bold text-foreground">
            Quick extra session
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A shorter maintenance session using your current block focus.
          </p>
          <Button
            type="button"
            className="mt-4 w-full"
            disabled={loading !== null}
            onClick={() => void startExtra()}
          >
            {loading === "extra" ? "Starting…" : "Start extra practice"}
          </Button>
        </section>

        <section className="mt-8">
          <h2 className="font-mono text-sm font-bold text-foreground">
            Exercise picker
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select up to 8 exercises for a custom session.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {filteredExercises.map((exercise) => {
              const selected = selectedIds.has(exercise._id);
              return (
                <button
                  key={exercise._id}
                  type="button"
                  onClick={() => toggleExercise(exercise._id)}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-border/60",
                  )}
                >
                  <p className="font-mono text-sm font-bold text-foreground">
                    {exercise.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
                    {exercise.coreSkillName.toUpperCase()} · LVL{" "}
                    {exercise.difficultyLevel}
                  </p>
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            className="mt-4 w-full"
            variant="outline"
            disabled={loading !== null || selectedIds.size === 0}
            onClick={() => void startCustom()}
          >
            {loading === "custom"
              ? "Building session…"
              : `Start custom session (${selectedIds.size})`}
          </Button>
        </section>

        {error && (
          <p className="mt-4 font-mono text-sm text-destructive">{error}</p>
        )}
      </div>
    </main>
  );
}
