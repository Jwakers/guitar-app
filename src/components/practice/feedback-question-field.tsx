"use client";

import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";
import {
  type FeedbackAnswerValue,
  FEEDBACK_QUESTION_ID,
} from "@/lib/practice/feedback-form";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import { cn } from "@/lib/utils";

type FeedbackQuestionFieldProps = {
  question: FeedbackQuestion;
  value: FeedbackAnswerValue | undefined;
  onChange: (value: FeedbackAnswerValue) => void;
  disabled?: boolean;
};

const RATING_SCALE_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Very high",
};

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

function optionLabel(question: FeedbackQuestion, optionId: string): string {
  if (question.id === FEEDBACK_QUESTION_ID.TRAINING_VERDICT) {
    return TRAINING_VERDICT_LABEL[optionId] ?? optionId;
  }
  return question.options?.find((o) => o.id === optionId)?.label ?? optionId;
}

function selectedValueLabel(
  question: FeedbackQuestion,
  value: FeedbackAnswerValue | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  if (question.type === "rating" && typeof value === "number") {
    return RATING_SCALE_LABELS[value];
  }
  if (question.type === "boolean") {
    return value ? "Yes" : "No";
  }
  if (
    (question.type === "segmented" || question.type === "choice") &&
    typeof value === "string"
  ) {
    return optionLabel(question, value);
  }
  if (question.type === "number" && typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function unansweredHint(question: FeedbackQuestion): string {
  if (question.type === "rating" || question.type === "number") {
    return "Select a score to continue";
  }
  return "Select an option to continue";
}

function padClass({
  selected,
  unanswered,
}: {
  selected: boolean;
  unanswered: boolean;
}) {
  return cn(
    "flex min-h-12 items-center justify-center rounded-lg border px-3 text-center transition-colors disabled:opacity-50",
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background text-foreground hover:border-primary/50",
    unanswered && !selected && "border-dashed",
  );
}

type OptionPadProps = {
  selected: boolean;
  unanswered: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
};

function OptionPad({
  selected,
  unanswered,
  disabled,
  onClick,
  children,
  className,
}: OptionPadProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(padClass({ selected, unanswered }), className)}
    >
      {children}
    </button>
  );
}

export function FeedbackQuestionField({
  question,
  value,
  onChange,
  disabled = false,
}: FeedbackQuestionFieldProps) {
  const unanswered = question.required && value === undefined;
  const selectionLabel = selectedValueLabel(question, value);
  const options = question.options ?? [];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4",
        unanswered ? "border-primary/60 ring-1 ring-primary/25" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] font-bold tracking-widest text-foreground">
          {question.label.toUpperCase()}
          {question.required ? " *" : ""}
        </p>
        {selectionLabel && (
          <span className="shrink-0 font-mono text-[10px] font-bold tracking-widest text-primary">
            {selectionLabel.toUpperCase()}
          </span>
        )}
      </div>

      {unanswered && (
        <p className="text-sm font-medium text-primary">{unansweredHint(question)}</p>
      )}

      {(question.type === "segmented" || question.type === "choice") && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <OptionPad
              key={option.id}
              selected={value === option.id}
              unanswered={unanswered}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex-1 text-sm font-semibold",
                options.length <= 2 && "min-w-[calc(50%-0.25rem)]",
                options.length === 3 && "min-w-[calc(33.333%-0.35rem)]",
                options.length >= 4 && "min-w-[calc(50%-0.25rem)]",
              )}
            >
              {optionLabel(question, option.id)}
            </OptionPad>
          ))}
        </div>
      )}

      {question.type === "rating" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {RATING_OPTIONS.map((rating) => (
              <OptionPad
                key={rating}
                selected={value === rating}
                unanswered={unanswered}
                disabled={disabled}
                onClick={() => onChange(rating)}
                className="flex-1"
              >
                <span className="font-mono text-lg font-bold tabular-nums">
                  {rating}
                </span>
              </OptionPad>
            ))}
          </div>
          <div className="flex justify-between px-1 font-mono text-[10px] tracking-widest text-muted-foreground">
            <span>1 = LOW</span>
            <span>5 = HIGH</span>
          </div>
        </div>
      )}

      {question.type === "number" && (
        <div className="flex gap-2">
          <OptionPad
            selected={false}
            unanswered={unanswered}
            disabled={disabled}
            onClick={() =>
              onChange(Math.max(0, (typeof value === "number" ? value : 0) - 1))
            }
            className="min-w-16 shrink-0 font-mono text-lg font-bold"
          >
            -1
          </OptionPad>
          <div
            className={cn(
              "flex min-h-12 flex-1 flex-col items-center justify-center rounded-lg border bg-background px-4",
              unanswered ? "border-dashed border-primary/40" : "border-border",
            )}
          >
            <p className="font-mono text-3xl font-bold tabular-nums text-foreground">
              {typeof value === "number" ? value : "—"}
            </p>
            {typeof value !== "number" && (
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                NOT SET
              </p>
            )}
          </div>
          <OptionPad
            selected={false}
            unanswered={unanswered}
            disabled={disabled}
            onClick={() =>
              onChange((typeof value === "number" ? value : 0) + 1)
            }
            className="min-w-16 shrink-0 font-mono text-lg font-bold"
          >
            +1
          </OptionPad>
        </div>
      )}

      {question.type === "boolean" && (
        <div className="flex gap-2">
          <OptionPad
            selected={value === true}
            unanswered={unanswered}
            disabled={disabled}
            onClick={() => onChange(true)}
            className="flex-1 text-sm font-semibold"
          >
            Yes
          </OptionPad>
          <OptionPad
            selected={value === false}
            unanswered={unanswered}
            disabled={disabled}
            onClick={() => onChange(false)}
            className="flex-1 text-sm font-semibold"
          >
            No
          </OptionPad>
        </div>
      )}
    </div>
  );
}
