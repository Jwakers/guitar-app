"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { compareYearMonth } from "@/lib/progress/buildMonthlyReview";

function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function MonthlyReviewView() {
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  const bounds = useQuery(api.reviews.getMonthlyReviewBounds);
  const subscription = useQuery(api.subscriptions.getSubscriptionStatus);

  const year = selectedMonth?.year ?? bounds?.currentYear ?? null;
  const month = selectedMonth?.month ?? bounds?.currentMonth ?? null;

  const review = useQuery(
    api.reviews.getMonthlyReview,
    year !== null && month !== null ? { year, month } : "skip",
  );

  function shiftMonth(delta: number) {
    if (year === null || month === null) return;
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  const canGoPrev =
    bounds !== undefined &&
    year !== null &&
    month !== null &&
    subscription?.entitlements.monthlyReviewHistory === true &&
    compareYearMonth(year, month, bounds.earliestYear, bounds.earliestMonth) >
      0;

  const showHistoryUpsell =
    subscription !== undefined &&
    !subscription.entitlements.monthlyReviewHistory &&
    bounds !== undefined &&
    compareYearMonth(
      bounds.earliestYear,
      bounds.earliestMonth,
      bounds.currentYear,
      bounds.currentMonth,
    ) < 0;

  const canGoNext =
    bounds !== undefined &&
    year !== null &&
    month !== null &&
    compareYearMonth(year, month, bounds.currentYear, bounds.currentMonth) < 0;

  if (
    review === undefined ||
    bounds === undefined ||
    subscription === undefined ||
    year === null ||
    month === null
  ) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          MONTHLY REVIEW
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
            {monthLabel(year, month)}
          </h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => shiftMonth(-1)}
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => shiftMonth(1)}
            >
              Next
            </Button>
          </div>
        </div>

        {showHistoryUpsell && (
          <p className="mt-4 text-sm text-muted-foreground">
            Pro unlocks full monthly review history.{" "}
            <Link
              href="/settings/subscription"
              className="font-mono text-xs text-primary underline-offset-4 hover:underline"
            >
              View subscription
            </Link>
          </p>
        )}

        {!review && (
          <div className="mt-8 rounded-lg border border-border bg-card px-6 py-10 text-center">
            <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground">
              NO PRACTICE DATA
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Complete sessions this month to generate your training report.
            </p>
            <Button asChild className="mt-6">
              <Link href="/today">Go to Today</Link>
            </Button>
          </div>
        )}

        {review && (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              A concise summary of how you trained this month.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <StatCard label="Practice days" value={review.practiceDays} />
              <StatCard label="Total minutes" value={review.totalMinutes} />
              <StatCard
                label="Sessions completed"
                value={review.sessionsCompleted}
              />
              <StatCard
                label="Exercises completed"
                value={review.exercisesCompleted}
              />
              <StatCard
                label="Personal bests"
                value={review.personalBestCount}
              />
              <StatCard
                label="Achievements unlocked"
                value={review.achievementsUnlocked}
              />
              <StatCard
                label="Longest streak"
                value={review.longestStreak}
              />
              <StatCard
                label="Consistency"
                value={`${review.consistencyPercent}%`}
              />
            </div>

            <section className="mt-8 space-y-4">
              {review.mostImprovedLabel && (
                <InsightCard
                  title="Most improved"
                  body={review.mostImprovedLabel}
                />
              )}
              {review.weakestLabel && (
                <InsightCard title="Weakest skill" body={review.weakestLabel} />
              )}
              <InsightCard
                title="Recommended focus"
                body={review.recommendedNextFocus}
              />
            </section>
          </>
        )}

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/progress">Back to Progress</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
        {label.toUpperCase()}
      </p>
    </div>
  );
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
        {title.toUpperCase()}
      </p>
      <p className="mt-2 text-sm text-foreground">{body}</p>
    </div>
  );
}
