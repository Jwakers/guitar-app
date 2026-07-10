"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";

type TrainingVerdict = "nailed_it" | "nearly_there" | "needs_work";

type FeedbackStepPlaceholderProps = {
  sessionId: Id<"practiceSessions">;
  order: number;
  exerciseTitle: string;
  onBack: () => void;
  onDone: (hasMore: boolean, nextOrder: number | null) => void | Promise<void>;
};

const VERDICT_OPTIONS: TrainingVerdict[] = [
  "nailed_it",
  "nearly_there",
  "needs_work",
];

export function FeedbackStepPlaceholder({
  sessionId,
  order,
  exerciseTitle,
  onBack,
  onDone,
}: FeedbackStepPlaceholderProps) {
  const completeExerciseItem = useMutation(api.sessions.completeExerciseItem);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: wire feedbackSchema → logExerciseResult (dynamic form + exerciseLogs)

  async function submit(
    outcome:
      | { kind: "skipped_feedback" }
      | {
          kind: "placeholder_feedback";
          trainingVerdict?: TrainingVerdict;
        },
  ) {
    setSubmitting(true);
    setError(null);
    try {
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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
        FEEDBACK
      </p>
      <h2 className="mt-2 font-mono text-xl font-bold text-foreground">
        How did that go?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {exerciseTitle}
      </p>

      <div className="mt-8 flex flex-col gap-2">
        {VERDICT_OPTIONS.map((verdict) => (
          <Button
            key={verdict}
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() =>
              void submit({
                kind: "placeholder_feedback",
                trainingVerdict: verdict,
              })
            }
          >
            {TRAINING_VERDICT_LABEL[verdict]}
          </Button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="button"
          disabled={submitting}
          onClick={() => void submit({ kind: "skipped_feedback" })}
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
