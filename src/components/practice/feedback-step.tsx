"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import {
  exerciseUsesBpmMetric,
  needsBpmConfirmation,
  suggestedCleanBpmOptions,
} from "@/lib/practice/bpm-confirmation";

type TrainingVerdict = "nailed_it" | "nearly_there" | "needs_work";

type FeedbackStepProps = {
  sessionId: Id<"practiceSessions">;
  order: number;
  exerciseTitle: string;
  exercise: {
    supportsBpm: boolean;
    primaryProgressMetric: string;
    feedbackSchema: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
    }>;
  };
  currentBpm: number;
  peakBpm: number;
  targetBpm?: number;
  onBack: () => void;
  onDone: (hasMore: boolean, nextOrder: number | null) => void | Promise<void>;
};

const VERDICT_OPTIONS: TrainingVerdict[] = [
  "nailed_it",
  "nearly_there",
  "needs_work",
];

type BpmStep = "verdict" | "confirm_bpm" | "pick_higher" | "adjust";

export function FeedbackStep({
  sessionId,
  order,
  exerciseTitle,
  exercise,
  currentBpm,
  peakBpm,
  targetBpm,
  onBack,
  onDone,
}: FeedbackStepProps) {
  const logExerciseResult = useMutation(api.sessions.logExerciseResult);
  const completeExerciseItem = useMutation(api.sessions.completeExerciseItem);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<TrainingVerdict | null>(null);
  const [bpmStep, setBpmStep] = useState<BpmStep>("verdict");
  const [manualBpm, setManualBpm] = useState(currentBpm);

  const usesBpm = exerciseUsesBpmMetric(exercise);
  const showBpmConfirm =
    usesBpm && verdict !== null && needsBpmConfirmation(currentBpm, peakBpm);
  const showSimpleBpmConfirm =
    usesBpm && verdict !== null && !needsBpmConfirmation(currentBpm, peakBpm);

  async function finish(
    outcome:
      | { kind: "skipped_feedback" }
      | { kind: "placeholder_feedback"; trainingVerdict?: TrainingVerdict },
    logArgs?: {
      trainingVerdict?: TrainingVerdict;
      actualBpm?: number;
      peakBpmAttempted?: number;
      skipped?: boolean;
    },
  ) {
    setSubmitting(true);
    setError(null);
    try {
      if (logArgs) {
        await logExerciseResult({
          sessionId,
          order,
          ...logArgs,
        });
      }

      const result = await completeExerciseItem({
        sessionId,
        order,
        outcome,
      });
      await onDone(result.hasMoreExercises, result.nextOrder);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save progress",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function submitWithBpm(
    selectedVerdict: TrainingVerdict,
    actualBpm: number,
  ) {
    await finish(
      {
        kind: "placeholder_feedback",
        trainingVerdict: selectedVerdict,
      },
      {
        trainingVerdict: selectedVerdict,
        actualBpm,
        peakBpmAttempted: peakBpm,
      },
    );
  }

  function handleVerdictSelect(selected: TrainingVerdict) {
    setVerdict(selected);
    if (!usesBpm) {
      void finish(
        { kind: "placeholder_feedback", trainingVerdict: selected },
        { trainingVerdict: selected },
      );
      return;
    }

    if (needsBpmConfirmation(currentBpm, peakBpm)) {
      setBpmStep("confirm_bpm");
      return;
    }

    setBpmStep("confirm_bpm");
  }

  if (bpmStep === "confirm_bpm" && verdict && showBpmConfirm) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          CONFIRM TEMPO
        </p>
        <h2 className="mt-2 font-mono text-xl font-bold text-foreground">
          Highest clean BPM?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You reached <strong>{peakBpm} BPM</strong> this round. The metronome
          is now at <strong>{currentBpm} BPM</strong>.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void submitWithBpm(verdict, currentBpm)}
          >
            {currentBpm} BPM — yes, that was my highest clean
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setBpmStep("pick_higher")}
          >
            I played cleaner higher
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => setBpmStep("adjust")}
          >
            Adjust manually
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-6"
          disabled={submitting}
          onClick={onBack}
        >
          Back to exercise
        </Button>
        {error && (
          <p className="mt-4 font-mono text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  if (bpmStep === "pick_higher" && verdict) {
    const options = suggestedCleanBpmOptions(peakBpm, targetBpm);
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          CONFIRM TEMPO
        </p>
        <h2 className="mt-2 font-mono text-xl font-bold text-foreground">
          Pick your highest clean tempo
        </h2>
        <div className="mt-8 flex flex-col gap-2">
          {options.map((bpm) => (
            <Button
              key={bpm}
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => void submitWithBpm(verdict, bpm)}
            >
              {bpm} BPM
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-6"
          disabled={submitting}
          onClick={() => setBpmStep("confirm_bpm")}
        >
          Back
        </Button>
      </div>
    );
  }

  if (bpmStep === "adjust" && verdict) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          CONFIRM TEMPO
        </p>
        <h2 className="mt-2 font-mono text-xl font-bold text-foreground">
          Enter highest clean BPM
        </h2>
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setManualBpm((b) => Math.max(20, b - 1))}
          >
            -1
          </Button>
          <p className="font-mono text-2xl font-bold tabular-nums">{manualBpm}</p>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setManualBpm((b) => Math.min(300, b + 1))}
          >
            +1
          </Button>
        </div>
        <Button
          type="button"
          className="mt-8"
          disabled={submitting}
          onClick={() => void submitWithBpm(verdict, manualBpm)}
        >
          Confirm {manualBpm} BPM
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-4"
          disabled={submitting}
          onClick={() => setBpmStep("confirm_bpm")}
        >
          Back
        </Button>
      </div>
    );
  }

  if (bpmStep === "confirm_bpm" && verdict && showSimpleBpmConfirm) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          CONFIRM TEMPO
        </p>
        <h2 className="mt-2 font-mono text-xl font-bold text-foreground">
          {currentBpm} BPM — was this your highest clean tempo?
        </h2>
        <div className="mt-8 flex flex-col gap-2">
          <Button
            type="button"
            disabled={submitting}
            onClick={() => void submitWithBpm(verdict, currentBpm)}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => {
              setManualBpm(currentBpm);
              setBpmStep("adjust");
            }}
          >
            Adjust
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-6"
          disabled={submitting}
          onClick={onBack}
        >
          Back to exercise
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
        FEEDBACK
      </p>
      <h2 className="mt-2 font-mono text-xl font-bold text-foreground">
        How did that go?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{exerciseTitle}</p>

      <div className="mt-8 flex flex-col gap-2">
        {VERDICT_OPTIONS.map((option) => (
          <Button
            key={option}
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleVerdictSelect(option)}
          >
            {TRAINING_VERDICT_LABEL[option]}
          </Button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          disabled={submitting}
          onClick={() => void finish({ kind: "skipped_feedback" })}
        >
          Skip for now
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={submitting}
          onClick={onBack}
        >
          Back to exercise
        </Button>
      </div>

      {error && (
        <p className="mt-4 font-mono text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
