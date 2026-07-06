import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_authProviderId", (q) =>
      q.eq("authProviderId", identity.subject),
    )
    .unique();

  if (!user) throw new Error("User record not found");
  return user;
}

export async function getCurrentUserOrNull(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_authProviderId", (q) =>
      q.eq("authProviderId", identity.subject),
    )
    .unique();
}
