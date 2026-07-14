"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ExerciseDetailSections } from "@/components/exercises/exercise-detail-sections";
import {
  coreSkillLabel,
  subSkillLabel,
  trainingAttributeLabel,
} from "@/lib/skills/taxonomy";

interface DrillViewProps {
  id: string;
}

export function DrillView({ id }: DrillViewProps) {
  const exercise = useQuery(api.exercises.getExercise, {
    id: id as Id<"exercises">,
  });

  if (exercise === undefined) {
    return <DrillViewSkeleton />;
  }

  if (exercise === null) {
    return (
      <main className="py-8">
        <div className="mx-auto w-full max-w-6xl px-4">
          <p className="font-mono text-sm text-muted-foreground">
            Exercise not found.
          </p>
          <Link
            href="/drills"
            className="mt-4 inline-block font-mono text-xs text-primary hover:underline"
          >
            ← Back to drills
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Link
          href="/drills"
          className="mb-6 inline-block font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          ← DRILLS
        </Link>

        <div className="mb-6">
          <div className="mb-1 flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              {exercise.exerciseType.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              DIFFICULTY {exercise.difficultyLevel}/10
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              {exercise.estimatedMinutes} MIN
            </span>
            {exercise.supportsBpm && exercise.defaultTargetBpm && (
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {exercise.defaultTargetBpm} BPM
              </span>
            )}
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded border border-border px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              CORE SKILL: {coreSkillLabel(exercise.coreSkillId).toUpperCase()}
            </span>
            {exercise.subSkillIds.map((subId) => (
              <span
                key={subId}
                className="rounded border border-border px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground"
              >
                SUB-SKILL: {subSkillLabel(subId).toUpperCase()}
              </span>
            ))}
            {exercise.trainingAttributes.map((attrId) => (
              <span
                key={attrId}
                className="rounded border border-border px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground"
              >
                {trainingAttributeLabel(attrId).toUpperCase()}
              </span>
            ))}
          </div>
          <div className="max-w-2xl">
            <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
              {exercise.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {exercise.description}
            </p>
          </div>
        </div>
      </div>

      <ExerciseDetailSections
        exercise={exercise}
        purpose={exercise.purpose}
        minimumCleanStandard={exercise.minimumCleanStandard}
        measurementInstructions={exercise.measurementInstructions}
        coachingNotes={exercise.coachingNotes}
        successCriteria={exercise.successCriteria}
        showSuccessCriteria
      />

      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="max-w-2xl">
          <section className="mb-6">
            <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              COMMON MISTAKES
            </h2>
            <ul className="flex flex-col gap-1.5">
              {exercise.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="shrink-0 text-destructive">×</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </section>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                PROGRESSION
              </h2>
              <p className="text-sm text-foreground">{exercise.progressionRule}</p>
            </section>
            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                REGRESSION
              </h2>
              <p className="text-sm text-foreground">{exercise.regressionRule}</p>
            </section>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground/40">
            id: {exercise._id}
          </p>
        </div>
      </div>
    </main>
  );
}

function DrillViewSkeleton() {
  return (
    <main className="py-8">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-6 h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="mb-6 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </main>
  );
}
