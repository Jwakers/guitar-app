export type PracticePhase = "exercise" | "feedback" | "summary";

export type SessionExerciseItemStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped";

export type SessionExerciseItemLike = {
  order: number;
  status: SessionExerciseItemStatus;
};

export function deriveCurrentIndex(
  items: SessionExerciseItemLike[],
): number {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  return sorted.findIndex(
    (item) => item.status === "pending" || item.status === "active",
  );
}

export function allItemsTerminal(items: SessionExerciseItemLike[]): boolean {
  return items.every(
    (item) => item.status === "completed" || item.status === "skipped",
  );
}

export function initialPracticePhase(
  items: SessionExerciseItemLike[],
  sessionStatus: string,
): PracticePhase {
  if (sessionStatus === "completed" || allItemsTerminal(items)) {
    return "summary";
  }
  return "exercise";
}
