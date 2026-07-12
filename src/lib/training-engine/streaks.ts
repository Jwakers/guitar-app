import {
  addCalendarDaysInTimezone,
  formatDateInTimezone,
} from "./dates";

export type StreakState = {
  lastPracticeDate?: string;
  currentStreakDays: number;
  longestStreakDays: number;
};

export type UpdateStreakInput = StreakState & {
  practiceDate: string;
  practiceDateMs: number;
  timezone: string;
};

export type UpdateStreakResult = StreakState & {
  streakIncremented: boolean;
};

export function updateStreak(input: UpdateStreakInput): UpdateStreakResult {
  const {
    lastPracticeDate,
    currentStreakDays,
    longestStreakDays,
    practiceDate,
    practiceDateMs,
    timezone,
  } = input;

  if (lastPracticeDate === practiceDate) {
    return {
      lastPracticeDate,
      currentStreakDays,
      longestStreakDays,
      streakIncremented: false,
    };
  }

  let nextStreak = 1;
  if (lastPracticeDate) {
    const previousDayMs = addCalendarDaysInTimezone(
      practiceDateMs,
      timezone,
      -1,
    );
    const previousDay = formatDateInTimezone(previousDayMs, timezone);
    if (lastPracticeDate === previousDay) {
      nextStreak = currentStreakDays + 1;
    }
  }

  const nextLongest = Math.max(longestStreakDays, nextStreak);

  return {
    lastPracticeDate: practiceDate,
    currentStreakDays: nextStreak,
    longestStreakDays: nextLongest,
    streakIncremented: true,
  };
}
