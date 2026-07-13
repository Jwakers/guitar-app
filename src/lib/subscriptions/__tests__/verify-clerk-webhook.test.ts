import { describe, expect, it } from "vitest";
import { verifyClerkWebhookPayload } from "../../../../convex/lib/verifyClerkWebhook";

async function signTestPayload(
  secret: string,
  msgId: string,
  timestamp: string,
  payload: string,
): Promise<string> {
  const secretPart = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const keyBytes = Uint8Array.from(atob(secretPart), (char) => char.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedContent = `${msgId}.${timestamp}.${payload}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(signedContent),
  );
  const encoded = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `v1,${encoded}`;
}

describe("verifyClerkWebhookPayload", () => {
  it("verifies a valid Svix-signed payload", async () => {
    const secret = "whsec_" + btoa("super-secret-key-for-tests!!");
    const payload = JSON.stringify({
      type: "subscription.updated",
      data: { id: "sub_123", status: "active" },
    });
    const msgId = "msg_123";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = await signTestPayload(secret, msgId, timestamp, payload);

    const event = await verifyClerkWebhookPayload(
      payload,
      {
        svixId: msgId,
        svixTimestamp: timestamp,
        svixSignature: signature,
      },
      secret,
    );

    expect(event.type).toBe("subscription.updated");
  });

  it("rejects invalid signatures", async () => {
    const secret = "whsec_" + btoa("super-secret-key-for-tests!!");
    const payload = JSON.stringify({ type: "subscription.updated", data: {} });

    await expect(
      verifyClerkWebhookPayload(
        payload,
        {
          svixId: "msg_123",
          svixTimestamp: String(Math.floor(Date.now() / 1000)),
          svixSignature: "v1,invalid",
        },
        secret,
      ),
    ).rejects.toThrow("Invalid Svix signature");
  });
});
