import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type SessionExerciseItem = Doc<"practiceSessions">["exerciseItems"][number];

const TERMINAL_STATUSES = new Set<SessionExerciseItem["status"]>([
  "completed",
  "skipped",
]);

export function isTerminalStatus(status: SessionExerciseItem["status"]): boolean {
  return TERMINAL_STATUSES.has(status);
}

/** First pending/active item by order; -1 when all items are terminal. */
export function deriveCurrentIndex(items: SessionExerciseItem[]): number {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex(
    (item) => item.status === "pending" || item.status === "active",
  );
  return index;
}

export function sortedExerciseItems(
  items: SessionExerciseItem[],
): SessionExerciseItem[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function patchExerciseItemAtOrder(
  items: SessionExerciseItem[],
  order: number,
  patch: Partial<SessionExerciseItem>,
): SessionExerciseItem[] {
  return items.map((item) =>
    item.order === order ? { ...item, ...patch } : item,
  );
}

export function countTerminalItems(items: SessionExerciseItem[]): number {
  return items.filter((item) => isTerminalStatus(item.status)).length;
}

export async function getSessionForUser(
  ctx: QueryCtx | MutationCtx,
  sessionId: Id<"practiceSessions">,
  userId: Id<"users">,
): Promise<Doc<"practiceSessions">> {
  const session = await ctx.db.get("practiceSessions", sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  if (session.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function applyStartSession(
  session: Doc<"practiceSessions">,
  now: number,
): {
  status: Doc<"practiceSessions">["status"];
  exerciseItems: SessionExerciseItem[];
} {
  if (session.status === "completed" || session.status === "skipped") {
    return { status: session.status, exerciseItems: session.exerciseItems };
  }

  const sorted = sortedExerciseItems(session.exerciseItems);
  const currentIndex = deriveCurrentIndex(sorted);
  if (currentIndex < 0) {
    return { status: "active", exerciseItems: session.exerciseItems };
  }

  const targetOrder = sorted[currentIndex]!.order;
  const exerciseItems = session.exerciseItems.map((item) => {
    if (item.order === targetOrder && item.status === "pending") {
      return { ...item, status: "active" as const, startedAt: now };
    }
    return item;
  });

  return { status: "active", exerciseItems };
}

export type CompleteExerciseOutcome =
  | { kind: "skipped_feedback" }
  | {
      kind: "placeholder_feedback";
      trainingVerdict?: "nailed_it" | "nearly_there" | "needs_work";
    };

export function applyCompleteExerciseItem(
  session: Doc<"practiceSessions">,
  order: number,
  _outcome: CompleteExerciseOutcome,
  now: number,
): {
  exerciseItems: SessionExerciseItem[];
  hasMoreExercises: boolean;
  nextOrder: number | null;
} {
  const item = session.exerciseItems.find((i) => i.order === order);
  if (!item) {
    throw new Error("Exercise item not found");
  }
  if (isTerminalStatus(item.status)) {
    const sorted = sortedExerciseItems(session.exerciseItems);
    const currentIndex = deriveCurrentIndex(sorted);
    const nextOrder =
      currentIndex >= 0 ? (sorted[currentIndex]?.order ?? null) : null;
    return {
      exerciseItems: session.exerciseItems,
      hasMoreExercises: nextOrder !== null,
      nextOrder,
    };
  }

  let exerciseItems = patchExerciseItemAtOrder(session.exerciseItems, order, {
    status: "completed",
    completedAt: now,
  });

  const sorted = sortedExerciseItems(exerciseItems);
  const nextIndex = sorted.findIndex(
    (i) => i.status === "pending" || i.status === "active",
  );

  if (nextIndex >= 0) {
    const nextOrder = sorted[nextIndex]!.order;
    exerciseItems = patchExerciseItemAtOrder(exerciseItems, nextOrder, {
      status: "active",
      startedAt: now,
    });
    return { exerciseItems, hasMoreExercises: true, nextOrder };
  }

  return { exerciseItems, hasMoreExercises: false, nextOrder: null };
}
