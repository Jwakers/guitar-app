import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireCurrentUser } from "./lib/auth";
import { getWeeklyPlanForBlockWeek } from "./lib/weeklyPlanLookup";
import {
  blockDocToSnapshot,
  createCustomSession,
  createExtraSession,
  formatDateInTimezone,
  getActiveBlock,
  loadUserTrainingContext,
  profileDocToSnapshot,
  provisionInitialTraining,
  ratingsToSnapshots,
  SessionBuildError,
} from "./lib/provisionTraining";

async function ensureActiveBlock(
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
): Promise<Doc<"trainingBlocks">> {
  let block = await getActiveBlock(ctx, userId);
  if (!block) {
    await provisionInitialTraining(ctx, userId, now);
    block = await getActiveBlock(ctx, userId);
    if (!block) {
      throw new Error("No active training block. Complete onboarding first.");
    }
  }
  return block;
}

async function appendPlannedSession(
  ctx: MutationCtx,
  weeklyPlan: Doc<"weeklyPlans">,
  sessionId: Id<"practiceSessions">,
): Promise<void> {
  if (!weeklyPlan.plannedSessionIds.includes(sessionId)) {
    await ctx.db.patch("weeklyPlans", weeklyPlan._id, {
      plannedSessionIds: [...weeklyPlan.plannedSessionIds, sessionId],
    });
  }
}

export const generateExtraSession = mutation({
  args: {},
  returns: v.id("practiceSessions"),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const dateString = formatDateInTimezone(now, user.timezone);

    const block = await ensureActiveBlock(ctx, user._id, now);

    const { profile, ratings, exercises } = await loadUserTrainingContext(
      ctx,
      user._id,
    );
    const profileSnapshot = profileDocToSnapshot(profile);

    const weeklyPlan = await getWeeklyPlanForBlockWeek(
      ctx,
      block._id,
      block.currentWeek,
    );
    if (!weeklyPlan) {
      throw new Error("No weekly plan for the current block week.");
    }

    try {
      const sessionId = await createExtraSession(
        ctx,
        user._id,
        block._id,
        weeklyPlan._id,
        dateString,
        profileSnapshot,
        blockDocToSnapshot(block),
        ratingsToSnapshots(ratings),
        exercises,
        now,
      );

      await appendPlannedSession(ctx, weeklyPlan, sessionId);

      return sessionId;
    } catch (error) {
      if (error instanceof SessionBuildError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
});

export const generateCustomSession = mutation({
  args: {
    exerciseIds: v.array(v.id("exercises")),
  },
  returns: v.id("practiceSessions"),
  handler: async (ctx, args) => {
    if (args.exerciseIds.length === 0) {
      throw new Error("Select at least one exercise.");
    }
    if (args.exerciseIds.length > 8) {
      throw new Error("Select up to 8 exercises.");
    }

    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const dateString = formatDateInTimezone(now, user.timezone);

    const block = await ensureActiveBlock(ctx, user._id, now);

    const { profile, exercises } = await loadUserTrainingContext(
      ctx,
      user._id,
    );
    const profileSnapshot = profileDocToSnapshot(profile);

    const weeklyPlan = await getWeeklyPlanForBlockWeek(
      ctx,
      block._id,
      block.currentWeek,
    );
    if (!weeklyPlan) {
      throw new Error("No weekly plan for the current block week.");
    }

    try {
      const sessionId = await createCustomSession(
        ctx,
        user._id,
        block._id,
        weeklyPlan._id,
        dateString,
        args.exerciseIds,
        profileSnapshot,
        blockDocToSnapshot(block),
        exercises,
        now,
      );

      await appendPlannedSession(ctx, weeklyPlan, sessionId);

      return sessionId;
    } catch (error) {
      if (error instanceof SessionBuildError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
});
