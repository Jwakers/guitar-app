"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import {
  formatObjectiveMetric,
  type SessionLogSummary,
} from "@/lib/practice/session-log-display";

function formatLogDate(dateMs: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateMs));
}

type ExerciseHistoryListProps = {
  skillTargetKey?: string;
};

export function ExerciseHistoryList({ skillTargetKey }: ExerciseHistoryListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.progression.listExerciseHistory,
    skillTargetKey ? { skillTargetKey } : {},
    { initialNumItems: 10 },
  );

  if (status === "LoadingFirstPage") {
    return (
      <p className="font-mono text-sm text-muted-foreground">Loading history…</p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No practice logs yet for this view.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((entry) => {
        const logSummary: SessionLogSummary = {
          trainingVerdict: entry.trainingVerdict,
          objectiveResult: entry.objectiveResult,
          feedbackResponses: [],
          isPersonalBest: entry.isPersonalBest,
        };
        const metric = formatObjectiveMetric(logSummary);
        const verdictLabel =
          TRAINING_VERDICT_LABEL[entry.trainingVerdict] ??
          entry.trainingVerdict;

        return (
          <div
            key={entry._id}
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
                <p className="font-mono text-xs text-foreground">{metric}</p>
              )}
            </div>
          </div>
        );
      })}

      {status === "CanLoadMore" && (
        <Button
          variant="outline"
          className="mt-2 w-full font-mono text-xs"
          onClick={() => loadMore(10)}
        >
          Load more
        </Button>
      )}
      {status === "LoadingMore" && (
        <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
          Loading more…
        </p>
      )}
    </div>
  );
}
