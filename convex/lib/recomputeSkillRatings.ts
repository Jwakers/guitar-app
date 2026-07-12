import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  isCoreSkill,
  isSubSkill,
  skillTargetKey,
  type SkillTarget,
} from "../../src/lib/skills/taxonomy";
import {
  recomputeSkillRating,
  type SkillRatingLogSnapshot,
} from "../../src/lib/training-engine/skill-ratings";

/** Enough logs for rating window plus 30-day trend comparison. */
export const SKILL_RATING_LOG_LIMIT = 100;

/** Wider fetch for sub-skill filtering over recent user history. */
export const SUB_SKILL_LOG_FETCH_LIMIT = 250;

export type SkillRatingChange = {
  skillTargetKey: string;
  skillTarget: SkillTarget;
  oldRating: number;
  newRating: number;
};

export function exerciseLogToSkillRatingSnapshot(
  log: Doc<"exerciseLogs">,
): SkillRatingLogSnapshot {
  return {
    date: log.date,
    trainingVerdict: log.trainingVerdict,
    objectiveResult: {
      metric: log.objectiveResult.metric,
      targetValue: log.objectiveResult.targetValue,
      actualValue: log.objectiveResult.actualValue,
    },
  };
}

export function parseSkillTargetKey(key: string): SkillTarget | null {
  const colon = key.indexOf(":");
  if (colon === -1) return null;

  const kind = key.slice(0, colon);
  const id = key.slice(colon + 1);

  if (kind === "core" && isCoreSkill(id)) {
    return { kind: "core", id };
  }
  if (kind === "sub" && isSubSkill(id)) {
    return { kind: "sub", id };
  }
  return null;
}

export async function loadLogsForSkillTarget(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  skillTarget: SkillTarget,
): Promise<Doc<"exerciseLogs">[]> {
  if (skillTarget.kind === "core") {
    return await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId_coreSkillId_date", (q) =>
        q.eq("userId", userId).eq("coreSkillId", skillTarget.id),
      )
      .order("desc")
      .take(SKILL_RATING_LOG_LIMIT);
  }

  const logs = await ctx.db
    .query("exerciseLogs")
    .withIndex("by_userId_date", (q) => q.eq("userId", userId))
    .order("desc")
    .take(SUB_SKILL_LOG_FETCH_LIMIT);

  return logs.filter((log) => log.subSkillIds.includes(skillTarget.id));
}

export async function recomputeSkillRatingForTarget(
  ctx: MutationCtx,
  userId: Id<"users">,
  skillTarget: SkillTarget,
  now: number,
): Promise<SkillRatingChange | null> {
  const key = skillTargetKey(skillTarget);
  const logs = await loadLogsForSkillTarget(ctx, userId, skillTarget);

  const existing = await ctx.db
    .query("userSkillRatings")
    .withIndex("by_userId_skillTargetKey", (q) =>
      q.eq("userId", userId).eq("skillTargetKey", key),
    )
    .unique();

  const previousRating = existing?.rating ?? 60;

  const recomputed = recomputeSkillRating({
    logs: logs.map(exerciseLogToSkillRatingSnapshot),
    previousRating,
    previousLastTrainedAt: existing?.lastTrainedAt,
    now,
  });

  const ratingData = {
    userId,
    skillTargetKey: key,
    skillTarget,
    rating: recomputed.rating,
    confidence: recomputed.confidence,
    lastTrainedAt: recomputed.lastTrainedAt,
    trend7Day: recomputed.trend7Day,
    trend30Day: recomputed.trend30Day,
    status: recomputed.status,
  };

  if (existing) {
    await ctx.db.patch("userSkillRatings", existing._id, ratingData);
  } else {
    await ctx.db.insert("userSkillRatings", ratingData);
  }

  if (previousRating === recomputed.rating) {
    return null;
  }

  return {
    skillTargetKey: key,
    skillTarget,
    oldRating: previousRating,
    newRating: recomputed.rating,
  };
}

export async function recomputeSkillRatingsForExercise(
  ctx: MutationCtx,
  userId: Id<"users">,
  exercise: Doc<"exercises">,
  now: number,
): Promise<SkillRatingChange[]> {
  const targets: SkillTarget[] = [
    { kind: "core", id: exercise.coreSkillId },
    ...exercise.subSkillIds.map((id) => ({ kind: "sub" as const, id })),
  ];

  const changes: SkillRatingChange[] = [];

  for (const skillTarget of targets) {
    const change = await recomputeSkillRatingForTarget(
      ctx,
      userId,
      skillTarget,
      now,
    );
    if (change) {
      changes.push(change);
    }
  }

  return changes;
}
