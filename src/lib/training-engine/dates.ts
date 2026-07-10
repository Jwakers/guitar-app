const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** YYYY-MM-DD in the given IANA timezone. */
export function formatDateInTimezone(dateMs: number, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateMs));
}

/** Full weekday name (e.g. "Monday") in the given timezone. */
export function getDayNameInTimezone(dateMs: number, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  }).format(new Date(dateMs));
}

export function isPracticeDay(
  dateMs: number,
  timezone: string,
  availableDays: string[],
): boolean {
  const dayName = getDayNameInTimezone(dateMs, timezone);
  return availableDays.includes(dayName);
}

/** Next practice day on or after `fromMs`, within `maxDaysAhead` days. */
export function nextPracticeDay(
  fromMs: number,
  timezone: string,
  availableDays: string[],
  maxDaysAhead = 14,
): { dateMs: number; dateString: string; dayName: string } | null {
  if (availableDays.length === 0) return null;

  for (let offset = 0; offset <= maxDaysAhead; offset++) {
    const candidate = fromMs + offset * 24 * 60 * 60 * 1000;
    const dayName = getDayNameInTimezone(candidate, timezone);
    if (availableDays.includes(dayName)) {
      return {
        dateMs: candidate,
        dateString: formatDateInTimezone(candidate, timezone),
        dayName,
      };
    }
  }
  return null;
}

/** Index of this practice day within the user's week pattern (0-based). */
export function practiceDayIndex(
  dayName: string,
  availableDays: string[],
): number {
  const sorted = [...availableDays].sort(
    (a, b) => DAY_NAMES.indexOf(a as (typeof DAY_NAMES)[number]) -
      DAY_NAMES.indexOf(b as (typeof DAY_NAMES)[number]),
  );
  return sorted.indexOf(dayName);
}

export function addWeeksMs(startMs: number, weeks: number): number {
  return startMs + weeks * 7 * 24 * 60 * 60 * 1000;
}
