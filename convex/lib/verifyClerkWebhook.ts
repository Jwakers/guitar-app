const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function parseSignatures(header: string): string[] {
  return header
    .split(" ")
    .map((entry) => entry.split(",")[1])
    .filter((signature): signature is string => Boolean(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function signPayload(
  secret: string,
  msgId: string,
  timestamp: string,
  payload: string,
): Promise<string> {
  const secretPart = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const keyBytes = decodeBase64(secretPart);
  const keyBuffer = new Uint8Array(keyBytes).buffer as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
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

  return encodeBase64(signature);
}

export async function verifyClerkWebhookPayload(
  payload: string,
  headers: {
    svixId: string;
    svixTimestamp: string;
    svixSignature: string;
  },
  secret: string,
): Promise<{ type: string; data: unknown }> {
  if (!headers.svixId || !headers.svixTimestamp || !headers.svixSignature) {
    throw new Error("Missing Svix headers");
  }

  const timestamp = Number.parseInt(headers.svixTimestamp, 10);
  if (!Number.isFinite(timestamp)) {
    throw new Error("Invalid Svix timestamp");
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new Error("Svix timestamp outside tolerance");
  }

  const expectedSignature = await signPayload(
    secret,
    headers.svixId,
    headers.svixTimestamp,
    payload,
  );
  const signatures = parseSignatures(headers.svixSignature);
  const verified = signatures.some((signature) =>
    timingSafeEqual(signature, expectedSignature),
  );

  if (!verified) {
    throw new Error("Invalid Svix signature");
  }

  return JSON.parse(payload) as { type: string; data: unknown };
}
