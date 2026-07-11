"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";
import {
  needsBpmConfirmation,
  suggestedCleanBpmOptions,
} from "@/lib/practice/bpm-confirmation";
import {
  buildResponsesFromAnswers,
  extractActualBpm,
  extractTrainingVerdict,
  getRenderableQuestions,
  getVisibleQuestions,
  isBpmExercise,
  schemaHasBpmQuestion,
  validateRequired,
  type FeedbackAnswers,
  type FeedbackResponseEntry,
} from "@/lib/practice/feedback-form";
import type { TrainingVerdict } from "@/lib/practice/labels";
import { FeedbackQuestionField } from "./feedback-question-field";

type FeedbackStepProps = {
  sessionId: Id<"practiceSessions">;
  order: number;
  exerciseTitle: string;
  exercise: {
    supportsBpm: boolean;
    primaryProgressMetric: string;
    feedbackSchema: FeedbackQuestion[];
  };
  currentBpm: number;
  peakBpm: number;
  targetBpm?: number;
  onBack: () => void;
  onDone: (hasMore: boolean, nextOrder: number | null) => void | Promise<void>;
};

type Phase = "form" | "confirm_bpm" | "pick_higher" | "adjust";

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
  const [answers, setAnswers] = useState<FeedbackAnswers>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [manualBpm, setManualBpm] = useState(currentBpm);

  const schema = exercise.feedbackSchema;
  const visibleQuestions = useMemo(
    () => getVisibleQuestions(schema, answers),
    [schema, answers],
  );
  const renderableQuestions = useMemo(
    () => getRenderableQuestions(schema, answers),
    [schema, answers],
  );

  const usesBpm =
    isBpmExercise(exercise) && schemaHasBpmQuestion(schema);
  const needsBpmStep = usesBpm && visibleQuestions.some((q) => q.id === "actual_bpm");

  function setAnswer(questionId: string, value: FeedbackAnswers[string]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function finish(
    outcome:
      | { kind: "skipped_feedback" }
      | { kind: "placeholder_feedback"; trainingVerdict?: TrainingVerdict },
    logArgs?: {
      trainingVerdict?: TrainingVerdict;
      actualBpm?: number;
      peakBpmAttempted?: number;
      feedbackResponses?: FeedbackResponseEntry[];
    },
  ) {
    setSubmitting(true);
    setError(null);
    try {
      if (logArgs) {
        await logExerciseResult({
          sessionId,
          order,
          trainingVerdict: logArgs.trainingVerdict,
          actualBpm: logArgs.actualBpm,
          peakBpmAttempted: logArgs.peakBpmAttempted,
          feedbackResponses: logArgs.feedbackResponses,
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

  async function submitWithAnswers(finalAnswers: FeedbackAnswers) {
    const visible = getVisibleQuestions(schema, finalAnswers);
    const trainingVerdict = extractTrainingVerdict(finalAnswers);
    const actualBpm = extractActualBpm(finalAnswers);

    await finish(
      {
        kind: "placeholder_feedback",
        trainingVerdict,
      },
      {
        trainingVerdict,
        actualBpm,
        peakBpmAttempted: peakBpm,
        feedbackResponses: buildResponsesFromAnswers(visible, finalAnswers),
      },
    );
  }

  async function submitWithBpm(actualBpm: number) {
    const finalAnswers: FeedbackAnswers = {
      ...answers,
      actual_bpm: actualBpm,
    };
    await submitWithAnswers(finalAnswers);
  }

  function handleContinue() {
    const validationError = validateRequired(visibleQuestions, answers, {
      excludeDeferred: true,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (needsBpmStep) {
      setPhase("confirm_bpm");
      return;
    }

    void submitWithAnswers(answers);
  }

  const verdict = extractTrainingVerdict(answers);
  const showBpmConfirm =
    phase === "confirm_bpm" &&
    verdict !== undefined &&
    needsBpmConfirmation(currentBpm, peakBpm);
  const showSimpleBpmConfirm =
    phase === "confirm_bpm" &&
    verdict !== undefined &&
    !needsBpmConfirmation(currentBpm, peakBpm);

  if (phase === "confirm_bpm" && verdict && showBpmConfirm) {
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
            onClick={() => void submitWithBpm(currentBpm)}
          >
            {currentBpm} BPM — yes, that was my highest clean
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setPhase("pick_higher")}
          >
            I played cleaner higher
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={() => setPhase("adjust")}
          >
            Adjust manually
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-6"
          disabled={submitting}
          onClick={() => setPhase("form")}
        >
          Back to feedback
        </Button>
        {error && (
          <p className="mt-4 font-mono text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  if (phase === "pick_higher" && verdict) {
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
              onClick={() => void submitWithBpm(bpm)}
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
          onClick={() => setPhase("confirm_bpm")}
        >
          Back
        </Button>
      </div>
    );
  }

  if (phase === "adjust" && verdict) {
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
          onClick={() => void submitWithBpm(manualBpm)}
        >
          Confirm {manualBpm} BPM
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-4"
          disabled={submitting}
          onClick={() => setPhase("confirm_bpm")}
        >
          Back
        </Button>
      </div>
    );
  }

  if (phase === "confirm_bpm" && verdict && showSimpleBpmConfirm) {
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
            onClick={() => void submitWithBpm(currentBpm)}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => {
              setManualBpm(currentBpm);
              setPhase("adjust");
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
          onClick={() => setPhase("form")}
        >
          Back to feedback
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

      <div className="mt-8 flex flex-col gap-6">
        {renderableQuestions.map((question) => (
          <FeedbackQuestionField
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => setAnswer(question.id, value)}
            disabled={submitting}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          disabled={submitting || renderableQuestions.length === 0}
          onClick={handleContinue}
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="outline"
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
