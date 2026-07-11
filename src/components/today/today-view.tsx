"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  SESSION_TYPE_LABEL,
  SLOT_LABEL,
} from "@/lib/practice/labels";
import { canReplaySession } from "@/lib/practice/player-mode";

export function TodayView() {
  const schedule = useQuery(api.sessions.getScheduleStatus);
  const session = useQuery(api.sessions.getTodaySession);
  const block = useQuery(api.trainingBlocks.getCurrentBlock);
  const exercises = useQuery(api.exercises.listExercises);
  const generateSession = useMutation(api.sessions.generateSession);

  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const generateAttempted = useRef(false);

  const runGenerateSession = useCallback(() => {
    setGenerating(true);
    setError(null);

    void generateSession({})
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Could not generate session",
        );
        generateAttempted.current = false;
      })
      .finally(() => {
        setGenerating(false);
      });
  }, [generateSession]);

  useEffect(() => {
    if (
      schedule === undefined ||
      session === undefined ||
      !schedule.isPracticeDay ||
      session !== null ||
      generateAttempted.current
    ) {
      return;
    }

    generateAttempted.current = true;
    runGenerateSession();
  }, [schedule, session, runGenerateSession]);

  if (
    schedule === undefined ||
    session === undefined ||
    block === undefined ||
    exercises === undefined
  ) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!schedule.isPracticeDay) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
            TODAY
          </h1>
          <div className="mt-8 rounded-lg border border-border bg-card px-6 py-10 text-center">
            <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground">
              REST DAY
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              No session scheduled for today. Recovery is part of the programme.
            </p>
            {schedule.nextPracticeDay && (
              <p className="mt-4 font-mono text-xs text-primary">
                Next session: {schedule.nextPracticeDay.dayName} (
                {schedule.nextPracticeDay.dateString})
              </p>
            )}
          </div>
          {block && (
            <p className="mt-6 text-center font-mono text-[10px] tracking-widest text-muted-foreground">
              {block.title.toUpperCase()} · WEEK {block.currentWeek}
            </p>
          )}
        </div>
      </main>
    );
  }

  if (generating || (session === null && !error)) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">
          Building today&apos;s session…
        </p>
      </div>
    );
  }

  if (error || session === null) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
            TODAY
          </h1>
          <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-8 text-center">
            <p className="font-mono text-sm text-destructive">
              {error ??
                "No session available. Add MVP drills to your Convex deployment."}
            </p>
            {error && (
              <Button
                type="button"
                className="mt-4"
                variant="outline"
                onClick={() => {
                  generateAttempted.current = true;
                  runGenerateSession();
                }}
              >
                Try again
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const exerciseTitleById = new Map(
    exercises.map((ex) => [ex._id, ex.title]),
  );

  const ctaLabel =
    session.status === "completed"
      ? "View summary"
      : session.status === "active"
        ? "Continue session"
        : "Start session";

  const showReplay =
    schedule !== undefined &&
    canReplaySession({
      sessionStatus: session.status,
      sessionDate: session.date,
      todayDate: schedule.todayDate,
    });

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
            TODAY
          </h1>
          {block && (
            <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              {block.title.toUpperCase()} · WEEK {block.currentWeek}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">
              {SESSION_TYPE_LABEL[session.sessionType]?.toUpperCase() ??
                session.sessionType.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              {session.estimatedMinutes} MIN
            </span>
          </div>
          <h2 className="font-mono text-base font-bold text-foreground">
            {session.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{session.goal}</p>

          <Button asChild className="mt-5 w-full" size="lg">
            <Link href={`/train/${session._id}`}>{ctaLabel}</Link>
          </Button>

          {showReplay && (
            <Button asChild className="mt-2 w-full" variant="ghost" size="sm">
              <Link href={`/train/${session._id}?replay=1`}>
                Practice again
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            EXERCISES ({session.exerciseItems.length})
          </h3>
          <ul className="flex flex-col gap-2">
            {[...session.exerciseItems]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <li
                  key={`${item.exerciseId}-${item.order}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-foreground">
                      {exerciseTitleById.get(item.exerciseId) ?? "Exercise"}
                    </p>
                    <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                      {SLOT_LABEL[item.slotType]?.toUpperCase() ??
                        item.slotType.toUpperCase()}
                    </span>
                    {item.targetBpm !== undefined && (
                      <p className="mt-0.5 font-mono text-xs text-foreground">
                        Target: {item.targetBpm} BPM
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {item.status === "completed"
                      ? "DONE"
                      : item.status === "active"
                        ? "IN PROGRESS"
                        : item.status.toUpperCase()}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
