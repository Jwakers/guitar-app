"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import { formatObjectiveMetric } from "@/lib/practice/session-log-display";
import { ExerciseHistoryList } from "@/components/progress/exercise-history-list";

const SKILL_STATUS_LABEL: Record<string, string> = {
  weak: "Weak",
  developing: "Developing",
  stable: "Stable",
  strong: "Strong",
  maintenance: "Maintenance",
};

function formatPerformanceValue(
  performance?: { value: number; unit: string },
): string | null {
  if (!performance) return null;
  return `${performance.value} ${performance.unit}`;
}

function formatLogDate(dateMs: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateMs));
}

function formatTrend(value: number | undefined): string | null {
  if (value === undefined || value === 0) return null;
  return `${value > 0 ? "+" : ""}${value}`;
}

type SkillTargetViewProps = {
  skillTargetKey: string;
};

export function SkillTargetView({ skillTargetKey }: SkillTargetViewProps) {
  const detail = useQuery(api.progression.getSkillTargetDetail, {
    skillTargetKey,
  });

  if (detail === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (detail === null) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="font-mono text-sm text-muted-foreground">
            Skill not found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/progress">Back to Progress</Link>
          </Button>
        </div>
      </main>
    );
  }

  const trend7 = formatTrend(detail.trend7Day);
  const trend30 = formatTrend(detail.trend30Day);

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/progress"
          className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← PROGRESS
        </Link>

        <p className="mt-4 font-mono text-[10px] font-bold tracking-widest text-primary">
          SKILL TARGET
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          {detail.label}
        </h1>

        {detail.rating !== null && (
          <div className="mt-6 rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-3xl font-bold text-foreground">
                  {detail.rating}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
                  {detail.status
                    ? (SKILL_STATUS_LABEL[detail.status] ?? detail.status)
                    : "—"}
                  {detail.confidence !== null && (
                    <span className="ml-2">
                      · confidence {Math.round(detail.confidence * 100)}%
                    </span>
                  )}
                </p>
              </div>
              {(trend7 || trend30) && (
                <div className="text-right font-mono text-xs text-primary">
                  {trend7 && <p>7d {trend7}</p>}
                  {trend30 && <p>30d {trend30}</p>}
                </div>
              )}
            </div>
            {detail.lastTrainedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Last trained {formatLogDate(detail.lastTrainedAt)}
              </p>
            )}
          </div>
        )}

        {detail.personalBests.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              PERSONAL BESTS
            </p>
            <div className="mt-3 space-y-2">
              {detail.personalBests.map((entry, index) => {
                const metric = formatObjectiveMetric({
                  trainingVerdict: entry.trainingVerdict,
                  objectiveResult: entry.objectiveResult,
                  feedbackResponses: [],
                  isPersonalBest: true,
                });

                return (
                  <div
                    key={`${entry.exerciseId}-${entry.date}-${index}`}
                    className="rounded-lg border border-primary/30 bg-card px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {entry.exerciseTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatLogDate(entry.date)}
                        </p>
                      </div>
                      {metric && (
                        <p className="font-mono text-sm font-bold text-primary">
                          {metric}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {detail.reliablePerformance.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              RELIABLE PERFORMANCE
            </p>
            <div className="mt-3 space-y-2">
              {detail.reliablePerformance.map((entry) => {
                const reliable = formatPerformanceValue(
                  entry.reliablePerformance,
                );
                const peak = formatPerformanceValue(entry.peakPerformance);

                return (
                  <div
                    key={entry.exerciseId}
                    className="rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <p className="font-mono text-sm font-bold text-foreground">
                      {entry.exerciseTitle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                      {reliable && <span>Reliable: {reliable}</span>}
                      {peak && <span>Peak: {peak}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {detail.recentActivity.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              RECENT ACTIVITY
            </p>
            <div className="mt-3 space-y-2">
              {detail.recentActivity.map((entry, index) => {
                const metric = formatObjectiveMetric({
                  trainingVerdict: entry.trainingVerdict,
                  objectiveResult: entry.objectiveResult,
                  feedbackResponses: [],
                  isPersonalBest: entry.isPersonalBest,
                });
                const verdictLabel =
                  TRAINING_VERDICT_LABEL[entry.trainingVerdict] ??
                  entry.trainingVerdict;

                return (
                  <div
                    key={`${entry.exerciseId}-${entry.date}-${index}`}
                    className="rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">
                          {entry.exerciseTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatLogDate(entry.date)} · {verdictLabel}
                          {entry.isPersonalBest && (
                            <span className="ml-2 text-primary">PB</span>
                          )}
                        </p>
                      </div>
                      {metric && (
                        <p className="font-mono text-xs text-foreground">
                          {metric}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8">
          <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            EXERCISE HISTORY
          </p>
          <div className="mt-3">
            <ExerciseHistoryList skillTargetKey={skillTargetKey} />
          </div>
        </section>
      </div>
    </main>
  );
}
