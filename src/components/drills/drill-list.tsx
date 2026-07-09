"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const EXERCISE_TYPE_LABEL: Record<string, string> = {
  warmup: "Warm-up",
  primary: "Primary",
  secondary: "Secondary",
  accessory: "Accessory",
  isolation: "Isolation",
  test: "Test",
};

export function DrillList() {
  const exercises = useQuery(api.exercises.listExercises);

  if (exercises === undefined) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
        <p className="font-mono text-sm text-muted-foreground">
          No exercises seeded yet.
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground/60">
          Run{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            npx convex run exercises:seedExercises
          </code>{" "}
          to seed exercises.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {exercises.map((ex) => (
        <Link
          key={ex._id}
          href={`/drills/${ex._id}`}
          className="group flex flex-col gap-1 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-border/60 hover:bg-muted/30"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-foreground group-hover:text-primary">
              {ex.title}
            </span>
            <span className="shrink-0 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              {EXERCISE_TYPE_LABEL[ex.exerciseType] ?? ex.exerciseType}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {ex.description}
          </p>
          <div className="mt-1 flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              DIFFICULTY {ex.difficultyLevel}/10
            </span>
            {ex.supportsBpm && ex.defaultTargetBpm && (
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                {ex.defaultTargetBpm} BPM
              </span>
            )}
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              {ex.estimatedMinutes} MIN
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
