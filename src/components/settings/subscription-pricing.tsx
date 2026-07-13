"use client";

import { Button } from "@/components/ui/button";

type SubscriptionPricingProps = {
  billingEnabled: boolean;
};

/**
 * Swap the coming-soon CTA for Clerk `<PricingTable />` when billing is enabled.
 */
export function SubscriptionPricing({ billingEnabled }: SubscriptionPricingProps) {
  if (billingEnabled) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-mono text-sm font-bold tracking-widest text-muted-foreground">
          PRICING TABLE PLACEHOLDER
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Enable Clerk Billing and render{" "}
          <code className="font-mono text-xs">PricingTable</code> here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card px-6 py-8">
      <p className="font-mono text-sm font-bold text-foreground">Upgrade to Pro</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Recurring subscriptions via Clerk Billing are coming soon. Pro unlocks
        extra training sessions, full monthly review history, and complete skill
        exercise history.
      </p>
      <Button type="button" className="mt-6 w-full" disabled>
        Upgrade to Pro — coming soon
      </Button>
    </div>
  );
}
