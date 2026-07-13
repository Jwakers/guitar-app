import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import {
  getBlockConfig,
  scaleSessionPattern,
} from "../../src/lib/training-engine/block-types";
import { buildSession, SessionBuildError } from "../../src/lib/training-engine/build-session";
import {
  generateTargets,
  reasonCodesFromScore,
} from "../../src/lib/training-engine/generate-targets";
import {
  addWeeksMs,
  formatDateInTimezone,
  getDayNameInTimezone,
  isPracticeDay,
  nextPracticeDay,
} from "../../src/lib/training-engine/dates";
import { selectInitialBlock } from "../../src/lib/training-engine/select-initial-block";
import { DEFAULT_SESSIONS_PER_WEEK } from "../../src/lib/training-engine/constants";
import type {
  BlockSnapshot,
  BlockType,
  ExerciseCandidate,
  SkillRatingSnapshot,
  UserProfileSnapshot,
} from "../../src/lib/training-engine/types";
import { getWeeklyPlanForBlockWeek } from "./weeklyPlanLookup";
import { loadUserExerciseStates } from "./recomputeExerciseState";

export function exerciseDocToCandidate(doc: Doc<"exercises">): ExerciseCandidate {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    coreSkillId: doc.coreSkillId,
    subSkillIds: doc.subSkillIds,
    exerciseType: doc.exerciseType,
    difficultyLevel: doc.difficultyLevel,
    primaryProgressMetric: doc.primaryProgressMetric,
    supportsBpm: doc.supportsBpm,
    defaultTargetBpm: doc.defaultTargetBpm,
    estimatedMinutes: doc.estimatedMinutes,
    isMvp: doc.isMvp,
    status: doc.status,
  };
}

export function profileDocToSnapshot(
  profile: Doc<"userProfiles">,
): UserProfileSnapshot {
  return {
    primaryGoals: profile.primaryGoals,
    focusCoreSkillIds: profile.focusCoreSkillIds,
    focusSubSkillIds: profile.focusSubSkillIds,
    availableDays: profile.availableDays,
    sessionsPerWeek: profile.sessionsPerWeek ?? DEFAULT_SESSIONS_PER_WEEK,
    defaultSessionLengthMinutes: profile.defaultSessionLengthMinutes,
    preferredIntensity: profile.preferredIntensity,
  };
}

export function ratingsToSnapshots(
  ratings: Doc<"userSkillRatings">[],
): SkillRatingSnapshot[] {
  return ratings.map((r) => ({
    skillTarget: r.skillTarget,
    rating: r.rating,
    status: r.status,
  }));
}

export function blockDocToSnapshot(block: Doc<"trainingBlocks">): BlockSnapshot {
  return {
    blockType: block.blockType as BlockType,
    title: block.title,
    primaryGoal: block.primaryGoal,
    focusCoreSkillIds: block.focusCoreSkillIds,
    focusSubSkillIds: block.focusSubSkillIds,
    supportCoreSkillIds: block.supportCoreSkillIds,
    supportSubSkillIds: block.supportSubSkillIds,
    intensity: block.intensity,
    currentWeek: block.currentWeek,
  };
}

export async function loadUserTrainingContext(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const user = await ctx.db.get("users", userId);
  if (!user) throw new Error("User not found");

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();
  if (!profile) throw new Error("User profile not found");

  const ratings = await ctx.db
    .query("userSkillRatings")
    .withIndex("by_userId_skillTargetKey", (q) => q.eq("userId", userId))
    .collect();

  const exercises = await ctx.db.query("exercises").collect();

  return {
    user,
    profile,
    ratings,
    exercises: exercises.map(exerciseDocToCandidate),
  };
}

export async function getActiveBlock(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("trainingBlocks")
    .withIndex("by_userId_status", (q) =>
      q.eq("userId", userId).eq("status", "active"),
    )
    .first();
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function sessionTypeForDate(
  dateMs: number,
  timezone: string,
  profile: UserProfileSnapshot,
  blockType: BlockType,
): { sessionType: import("../../src/lib/training-engine/types").SessionType; dayName: string } {
  const dayName = getDayNameInTimezone(dateMs, timezone);
  const config = getBlockConfig(blockType);
  const sessionsPerWeek = profile.sessionsPerWeek ?? 7;
  const pattern = scaleSessionPattern(
    config.weekOneSessionPattern,
    sessionsPerWeek,
  );
  const dayIndex = DAY_NAMES.indexOf(dayName as (typeof DAY_NAMES)[number]);
  const index = dayIndex >= 0 ? dayIndex % pattern.length : 0;
  return { sessionType: pattern[index] ?? "standard", dayName };
}

/**
 * Idempotently create initial block, week-1 plan, and first practice session.
 */
export async function provisionInitialTraining(
  ctx: MutationCtx,
  userId: Id<"users">,
  now: number,
): Promise<{
  blockId: Id<"trainingBlocks">;
  weeklyPlanId: Id<"weeklyPlans">;
  sessionId?: Id<"practiceSessions">;
}> {
  const { user, profile, ratings, exercises } =
    await loadUserTrainingContext(ctx, userId);

  let block = await getActiveBlock(ctx, userId);
  if (!block) {
    const selection = selectInitialBlock(
      profileDocToSnapshot(profile),
      ratingsToSnapshots(ratings),
    );
    const startDate = now;
    const endDate = addWeeksMs(startDate, selection.durationWeeks);

    const blockId = await ctx.db.insert("trainingBlocks", {
      userId,
      title: selection.title,
      blockType: selection.blockType,
      startDate,
      endDate,
      durationWeeks: selection.durationWeeks,
      primaryGoal: selection.primaryGoal,
      focusCoreSkillIds: selection.focusCoreSkillIds,
      focusSubSkillIds: selection.focusSubSkillIds,
      supportCoreSkillIds: selection.supportCoreSkillIds,
      supportSubSkillIds: selection.supportSubSkillIds,
      status: "active",
      currentWeek: 1,
      intensity: selection.intensity,
      deloadWeek: selection.deloadWeek,
    });
    block = (await ctx.db.get("trainingBlocks", blockId))!;
  }

  let weeklyPlan = await getWeeklyPlanForBlockWeek(ctx, block._id, 1);

  if (!weeklyPlan) {
    const config = getBlockConfig(block.blockType as BlockType);
    const weekStart = block.startDate;
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000 - 1;

    const weeklyPlanId = await ctx.db.insert("weeklyPlans", {
      blockId: block._id,
      userId,
      weekNumber: 1,
      startDate: weekStart,
      endDate: weekEnd,
      theme: config.weekOneTheme,
      targetSessionCount: profile.sessionsPerWeek ?? DEFAULT_SESSIONS_PER_WEEK,
      plannedSessionIds: [],
      status: "active",
    });
    weeklyPlan = (await ctx.db.get("weeklyPlans", weeklyPlanId))!;
  }

  const profileSnapshot = profileDocToSnapshot(profile);
  const sessionMeta = sessionTypeForDate(
    now,
    user.timezone,
    profileSnapshot,
    block.blockType as BlockType,
  );

  let sessionId: Id<"practiceSessions"> | undefined;
  const dateString = formatDateInTimezone(now, user.timezone);
  const existingSession = await ctx.db
    .query("practiceSessions")
    .withIndex("by_userId_date", (q) =>
      q.eq("userId", userId).eq("date", dateString),
    )
    .first();

  if (!existingSession) {
    sessionId = await createSessionForDate(
      ctx,
      userId,
      block._id,
      weeklyPlan._id,
      dateString,
      sessionMeta.sessionType,
      profileSnapshot,
      blockDocToSnapshot(block),
      ratingsToSnapshots(ratings),
      exercises,
      now,
    );

    await ctx.db.patch("weeklyPlans", weeklyPlan._id, {
      plannedSessionIds: [...weeklyPlan.plannedSessionIds, sessionId],
    });
  } else {
    sessionId = existingSession._id;
  }

  return {
    blockId: block._id,
    weeklyPlanId: weeklyPlan._id,
    sessionId,
  };
}

export async function createSessionForDate(
  ctx: MutationCtx,
  userId: Id<"users">,
  blockId: Id<"trainingBlocks">,
  weeklyPlanId: Id<"weeklyPlans">,
  dateString: string,
  sessionType: import("../../src/lib/training-engine/types").SessionType,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  ratings: SkillRatingSnapshot[],
  exercises: ExerciseCandidate[],
  now: number,
): Promise<Id<"practiceSessions">> {
  const exerciseStates = await loadUserExerciseStates(ctx, userId);
  const built = buildSession(
    sessionType,
    profile,
    block,
    ratings,
    exercises,
    exerciseStates,
  );

  return await ctx.db.insert("practiceSessions", {
    userId,
    blockId,
    weeklyPlanId,
    date: dateString,
    title: built.title,
    goal: built.goal,
    estimatedMinutes: built.estimatedMinutes,
    status: "planned",
    sessionType: built.sessionType,
    exerciseItems: built.exerciseItems,
    createdAt: now,
  });
}

export async function createExtraSession(
  ctx: MutationCtx,
  userId: Id<"users">,
  blockId: Id<"trainingBlocks">,
  weeklyPlanId: Id<"weeklyPlans">,
  dateString: string,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  ratings: SkillRatingSnapshot[],
  exercises: ExerciseCandidate[],
  now: number,
): Promise<Id<"practiceSessions">> {
  const shorterProfile: UserProfileSnapshot = {
    ...profile,
    defaultSessionLengthMinutes: Math.min(
      30,
      Math.max(15, Math.round(profile.defaultSessionLengthMinutes * 0.6)),
    ),
  };

  return await createSessionForDate(
    ctx,
    userId,
    blockId,
    weeklyPlanId,
    dateString,
    "maintenance",
    shorterProfile,
    block,
    ratings,
    exercises,
    now,
  );
}

export async function createCustomSession(
  ctx: MutationCtx,
  userId: Id<"users">,
  blockId: Id<"trainingBlocks">,
  weeklyPlanId: Id<"weeklyPlans">,
  dateString: string,
  exerciseIds: Id<"exercises">[],
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  exercises: ExerciseCandidate[],
  now: number,
): Promise<Id<"practiceSessions">> {
  if (exerciseIds.length === 0) {
    throw new SessionBuildError("Select at least one exercise.");
  }

  const exerciseStates = await loadUserExerciseStates(ctx, userId);
  const byId = new Map(exercises.map((exercise) => [exercise._id, exercise]));
  const exerciseItems: import("../../src/lib/training-engine/types").SessionExerciseItem[] =
    [];

  for (let order = 0; order < exerciseIds.length; order++) {
    const exerciseId = exerciseIds[order]!;
    const exercise = byId.get(exerciseId);
    if (!exercise) {
      throw new SessionBuildError("One or more selected exercises are unavailable.");
    }

    const targets = generateTargets(exercise, {
      sessionType: "maintenance",
      userState: exerciseStates.get(exerciseId),
    });

    const breakdown = {
      goalMatch: 1,
      weaknessMatch: 0,
      blockRelevance: 1,
      readiness: 1,
      progressionNeed: 0,
      maintenanceNeed: 0,
      variety: 0,
      penalties: 0,
      total: 3,
    };

    exerciseItems.push({
      exerciseId,
      slotType: order === 0 ? "primary" : "secondary",
      order,
      targetMetric: targets.targetMetric,
      targetValue: targets.targetValue,
      targetBpm: targets.targetBpm,
      durationMinutes: targets.durationMinutes,
      status: "pending",
      reasonCodes: reasonCodesFromScore(breakdown),
      scoreBreakdown: breakdown,
    });
  }

  const estimatedMinutes = exerciseItems.reduce(
    (sum, item) => sum + item.durationMinutes,
    0,
  );

  return await ctx.db.insert("practiceSessions", {
    userId,
    blockId,
    weeklyPlanId,
    date: dateString,
    title: "Custom Practice",
    goal: `Focused practice on ${exerciseItems.length} selected exercise${exerciseItems.length === 1 ? "" : "s"}.`,
    estimatedMinutes,
    status: "planned",
    sessionType: "maintenance",
    exerciseItems,
    createdAt: now,
  });
}

export { SessionBuildError, nextPracticeDay, isPracticeDay, formatDateInTimezone };
