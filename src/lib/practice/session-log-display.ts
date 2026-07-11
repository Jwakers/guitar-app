import { TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";

export const SUBJECTIVE_QUESTION_LABEL: Record<string, string> = {
  cleanliness: "Cleanliness",
  difficulty: "Difficulty",
  breakdown_cause: "Breakdown",
  noise_control: "Noise control",
};

export type SessionLogSummary = {
  trainingVerdict: string;
  objectiveResult: {
    metric: string;
    targetValue?: number;
    actualValue?: number;
    unit?: string;
  };
  feedbackResponses: Array<{
    questionId: string;
    value: string | number | boolean;
    category: "objective" | "subjective";
  }>;
  isPersonalBest: boolean;
};

export function formatObjectiveMetric(
  log: SessionLogSummary,
  targetBpm?: number,
): string | null {
  const { objectiveResult } = log;
  if (
    objectiveResult.metric === "clean_bpm" &&
    objectiveResult.actualValue !== undefined
  ) {
    const target = targetBpm ?? objectiveResult.targetValue;
    if (target !== undefined) {
      return `${objectiveResult.actualValue} / ${target} BPM`;
    }
    return `${objectiveResult.actualValue} BPM`;
  }

  if (objectiveResult.actualValue !== undefined) {
    const unit = objectiveResult.unit ? ` ${objectiveResult.unit}` : "";
    return `${objectiveResult.actualValue}${unit}`;
  }

  return null;
}

export function formatSubjectiveHighlights(
  log: SessionLogSummary,
): Array<{ label: string; value: string }> {
  return log.feedbackResponses
    .filter(
      (response) =>
        response.category === "subjective" &&
        response.questionId !== "training_verdict",
    )
    .map((response) => ({
      label:
        SUBJECTIVE_QUESTION_LABEL[response.questionId] ??
        response.questionId.replace(/_/g, " "),
      value: formatResponseValue(response.questionId, response.value),
    }));
}

function formatResponseValue(
  questionId: string,
  value: string | number | boolean,
): string {
  if (questionId === "training_verdict" && typeof value === "string") {
    return TRAINING_VERDICT_LABEL[value] ?? value;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return String(value);
  }
  return value.replace(/_/g, " ");
}

export function countVerdicts(
  logs: SessionLogSummary[],
): { nailed: number; nearly: number; needsWork: number } {
  return logs.reduce(
    (counts, log) => {
      if (log.trainingVerdict === "nailed_it") counts.nailed += 1;
      else if (log.trainingVerdict === "nearly_there") counts.nearly += 1;
      else if (log.trainingVerdict === "needs_work") counts.needsWork += 1;
      return counts;
    },
    { nailed: 0, nearly: 0, needsWork: 0 },
  );
}

export function sessionBestBpm(logs: SessionLogSummary[]): number | null {
  let best: number | null = null;
  for (const log of logs) {
    if (
      log.objectiveResult.metric === "clean_bpm" &&
      log.objectiveResult.actualValue !== undefined
    ) {
      if (best === null || log.objectiveResult.actualValue > best) {
        best = log.objectiveResult.actualValue;
      }
    }
  }
  return best;
}
