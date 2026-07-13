export type PendingSessionCandidate = {
  status: "planned" | "active" | "completed" | "skipped";
  createdAt: number;
};

export function pickNewestPendingSession<T extends PendingSessionCandidate>(
  sessions: T[],
): T | null {
  const pending = sessions.filter(
    (session) => session.status === "planned" || session.status === "active",
  );
  return pending.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
}
