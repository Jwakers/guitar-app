"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TabRenderer } from "@/components/tab-renderer/tab-renderer";

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
        <div className="mx-auto w-full max-w-2xl px-4">
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
      <div className="mx-auto w-full max-w-2xl px-4">
        {/* Back link */}
        <Link
          href="/drills"
          className="mb-6 inline-block font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          ← DRILLS
        </Link>

        {/* Header */}
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
          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
            {exercise.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {exercise.description}
          </p>
        </div>
      </div>

      {/* Tab — wider than text content when viewport allows */}
      <section className="mb-8 px-4">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-3 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            TAB
          </h2>
          <TabRenderer tabData={exercise.tabData} />
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl px-4">
      {/* Purpose */}
      <section className="mb-6">
        <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          PURPOSE
        </h2>
        <p className="text-sm text-foreground">{exercise.purpose}</p>
      </section>

      {/* Coaching notes */}
      <section className="mb-6">
        <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          COACHING NOTES
        </h2>
        <ul className="flex flex-col gap-1.5">
          {exercise.coachingNotes.map((note, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span className="shrink-0 font-mono text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {note}
            </li>
          ))}
        </ul>
      </section>

      {/* Success criteria */}
      <section className="mb-6">
        <h2 className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          SUCCESS CRITERIA
        </h2>
        <ul className="flex flex-col gap-1.5">
          {exercise.successCriteria.map((criterion, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span className="shrink-0 text-primary">✓</span>
              {criterion}
            </li>
          ))}
        </ul>
      </section>

      {/* Common mistakes */}
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

      {/* Progression / regression */}
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

      {/* DB ID for debugging */}
      <p className="font-mono text-[10px] text-muted-foreground/40">
        id: {exercise._id}
      </p>
      </div>
    </main>
  );
}

function DrillViewSkeleton() {
  return (
    <main className="py-8">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="mb-6 h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="mb-6 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mb-8 px-4">
        <div className="mx-auto h-40 w-full max-w-6xl animate-pulse rounded-lg bg-muted" />
      </div>
    </main>
  );
}
