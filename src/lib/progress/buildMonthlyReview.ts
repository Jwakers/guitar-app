import type { SkillTarget } from "../skills/taxonomy";

export type MonthlyReviewSkillSnapshot = {
  skillTarget: SkillTarget;
  skillTargetKey: string;
  label: string;
  rating: number;
  trend30Day?: number;
};

export type MonthlyReviewSessionInput = {
  date: string;
  estimatedMinutes: number;
  status: "planned" | "active" | "completed" | "skipped";
};

export type MonthlyReviewLogInput = {
  date: number;
  isPersonalBest: boolean;
};

export type BuildMonthlyReviewInput = {
  year: number;
  month: number;
  timezone: string;
  sessionsPerWeek: number;
  sessions: MonthlyReviewSessionInput[];
  logs: MonthlyReviewLogInput[];
  skillRatings: MonthlyReviewSkillSnapshot[];
  achievementsUnlockedThisMonth: number;
  longestStreakDays: number;
};

export type MonthlyReviewResult = {
  year: number;
  month: number;
  practiceDays: number;
  totalMinutes: number;
  sessionsCompleted: number;
  exercisesCompleted: number;
  mostImprovedSkillTarget?: SkillTarget;
  weakestSkillTarget?: SkillTarget;
  personalBestCount: number;
  achievementsUnlocked: number;
  consistencyPercent: number;
  recommendedNextFocus: string;
  longestStreak: number;
};

export function isTimestampInMonth(
  dateMs: number,
  year: number,
  month: number,
  timezone: string,
): boolean {
  const date = new Date(dateMs);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);

  const dateYear = Number(parts.find((p) => p.type === "year")?.value);
  const dateMonth = Number(parts.find((p) => p.type === "month")?.value);
  return dateYear === year && dateMonth === month;
}

export function isSessionDateInMonth(
  sessionDate: string,
  year: number,
  month: number,
): boolean {
  const parts = sessionDate.split("-");
  if (parts.length !== 3) return false;
  const sessionYear = Number(parts[0]);
  const sessionMonth = Number(parts[1]);
  return sessionYear === year && sessionMonth === month;
}

export type MonthlyReviewBounds = {
  currentYear: number;
  currentMonth: number;
  earliestYear: number;
  earliestMonth: number;
};

export function compareYearMonth(
  yearA: number,
  monthA: number,
  yearB: number,
  monthB: number,
): number {
  if (yearA !== yearB) return yearA - yearB;
  return monthA - monthB;
}

export function computeMonthlyReviewBounds(input: {
  timezone: string;
  now: number;
  sessionDates: string[];
  logDates: number[];
}): MonthlyReviewBounds {
  const currentParts = new Intl.DateTimeFormat("en-US", {
    timeZone: input.timezone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date(input.now));

  const currentYear = Number(
    currentParts.find((p) => p.type === "year")?.value,
  );
  const currentMonth = Number(
    currentParts.find((p) => p.type === "month")?.value,
  );

  let earliestYear = currentYear;
  let earliestMonth = currentMonth;

  for (const sessionDate of input.sessionDates) {
    const parts = sessionDate.split("-");
    if (parts.length !== 3) continue;
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    if (compareYearMonth(year, month, earliestYear, earliestMonth) < 0) {
      earliestYear = year;
      earliestMonth = month;
    }
  }

  for (const logDate of input.logDates) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: input.timezone,
      year: "numeric",
      month: "numeric",
    }).formatToParts(new Date(logDate));
    const year = Number(parts.find((p) => p.type === "year")?.value);
    const month = Number(parts.find((p) => p.type === "month")?.value);
    if (compareYearMonth(year, month, earliestYear, earliestMonth) < 0) {
      earliestYear = year;
      earliestMonth = month;
    }
  }

  return {
    currentYear,
    currentMonth,
    earliestYear,
    earliestMonth,
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function countTargetSessionsForMonth(
  year: number,
  month: number,
  sessionsPerWeek: number,
): number {
  const days = daysInMonth(year, month);
  return Math.max(1, Math.round((sessionsPerWeek / 7) * days));
}

export function buildMonthlyReview(
  input: BuildMonthlyReviewInput,
): MonthlyReviewResult {
  const {
    year,
    month,
    timezone,
    sessionsPerWeek,
    sessions,
    logs,
    skillRatings,
    achievementsUnlockedThisMonth,
    longestStreakDays,
  } = input;

  const completedSessions = sessions.filter(
    (session) =>
      session.status === "completed" &&
      isSessionDateInMonth(session.date, year, month),
  );

  const practiceDaySet = new Set(
    completedSessions.map((session) => session.date),
  );

  const monthLogs = logs.filter((log) =>
    isTimestampInMonth(log.date, year, month, timezone),
  );

  const personalBestCount = monthLogs.filter((log) => log.isPersonalBest).length;

  const totalMinutes = completedSessions.reduce(
    (sum, session) => sum + session.estimatedMinutes,
    0,
  );

  const targetSessions = countTargetSessionsForMonth(
    year,
    month,
    sessionsPerWeek,
  );

  const consistencyPercent =
    targetSessions > 0
      ? Math.min(100, Math.round((practiceDaySet.size / targetSessions) * 100))
      : practiceDaySet.size > 0
        ? 100
        : 0;

  const mostImproved = [...skillRatings]
    .filter((skill) => (skill.trend30Day ?? 0) > 0)
    .sort((a, b) => (b.trend30Day ?? 0) - (a.trend30Day ?? 0))[0];

  const weakest = [...skillRatings].sort((a, b) => a.rating - b.rating)[0];

  const recommendedNextFocus = weakest
    ? `Focus on ${weakest.label} — your lowest-rated skill this month.`
    : "Keep building consistency with regular focused sessions.";

  return {
    year,
    month,
    practiceDays: practiceDaySet.size,
    totalMinutes,
    sessionsCompleted: completedSessions.length,
    exercisesCompleted: monthLogs.length,
    mostImprovedSkillTarget: mostImproved?.skillTarget,
    weakestSkillTarget: weakest?.skillTarget,
    personalBestCount,
    achievementsUnlocked: achievementsUnlockedThisMonth,
    consistencyPercent,
    recommendedNextFocus,
    longestStreak: longestStreakDays,
  };
}
