import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { SKILLS_SEED } from "../seed/skills";

export const listSkills = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("skills"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      category: v.string(),
      isMvp: v.boolean(),
      sortOrder: v.number(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("skills").order("asc").collect();
  },
});

export const getSkill = query({
  args: { skillId: v.id("skills") },
  returns: v.union(
    v.object({
      _id: v.id("skills"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      category: v.string(),
      isMvp: v.boolean(),
      sortOrder: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get("skills", args.skillId);
  },
});

/**
 * Seed the skills table with the 13 MVP skills.
 * Idempotent — safe to call multiple times; exits early if skills already exist.
 * Run once via: npx convex run skills:seedSkills
 */
export const seedSkills = internalMutation({
  args: {},
  returns: v.object({ seeded: v.number(), skipped: v.boolean() }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("skills").first();
    if (existing) return { seeded: 0, skipped: true };

    for (const skill of SKILLS_SEED) {
      await ctx.db.insert("skills", skill);
    }

    return { seeded: SKILLS_SEED.length, skipped: false };
  },
});
