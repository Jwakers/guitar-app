export const DEFAULT_SESSIONS_PER_WEEK = 7;

export function normalizeSessionsPerWeek(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_SESSIONS_PER_WEEK;
  }
  if (!Number.isInteger(value) || value < 1 || value > 7) {
    throw new Error("Sessions per week must be between 1 and 7");
  }
  return value;
}
