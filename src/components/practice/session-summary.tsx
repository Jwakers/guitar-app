"use client";

import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SLOT_LABEL, SESSION_TYPE_LABEL } from "@/lib/practice/labels";

type SessionSummaryProps = {
  session: {
    _id: Id<"practiceSessions">;
    title: string;
    date: string;
    estimatedMinutes: number;
    sessionType: string;
    exerciseItems: Array<{
      exerciseId: Id<"exercises">;
      order: number;
      slotType: string;
      status: string;
      targetBpm?: number;
    }>;
  };
  exerciseTitleById: Map<Id<"exercises">, string>;
};

export function SessionSummary({
  session,
  exerciseTitleById,
}: SessionSummaryProps) {
  const items = [...session.exerciseItems].sort((a, b) => a.order - b.order);
  const completedCount = items.filter(
    (item) => item.status === "completed" || item.status === "skipped",
  ).length;

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          SESSION COMPLETE
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          {session.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session.date} ·{" "}
          {SESSION_TYPE_LABEL[session.sessionType] ?? session.sessionType} ·{" "}
          {session.estimatedMinutes} min
        </p>

        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          <p className="font-mono text-2xl font-bold text-foreground">
            {completedCount}/{items.length}
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
            EXERCISES COMPLETED
          </p>
        </div>

        <ul className="mt-6 flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={`${item.exerciseId}-${item.order}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="font-mono text-sm font-bold text-foreground">
                  {exerciseTitleById.get(item.exerciseId) ?? "Exercise"}
                </p>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  {SLOT_LABEL[item.slotType]?.toUpperCase() ??
                    item.slotType.toUpperCase()}
                </span>
              </div>
              <span className="font-mono text-[10px] text-primary">
                {item.status === "completed" ? "DONE" : item.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Detailed feedback summary coming soon.
        </p>

        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/today">Back to Today</Link>
        </Button>
      </div>
    </main>
  );
}
