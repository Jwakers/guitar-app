"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { resolveInitialBpm } from "@/lib/metronome/defaults";
import { SLOT_LABEL, TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import {
  deriveCurrentIndex,
  initialPracticePhase,
  type PracticePhase,
} from "@/lib/practice/player-state";
import { resolvePlayerMode, type PlayerMode } from "@/lib/practice/player-mode";
import { ExerciseStep } from "./exercise-step";
import { FeedbackStep } from "./feedback-step";
import { SessionSummary } from "./session-summary";

type PracticePlayerProps = {
  sessionId: string;
  replay?: boolean;
};

export function PracticePlayer({ sessionId, replay = false }: PracticePlayerProps) {
  const session = useQuery(api.sessions.getSession, {
    sessionId: sessionId as Id<"practiceSessions">,
  });
  const schedule = useQuery(api.sessions.getScheduleStatus);
  const exercises = useQuery(api.exercises.listExercises);
  const sessionLogs = useQuery(
    api.sessions.getSessionLogs,
    session
      ? { sessionId: session._id }
      : "skip",
  );
  const startSession = useMutation(api.sessions.startSession);

  const [phase, setPhase] = useState<PracticePhase>("exercise");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replayComplete, setReplayComplete] = useState(false);
  const initializedSessionId = useRef<string | null>(null);

  const [currentBpm, setCurrentBpm] = useState(120);
  const [peakBpm, setPeakBpm] = useState(120);

  const playerMode: PlayerMode | null = useMemo(() => {
    if (!session || schedule === undefined) return null;
    return resolvePlayerMode({
      sessionStatus: session.status,
      sessionDate: session.date,
      todayDate: schedule.todayDate,
      replayRequested: replay,
    });
  }, [session, schedule, replay]);

  const sortedItems = useMemo(() => {
    if (!session) return [];
    return [...session.exerciseItems].sort((a, b) => a.order - b.order);
  }, [session]);

  const currentItem = sortedItems[currentIndex];
  const currentExercise = useQuery(
    api.exercises.getExercise,
    currentItem ? { id: currentItem.exerciseId } : "skip",
  );

  const logsByOrder = useMemo(() => {
    const map = new Map<number, NonNullable<typeof sessionLogs>[number]>();
    if (!sessionLogs) return map;
    for (const log of sessionLogs) {
      map.set(log.sessionItemOrder, log);
    }
    return map;
  }, [sessionLogs]);

  useEffect(() => {
    if (!session || playerMode === null) return;
    if (initializedSessionId.current === session._id) return;
    initializedSessionId.current = session._id;

    if (playerMode === "replay") {
      setCurrentIndex(0);
      setPhase("exercise");
      setReplayComplete(false);
      return;
    }

    const index = deriveCurrentIndex(session.exerciseItems);
    setCurrentIndex(index >= 0 ? index : 0);
    setPhase(initialPracticePhase(session.exerciseItems, session.status));
  }, [session, playerMode]);

  useEffect(() => {
    if (!session || playerMode !== "live") return;
    if (session.status === "completed") {
      setPhase("summary");
    }
  }, [session?.status, playerMode, session]);

  useEffect(() => {
    if (!currentItem || !currentExercise) return;
    const initial = resolveInitialBpm(currentItem, currentExercise);
    setCurrentBpm(initial);
    setPeakBpm(initial);
  }, [currentItem?.order, currentExercise?._id, currentItem, currentExercise]);

  useEffect(() => {
    if (!session || started || playerMode !== "live") return;
    if (session.status !== "planned") {
      setStarted(true);
      return;
    }

    setStarted(true);
    void startSession({ sessionId: session._id }).catch((err) => {
      setError(
        err instanceof Error ? err.message : "Could not start session",
      );
    });
  }, [session, started, startSession, playerMode]);

  const handleBpmChange = useCallback((bpm: number) => {
    setCurrentBpm(bpm);
    setPeakBpm((prev) => Math.max(prev, bpm));
  }, []);

  const handleExerciseComplete = useCallback(() => {
    if (playerMode === "replay") {
      if (currentIndex < sortedItems.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setReplayComplete(true);
      }
      return;
    }
    setPhase("feedback");
  }, [playerMode, currentIndex, sortedItems.length]);

  const handleFeedbackBack = useCallback(() => {
    setPhase("exercise");
  }, []);

  const handleExerciseBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setPhase("exercise");
    }
  }, [currentIndex]);

  const handleReturnToCurrent = useCallback(() => {
    if (!session) return;
    const index = deriveCurrentIndex(session.exerciseItems);
    if (index >= 0) {
      setCurrentIndex(index);
    }
    setPhase("exercise");
  }, [session]);

  const completeSession = useMutation(api.sessions.completeSession);

  const handleFeedbackDone = useCallback(
    async (hasMore: boolean, nextOrder: number | null) => {
      if (hasMore && nextOrder !== null) {
        const nextIndex = sortedItems.findIndex((item) => item.order === nextOrder);
        setCurrentIndex(nextIndex >= 0 ? nextIndex : currentIndex + 1);
        setPhase("exercise");
        return;
      }

      if (session) {
        await completeSession({ sessionId: session._id });
      }
      setPhase("summary");
    },
    [completeSession, currentIndex, session, sortedItems],
  );

  if (
    session === undefined ||
    exercises === undefined ||
    schedule === undefined ||
    playerMode === null
  ) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (session === null) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="font-mono text-sm text-muted-foreground">
            Session not found.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/today">Back to Today</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="font-mono text-sm text-destructive">{error}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/today">Back to Today</Link>
          </Button>
        </div>
      </main>
    );
  }

  const exerciseTitleById = new Map(
    exercises.map((ex) => [ex._id, ex.title]),
  );

  if (playerMode === "summary" && phase === "summary") {
    return (
      <SessionSummary
        session={session}
        exerciseTitleById={exerciseTitleById}
        logsByOrder={logsByOrder}
      />
    );
  }

  if (playerMode === "replay" && replayComplete) {
    return (
      <main className="flex flex-1 flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
            REPLAY COMPLETE
          </p>
          <h1 className="mt-2 font-mono text-xl font-bold text-foreground">
            Nice work practising again
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your logged results from this morning are unchanged.
          </p>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/today">Back to Today</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!currentItem) {
    return (
      <SessionSummary
        session={session}
        exerciseTitleById={exerciseTitleById}
        logsByOrder={logsByOrder}
      />
    );
  }

  const isReviewingPast =
    playerMode === "live" &&
    (currentItem.status === "completed" || currentItem.status === "skipped");

  const loggedResult = logsByOrder.get(currentItem.order);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-4 py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              EXERCISE {currentIndex + 1} OF {sortedItems.length}
            </p>
            <p className="font-mono text-xs text-primary">
              {SLOT_LABEL[currentItem.slotType]?.toUpperCase() ??
                currentItem.slotType.toUpperCase()}
            </p>
            {playerMode === "replay" && (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Replay mode — your logged results won&apos;t change
              </p>
            )}
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/today">Exit</Link>
          </Button>
        </div>
      </div>

      {phase === "exercise" && currentExercise && (
        <ExerciseStep
          exercise={currentExercise}
          sessionItem={currentItem}
          isReviewingPast={isReviewingPast}
          canGoBack={currentIndex > 0}
          playerMode={playerMode}
          loggedResult={loggedResult}
          metronomeKey={`${currentItem.order}-${playerMode}`}
          onBpmChange={handleBpmChange}
          onBack={handleExerciseBack}
          onReturnToCurrent={handleReturnToCurrent}
          onComplete={handleExerciseComplete}
        />
      )}

      {phase === "feedback" &&
        playerMode === "live" &&
        currentExercise && (
          <FeedbackStep
            sessionId={session._id}
            order={currentItem.order}
            exerciseTitle={
              exerciseTitleById.get(currentItem.exerciseId) ?? "Exercise"
            }
            exercise={currentExercise}
            currentBpm={currentBpm}
            peakBpm={peakBpm}
            targetBpm={currentItem.targetBpm}
            onBack={handleFeedbackBack}
            onDone={handleFeedbackDone}
          />
        )}
    </main>
  );
}
