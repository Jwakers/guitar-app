"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

const EXERCISE_TYPE_LABEL: Record<string, string> = {
  warmup: "Warm-up",
  primary: "Primary",
  secondary: "Secondary",
  accessory: "Accessory",
  isolation: "Isolation",
  test: "Test",
};

type ExerciseListItem = FunctionReturnType<
  typeof api.exercises.listExercises
>[number];

type CoreSkillGroup = {
  slug: string;
  name: string;
  sortOrder: number;
  drills: ExerciseListItem[];
};

function groupByCoreSkill(exercises: ExerciseListItem[]): CoreSkillGroup[] {
  const groups = new Map<string, CoreSkillGroup>();

  for (const ex of exercises) {
    const existing = groups.get(ex.coreSkillId);
    if (existing) {
      existing.drills.push(ex);
      continue;
    }
    groups.set(ex.coreSkillId, {
      slug: ex.coreSkillId,
      name: ex.coreSkillName,
      sortOrder: ex.skillSortOrder,
      drills: [ex],
    });
  }

  return [...groups.values()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function DrillList() {
  const exercises = useQuery(api.exercises.listExercises);
  const [selectedCoreSkill, setSelectedCoreSkill] = useState<string>("all");

  const skillGroups = useMemo(
    () => (exercises ? groupByCoreSkill(exercises) : []),
    [exercises],
  );

  const visibleGroups = useMemo(() => {
    if (selectedCoreSkill === "all") return skillGroups;
    return skillGroups.filter((g) => g.slug === selectedCoreSkill);
  }, [skillGroups, selectedCoreSkill]);

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
          More drills coming soon.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Author drills in the admin generator, then run{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              pnpm migrate:exercises
            </code>{" "}
            to promote to production.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter drills by core skill"
      >
        <button
          type="button"
          aria-pressed={selectedCoreSkill === "all"}
          onClick={() => setSelectedCoreSkill("all")}
          className={`font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-md border transition-colors ${
            selectedCoreSkill === "all"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:border-border/60 hover:text-foreground"
          }`}
        >
          All ({exercises.length})
        </button>
        {skillGroups.map((group) => (
          <button
            key={group.slug}
            type="button"
            aria-pressed={selectedCoreSkill === group.slug}
            onClick={() => setSelectedCoreSkill(group.slug)}
            className={`font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-md border transition-colors ${
              selectedCoreSkill === group.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-border/60 hover:text-foreground"
            }`}
          >
            {group.name} ({group.drills.length})
          </button>
        ))}
      </div>

      {visibleGroups.map((group) => (
        <section key={group.slug} className="flex flex-col gap-3">
          <div className="sticky top-0 z-10 -mx-1 border-b border-border bg-background/95 px-1 py-2 backdrop-blur supports-backdrop-filter:bg-background/80">
            <h2 className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
              {group.name}
            </h2>
            <p className="mt-0.5 font-mono text-[10px] tracking-widest text-muted-foreground">
              {group.drills.length}{" "}
              {group.drills.length === 1 ? "DRILL" : "DRILLS"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {group.drills.map((ex) => (
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
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                    {ex.coreSkillName.toUpperCase()}
                  </span>
                  {ex.subSkillNames.length > 0 && (
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      {ex.subSkillNames.join(", ").toUpperCase()}
                    </span>
                  )}
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
        </section>
      ))}
    </div>
  );
}
