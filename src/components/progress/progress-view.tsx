"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import { formatObjectiveMetric } from "@/lib/practice/session-log-display";

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

export function ProgressView() {
  const overview = useQuery(api.progress.getProgressOverview);

  if (overview === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const hasAnyData =
    overview.skills.length > 0 ||
    overview.personalBests.length > 0 ||
    overview.reliablePerformance.length > 0 ||
    overview.recentActivity.length > 0;

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          YOUR PROGRESS
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          Progress
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Week of {overview.weekStartDate} · {overview.todayDate}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-2xl font-bold text-foreground">
              {overview.sessionRollup.sessionsCompleted}
            </p>
            <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              SESSIONS THIS WEEK
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-2xl font-bold text-foreground">
              {overview.sessionRollup.totalMinutes}
            </p>
            <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              MINUTES PRACTISED
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-2xl font-bold text-foreground">
              {overview.sessionRollup.personalBestsThisWeek}
            </p>
            <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              PERSONAL BESTS
            </p>
          </div>
        </div>

        {!hasAnyData && (
          <div className="mt-8 rounded-lg border border-border bg-card px-6 py-10 text-center">
            <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground">
              NO PRACTICE DATA YET
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Complete a session and log feedback to see skills, personal bests,
              and reliable performance here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/today">Go to Today</Link>
            </Button>
          </div>
        )}

        {overview.skills.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              SKILLS
            </p>
            <div className="mt-3 space-y-2">
              {overview.skills.map((skill) => (
                <div
                  key={skill.skillTargetKey}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {skill.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-widest text-muted-foreground">
                      {SKILL_STATUS_LABEL[skill.status] ?? skill.status}
                      {skill.trend7Day !== undefined && (
                        <span className="ml-2 text-primary">
                          · 7d {skill.trend7Day > 0 ? "+" : ""}
                          {skill.trend7Day}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-foreground">
                    {skill.rating}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {overview.personalBests.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              PERSONAL BESTS
            </p>
            <div className="mt-3 space-y-2">
              {overview.personalBests.map((entry, index) => {
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

        {overview.reliablePerformance.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              RELIABLE PERFORMANCE
            </p>
            <div className="mt-3 space-y-2">
              {overview.reliablePerformance.map((entry) => {
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

        {overview.recentActivity.length > 0 && (
          <section className="mt-8">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              RECENT ACTIVITY
            </p>
            <div className="mt-3 space-y-2">
              {overview.recentActivity.map((entry, index) => {
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
      </div>
    </main>
  );
}
