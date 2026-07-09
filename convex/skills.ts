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
    const skills = await ctx.db.query("skills").collect();
    return skills.sort((a, b) => a.sortOrder - b.sortOrder);
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
 * Seed / refresh the skills table from SKILLS_SEED.
 * Idempotent — inserts missing skills; patches description/category/flags for
 * existing rows matched by name so taxonomy copy can evolve.
 * Run via: npx convex run skills:seedSkills
 */
export const seedSkills = internalMutation({
  args: {},
  returns: v.object({
    inserted: v.number(),
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("skills").collect();
    const byName = new Map(existing.map((s) => [s.name, s]));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const skill of SKILLS_SEED) {
      const row = byName.get(skill.name);
      if (!row) {
        await ctx.db.insert("skills", skill);
        inserted++;
        continue;
      }

      const unchanged =
        row.description === skill.description &&
        row.category === skill.category &&
        row.isMvp === skill.isMvp &&
        row.sortOrder === skill.sortOrder;

      if (unchanged) {
        skipped++;
      } else {
        await ctx.db.patch(row._id, {
          description: skill.description,
          category: skill.category,
          isMvp: skill.isMvp,
          sortOrder: skill.sortOrder,
        });
        updated++;
      }
    }

    return { inserted, updated, skipped };
  },
});
