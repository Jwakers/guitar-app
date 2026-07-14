import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { remapDifficultyLevel } from "../src/lib/admin/remap-difficulty";

const REMAP_CONFIRMATION = "REMAP_DIFFICULTY_SCALE_V1" as const;

/**
 * One-shot: remap exercise difficultyLevel from the old mid-heavy scale
 * onto intermediate-start → mastery. Patches only difficulty + version/updatedAt.
 *
 * Run once on the authoring (dev) deployment:
 *   npx convex run migrateDifficultyScale:remapDifficultyLevels '{"confirm":"REMAP_DIFFICULTY_SCALE_V1"}'
 *
 * Not idempotent if re-run after a successful first pass — do not run twice.
 */
export const remapDifficultyLevels = internalMutation({
  args: {
    confirm: v.literal(REMAP_CONFIRMATION),
  },
  returns: v.object({
    updated: v.number(),
    unchanged: v.number(),
    byFromTo: v.array(
      v.object({
        from: v.number(),
        to: v.number(),
        count: v.number(),
      }),
    ),
  }),
  handler: async (ctx) => {
    let updated = 0;
    let unchanged = 0;
    const tally = new Map<string, { from: number; to: number; count: number }>();

    // One-shot catalog remap; exercise catalog is intentionally bounded.
    const exercises = await ctx.db.query("exercises").collect();

    for (const exercise of exercises) {
      const from = exercise.difficultyLevel;
      const to = remapDifficultyLevel(from);
      if (to === from) {
        unchanged++;
        continue;
      }

      await ctx.db.patch("exercises", exercise._id, {
        difficultyLevel: to,
        version: exercise.version + 1,
        updatedAt: Date.now(),
      });
      updated++;

      const key = `${from}->${to}`;
      const existing = tally.get(key);
      if (existing) {
        existing.count++;
      } else {
        tally.set(key, { from, to, count: 1 });
      }
    }

    const byFromTo = [...tally.values()].sort(
      (a, b) => a.from - b.from || a.to - b.to,
    );

    return { updated, unchanged, byFromTo };
  },
});
