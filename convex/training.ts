import { v } from "convex/values";
import { mutation } from "./_generated/server";
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
import type { Id } from "./_generated/dataModel";

export const generateExtraSession = mutation({
  args: {},
  returns: v.id("practiceSessions"),
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const dateString = formatDateInTimezone(now, user.timezone);

    let block = await getActiveBlock(ctx, user._id);
    if (!block) {
      await provisionInitialTraining(ctx, user._id, now);
      block = await getActiveBlock(ctx, user._id);
      if (!block) {
        throw new Error("No active training block. Complete onboarding first.");
      }
    }

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

      if (!weeklyPlan.plannedSessionIds.includes(sessionId)) {
        await ctx.db.patch("weeklyPlans", weeklyPlan._id, {
          plannedSessionIds: [...weeklyPlan.plannedSessionIds, sessionId],
        });
      }

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

    let block = await getActiveBlock(ctx, user._id);
    if (!block) {
      await provisionInitialTraining(ctx, user._id, now);
      block = await getActiveBlock(ctx, user._id);
      if (!block) {
        throw new Error("No active training block. Complete onboarding first.");
      }
    }

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
        args.exerciseIds as Id<"exercises">[],
        profileSnapshot,
        blockDocToSnapshot(block),
        exercises,
        now,
      );

      if (!weeklyPlan.plannedSessionIds.includes(sessionId)) {
        await ctx.db.patch("weeklyPlans", weeklyPlan._id, {
          plannedSessionIds: [...weeklyPlan.plannedSessionIds, sessionId],
        });
      }

      return sessionId;
    } catch (error) {
      if (error instanceof SessionBuildError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
});
