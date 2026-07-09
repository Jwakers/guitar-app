import { auth } from "@clerk/nextjs/server";

/** JWT for authenticated Convex calls from Next.js server code. */
export async function getConvexToken(): Promise<string | undefined> {
  return (await (await auth()).getToken({ template: "convex" })) ?? undefined;
}
