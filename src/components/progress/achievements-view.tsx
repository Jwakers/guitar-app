"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MEDAL_STYLES: Record<string, string> = {
  bronze: "border-amber-700/40 bg-amber-950/20 text-amber-600",
  silver: "border-slate-400/40 bg-slate-900/20 text-slate-300",
  gold: "border-yellow-500/40 bg-yellow-950/20 text-yellow-400",
};

export function AchievementsView() {
  const ensureCatalog = useMutation(api.achievements.ensureCatalog);
  const achievements = useQuery(api.achievements.listUserAchievements);
  const seedAttempted = useRef(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const runSeed = useCallback(async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      await ensureCatalog({});
    } catch (err) {
      setSeedError(
        err instanceof Error ? err.message : "Could not load achievements",
      );
      seedAttempted.current = false;
    } finally {
      setSeeding(false);
    }
  }, [ensureCatalog]);

  useEffect(() => {
    if (seedAttempted.current) return;
    seedAttempted.current = true;
    void runSeed();
  }, [runSeed]);

  if (seedError) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
            GAMIFICATION
          </p>
          <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
            Achievements
          </h1>
          <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-8 text-center">
            <p className="font-mono text-sm text-destructive">{seedError}</p>
            <Button
              type="button"
              className="mt-4"
              variant="outline"
              onClick={() => {
                seedAttempted.current = true;
                void runSeed();
              }}
            >
              Retry
            </Button>
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/progress">Back to Progress</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (achievements === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlockedAt !== null,
  ).length;

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          GAMIFICATION
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          Achievements
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Streak counts days you complete practice — missing days don&apos;t
          reduce it until your next session.
        </p>

        {!seeding && achievements.length === 0 && (
          <div className="mt-8 rounded-lg border border-border bg-card px-6 py-10 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Loading medals…
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const unlocked = achievement.unlockedAt !== null;

            return (
              <div
                key={achievement._id}
                className={cn(
                  "rounded-lg border px-4 py-4",
                  unlocked
                    ? MEDAL_STYLES[achievement.medalTier]
                    : "border-border bg-card opacity-60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {achievement.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                    {achievement.medalTier}
                  </span>
                </div>
                {unlocked && achievement.unlockedAt && (
                  <p className="mt-3 font-mono text-[10px] tracking-widest text-muted-foreground">
                    Unlocked{" "}
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(achievement.unlockedAt))}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/progress">Back to Progress</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
