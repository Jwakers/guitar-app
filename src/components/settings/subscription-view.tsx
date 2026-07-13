"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { SubscriptionPricing } from "./subscription-pricing";

const FEATURE_ROWS = [
  {
    label: "Today sessions & core practice",
    free: true,
    pro: true,
  },
  {
    label: "Extra & custom training sessions",
    free: false,
    pro: true,
  },
  {
    label: "Monthly review history",
    free: "Current month",
    pro: "Full history",
  },
  {
    label: "Skill exercise history",
    free: "Last 20 logs",
    pro: "Full history",
  },
  {
    label: "Achievements & streaks",
    free: true,
    pro: true,
  },
] as const;

function formatCell(value: boolean | string): string {
  if (typeof value === "string") {
    return value;
  }
  return value ? "Included" : "—";
}

export function SubscriptionView() {
  const status = useQuery(api.subscriptions.getSubscriptionStatus);
  const billingEnabled =
    process.env.NEXT_PUBLIC_CLERK_BILLING_ENABLED === "true";

  if (status === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const tierLabel = status.tier === "pro" ? "Pro" : "Free";

  return (
    <main className="flex flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <p className="font-mono text-[10px] font-bold tracking-widest text-primary">
          SUBSCRIPTION
        </p>
        <h1 className="mt-2 font-mono text-xl font-bold tracking-tight text-foreground">
          Your plan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your subscription and see what each tier includes.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                CURRENT TIER
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {tierLabel}
              </p>
            </div>
            {status.isSuperUser && (
              <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                ADMIN
              </span>
            )}
          </div>

          {status.billing && (
            <p className="mt-3 border-t border-border pt-3 font-mono text-[10px] tracking-widest text-muted-foreground">
              Clerk plan {status.billing.planSlug} · {status.billing.status}
            </p>
          )}
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-3 border-b border-border bg-muted/30 px-4 py-3 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            <span>FEATURE</span>
            <span className="text-center">FREE</span>
            <span className="text-center">PRO</span>
          </div>
          {FEATURE_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span className="text-sm text-foreground">{row.label}</span>
              <span className="text-center font-mono text-xs text-muted-foreground">
                {formatCell(row.free)}
              </span>
              <span className="text-center font-mono text-xs text-foreground">
                {formatCell(row.pro)}
              </span>
            </div>
          ))}
        </section>

        {status.tier !== "pro" && (
          <section className="mt-8">
            <SubscriptionPricing billingEnabled={billingEnabled} />
          </section>
        )}

        {status.tier === "pro" && billingEnabled && (
          <section className="mt-8">
            <SubscriptionPricing billingEnabled={billingEnabled} />
          </section>
        )}

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link href="/settings">Back to settings</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
