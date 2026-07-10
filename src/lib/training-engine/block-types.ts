import type { BlockType, SessionType } from "./types";

export type BlockTypeConfig = {
  id: BlockType;
  title: string;
  primaryGoal: string;
  durationWeeks: number;
  defaultIntensity: string;
  /** Deload week number within the block (1-based), if applicable. */
  deloadWeek?: number;
  weekOneTheme: string;
  /** Session types for week 1, scaled to the user's available practice days. */
  weekOneSessionPattern: SessionType[];
};

export const BLOCK_TYPE_CONFIGS: Record<BlockType, BlockTypeConfig> = {
  foundation: {
    id: "foundation",
    title: "Foundation Block",
    primaryGoal:
      "Build balanced technical control across your focus skills with measurable, repeatable practice.",
    durationWeeks: 4,
    defaultIntensity: "moderate",
    deloadWeek: 4,
    weekOneTheme: "Establish baseline control and session rhythm",
    weekOneSessionPattern: [
      "standard",
      "standard",
      "light",
      "standard",
      "test",
    ],
  },
  weakness_focus: {
    id: "weakness_focus",
    title: "Weakness Focus Block",
    primaryGoal:
      "Target your lowest-rated skill areas with focused drills while maintaining supporting control work.",
    durationWeeks: 4,
    defaultIntensity: "moderate",
    deloadWeek: 4,
    weekOneTheme: "Prioritise weak skills with controlled volume",
    weekOneSessionPattern: [
      "standard",
      "standard",
      "light",
      "standard",
      "test",
    ],
  },
};

/** Scale a session-type pattern to the user's practice-day count. */
export function scaleSessionPattern(
  pattern: SessionType[],
  practiceDayCount: number,
): SessionType[] {
  if (practiceDayCount <= 0) return [];
  if (practiceDayCount === 1) return ["standard"];
  if (practiceDayCount === 2) return ["standard", "test"];
  if (practiceDayCount <= pattern.length) {
    return pattern.slice(0, practiceDayCount);
  }

  const result: SessionType[] = [];
  for (let i = 0; i < practiceDayCount; i++) {
    const isLast = i === practiceDayCount - 1;
    const isSecondLast = i === practiceDayCount - 2;
    if (isLast) {
      result.push("test");
    } else if (isSecondLast && practiceDayCount >= 4) {
      result.push("light");
    } else {
      result.push("standard");
    }
  }
  return result;
}

export function getBlockConfig(blockType: BlockType): BlockTypeConfig {
  return BLOCK_TYPE_CONFIGS[blockType];
}
