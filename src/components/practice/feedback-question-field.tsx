"use client";

import { Button } from "@/components/ui/button";
import type { FeedbackQuestion } from "@/lib/exercises/feedback-schema";
import {
  type FeedbackAnswerValue,
  FEEDBACK_QUESTION_ID,
} from "@/lib/practice/feedback-form";
import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";

type FeedbackQuestionFieldProps = {
  question: FeedbackQuestion;
  value: FeedbackAnswerValue | undefined;
  onChange: (value: FeedbackAnswerValue) => void;
  disabled?: boolean;
};

function optionLabel(question: FeedbackQuestion, optionId: string): string {
  if (question.id === FEEDBACK_QUESTION_ID.TRAINING_VERDICT) {
    return TRAINING_VERDICT_LABEL[optionId] ?? optionId;
  }
  return question.options?.find((o) => o.id === optionId)?.label ?? optionId;
}

export function FeedbackQuestionField({
  question,
  value,
  onChange,
  disabled = false,
}: FeedbackQuestionFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
        {question.label.toUpperCase()}
        {question.required ? " *" : ""}
      </p>

      {(question.type === "segmented" || question.type === "choice") && (
        <div className="flex flex-col gap-2">
          {(question.options ?? []).map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={value === option.id ? "default" : "outline"}
              aria-pressed={value === option.id}
              disabled={disabled}
              onClick={() => onChange(option.id)}
            >
              {optionLabel(question, option.id)}
            </Button>
          ))}
        </div>
      )}

      {question.type === "rating" && (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              type="button"
              size="sm"
              variant={value === rating ? "default" : "outline"}
              aria-pressed={value === rating}
              disabled={disabled}
              onClick={() => onChange(rating)}
            >
              {rating}
            </Button>
          ))}
        </div>
      )}

      {question.type === "number" && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              onChange(Math.max(0, (typeof value === "number" ? value : 0) - 1))
            }
          >
            -1
          </Button>
          <p className="font-mono text-2xl font-bold tabular-nums">
            {typeof value === "number" ? value : 0}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              onChange((typeof value === "number" ? value : 0) + 1)
            }
          >
            +1
          </Button>
        </div>
      )}

      {question.type === "boolean" && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={value === true ? "default" : "outline"}
            aria-pressed={value === true}
            disabled={disabled}
            onClick={() => onChange(true)}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={value === false ? "default" : "outline"}
            aria-pressed={value === false}
            disabled={disabled}
            onClick={() => onChange(false)}
          >
            No
          </Button>
        </div>
      )}
    </div>
  );
}
