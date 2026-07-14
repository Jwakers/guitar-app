"use client";

import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  SLOT_LABEL,
  SESSION_TYPE_LABEL,
  TRAINING_VERDICT_LABEL,
} from "@/lib/practice/labels";
import {
  formatSkillRatingDelta,
  sortSkillRatingChanges,
  type SkillRatingChangeSummary,
} from "@/lib/practice/skill-rating-display";
import { skillTargetLabel } from "@/lib/skills/taxonomy";
import {
  countVerdicts,
  formatObjectiveMetric,
  formatSubjectiveHighlights,
  sessionBestBpm,
  type SessionLogSummary,
} from "@/lib/practice/session-log-display";

type SessionSummaryProps = {
  session: {
    _id: Id<"practiceSessions">;
    title: string;
    date: string;
    estimatedMinutes: number;
    sessionType: string;
    exerciseItems: Array<{
      exerciseId: Id<"exercises">;
      order: number;
      slotType: string;
      status: string;
      targetBpm?: number;
    }>;
  };
  exerciseTitleById: Map<Id<"exercises">, string>;
  logsByOrder?: Map<number, SessionLogSummary>;
  skillRatingChanges?: SkillRatingChangeSummary[];
};

export function SessionSummary({
  session,
  exerciseTitleById,
  logsByOrder,
  skillRatingChanges = [],
}: SessionSummaryProps) {
  const items = [...session.exerciseItems].sort((a, b) => a.order - b.order);
  const completedCount = items.filter(
    (item) => item.status === "completed" || item.status === "skipped",
  ).length;

  const logs = items
    .map((item) => logsByOrder?.get(item.order))
    .filter((log): log is SessionLogSummary => log !== undefined);
  const verdictCounts = countVerdicts(logs);
  const bestBpm = sessionBestBpm(logs);
  const sortedSkillChanges = sortSkillRatingChanges(skillRatingChanges);

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          SESSION COMPLETE
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          {session.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session.date} ·{" "}
          {SESSION_TYPE_LABEL[session.sessionType] ?? session.sessionType} ·{" "}
          {session.estimatedMinutes} min
        </p>

        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <p className="font-mono text-2xl font-bold text-foreground">
            {completedCount}/{items.length}
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
            EXERCISES COMPLETED
          </p>
        </div>

        {logs.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              SESSION ROLLUP
            </p>
            <p className="mt-2 text-sm text-foreground">
              {verdictCounts.nailed} nailed · {verdictCounts.nearly} nearly ·{" "}
              {verdictCounts.needsWork} needs work
            </p>
            {bestBpm !== null && (
              <p className="mt-1 text-sm text-muted-foreground">
                Best clean BPM this session: {bestBpm}
              </p>
            )}
          </div>
        )}

        {sortedSkillChanges.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              SKILL UPDATES
            </p>
            <ul className="mt-3 space-y-2">
              {sortedSkillChanges.map((change) => {
                const delta = change.newRating - change.oldRating;
                const deltaLabel = formatSkillRatingDelta(
                  change.oldRating,
                  change.newRating,
                );

                return (
                  <li
                    key={`${change.skillTarget.kind}:${change.skillTarget.id}`}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-foreground">
                      {skillTargetLabel(change.skillTarget)}
                    </span>
                    <span
                      className={
                        delta > 0
                          ? "font-mono text-primary"
                          : delta < 0
                            ? "font-mono text-destructive"
                            : "font-mono text-muted-foreground"
                      }
                    >
                      {change.oldRating} → {change.newRating} ({deltaLabel})
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <ul className="mt-6 flex flex-col gap-2">
          {items.map((item) => {
            const log = logsByOrder?.get(item.order);
            const objectiveMetric = log
              ? formatObjectiveMetric(log, item.targetBpm)
              : null;
            const subjectiveHighlights = log
              ? formatSubjectiveHighlights(log)
              : [];

            return (
              <li
                key={`${item.exerciseId}-${item.order}`}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {exerciseTitleById.get(item.exerciseId) ?? "Exercise"}
                    </p>
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      {SLOT_LABEL[item.slotType]?.toUpperCase() ??
                        item.slotType.toUpperCase()}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-primary">
                    {item.status === "completed"
                      ? "DONE"
                      : item.status.toUpperCase()}
                  </span>
                </div>

                {log ? (
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                      {TRAINING_VERDICT_LABEL[log.trainingVerdict] ??
                        log.trainingVerdict}
                      {log.isPersonalBest && (
                        <span className="ml-2 font-mono text-[10px] font-bold tracking-widest text-primary">
                          PERSONAL BEST
                        </span>
                      )}
                    </p>
                    {objectiveMetric && <p>{objectiveMetric}</p>}
                    {subjectiveHighlights.map((highlight) => (
                      <p key={highlight.label}>
                        {highlight.label}: {highlight.value}
                      </p>
                    ))}
                  </div>
                ) : item.status === "skipped" ? (
                  <p className="mt-3 text-sm text-muted-foreground">Skipped</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No feedback logged
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/today">Back to Today</Link>
        </Button>
      </div>
    </main>
  );
}
