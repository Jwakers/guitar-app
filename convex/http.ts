import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { verifyClerkWebhookPayload } from "./lib/verifyClerkWebhook";

const http = httpRouter();

type ClerkBillingWebhookPayload = {
  id?: string;
  status?: string;
  payer?: {
    user_id?: string;
    organization_id?: string;
  };
  items?: Array<{
    plan?: {
      slug?: string;
    };
    status?: string;
  }>;
  plan?: {
    slug?: string;
  };
};

const BILLING_SYNC_EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.pastDue",
  "subscriptionItem.canceled",
  "subscriptionItem.ended",
  "subscriptionItem.pastDue",
  "subscriptionItem.active",
  "subscriptionItem.updated",
]);

function extractBillingSyncArgs(data: ClerkBillingWebhookPayload) {
  const clerkUserId = data.payer?.user_id;
  if (!clerkUserId) {
    return null;
  }

  const planSlug =
    data.items?.[0]?.plan?.slug ?? data.plan?.slug ?? undefined;
  const subscriptionStatus =
    data.status ?? data.items?.[0]?.status ?? "unknown";

  return {
    clerkUserId,
    clerkSubscriptionId: data.id,
    clerkPlanSlug: planSlug,
    subscriptionStatus,
  };
}

http.route({
  path: "/clerk-billing-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!webhookSecret) {
      console.warn(
        "Clerk billing webhook received but CLERK_WEBHOOK_SIGNING_SECRET is unset",
      );
      return new Response("Billing webhook not configured", { status: 503 });
    }

    const payload = await request.text();

    let event: { type: string; data: ClerkBillingWebhookPayload };
    try {
      event = (await verifyClerkWebhookPayload(payload, {
        svixId: request.headers.get("svix-id") ?? "",
        svixTimestamp: request.headers.get("svix-timestamp") ?? "",
        svixSignature: request.headers.get("svix-signature") ?? "",
      }, webhookSecret)) as {
        type: string;
        data: ClerkBillingWebhookPayload;
      };
    } catch (error) {
      console.error("Clerk billing webhook verification failed", error);
      return new Response("Invalid signature", { status: 400 });
    }

    if (!BILLING_SYNC_EVENTS.has(event.type)) {
      return new Response(null, { status: 200 });
    }

    const syncArgs = extractBillingSyncArgs(event.data);
    if (!syncArgs) {
      console.warn("Clerk billing webhook missing payer.user_id", event.type);
      return new Response(null, { status: 200 });
    }

    try {
      await ctx.runMutation(
        internal.subscriptions.syncFromClerkBilling,
        syncArgs,
      );
    } catch (error) {
      console.error("Clerk billing sync failed", error);
      return new Response("Sync failed", { status: 500 });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
