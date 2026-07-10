import type {
  SessionIntensity,
  SessionPurpose,
  SessionSlot,
  SessionSlotType,
  SessionType,
  SkillRatingSnapshot,
  UserProfileSnapshot,
} from "./types";
import type { BlockSnapshot } from "./types";
import type { CoreSkill, SkillTarget, SubSkill } from "../skills/taxonomy";

function primaryFocusFromBlock(block: BlockSnapshot): SkillTarget {
  if (block.focusSubSkillIds.length > 0) {
    return { kind: "sub", id: block.focusSubSkillIds[0] };
  }
  return { kind: "core", id: block.focusCoreSkillIds[0] ?? "picking" };
}

function secondaryFocusesFromBlock(block: BlockSnapshot): SkillTarget[] {
  const focuses: SkillTarget[] = [];
  for (const id of block.focusCoreSkillIds.slice(1, 3)) {
    focuses.push({ kind: "core", id });
  }
  for (const id of block.focusSubSkillIds.slice(1, 3)) {
    focuses.push({ kind: "sub", id });
  }
  for (const id of block.supportCoreSkillIds.slice(0, 1)) {
    focuses.push({ kind: "core", id });
  }
  return focuses;
}

function intensityFromProfile(
  profile: UserProfileSnapshot,
  sessionType: SessionType,
): SessionIntensity {
  if (sessionType === "light" || sessionType === "deload") return "low";
  if (sessionType === "test") return "moderate";
  if (profile.preferredIntensity === "light") return "low";
  if (profile.preferredIntensity === "hard") return "high";
  return "moderate";
}

function allocateMinutes(
  totalMinutes: number,
  weights: number[],
): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => Math.max(2, Math.round((w / sum) * totalMinutes)));
  const allocated = raw.reduce((a, b) => a + b, 0);
  if (allocated !== totalMinutes && raw.length > 0) {
    raw[0] += totalMinutes - allocated;
  }
  return raw;
}

type TemplateSlotDef = {
  slotType: SessionSlotType;
  weight: number;
  minDifficulty: number;
  maxDifficulty: number;
  useSupportSkills?: boolean;
};

const STANDARD_SLOTS: TemplateSlotDef[] = [
  { slotType: "warmup", weight: 2, minDifficulty: 1, maxDifficulty: 4 },
  { slotType: "primary", weight: 4, minDifficulty: 2, maxDifficulty: 7 },
  { slotType: "secondary", weight: 3, minDifficulty: 2, maxDifficulty: 6 },
  { slotType: "accessory", weight: 2, minDifficulty: 2, maxDifficulty: 5, useSupportSkills: true },
  { slotType: "isolation", weight: 2, minDifficulty: 2, maxDifficulty: 6 },
];

const LIGHT_SLOTS: TemplateSlotDef[] = [
  { slotType: "warmup", weight: 3, minDifficulty: 1, maxDifficulty: 3 },
  { slotType: "maintenance", weight: 4, minDifficulty: 1, maxDifficulty: 4, useSupportSkills: true },
  { slotType: "accessory", weight: 3, minDifficulty: 1, maxDifficulty: 4 },
];

const TEST_SLOTS: TemplateSlotDef[] = [
  { slotType: "warmup", weight: 2, minDifficulty: 1, maxDifficulty: 3 },
  { slotType: "test", weight: 5, minDifficulty: 3, maxDifficulty: 8 },
  { slotType: "test", weight: 4, minDifficulty: 3, maxDifficulty: 7 },
];

function buildSlotsFromDefs(
  defs: TemplateSlotDef[],
  totalMinutes: number,
  block: BlockSnapshot,
): SessionSlot[] {
  const minutes = allocateMinutes(
    totalMinutes,
    defs.map((d) => d.weight),
  );
  return defs.map((def, i) => ({
    slotType: def.slotType,
    targetCoreSkillIds: def.useSupportSkills
      ? block.supportCoreSkillIds.length > 0
        ? block.supportCoreSkillIds
        : block.focusCoreSkillIds
      : block.focusCoreSkillIds,
    targetSubSkillIds: def.useSupportSkills
      ? block.supportSubSkillIds
      : block.focusSubSkillIds,
    minDifficulty: def.minDifficulty,
    maxDifficulty: def.maxDifficulty,
    estimatedMinutes: minutes[i] ?? 5,
  }));
}

export function determineSessionPurpose(
  sessionType: SessionType,
  profile: UserProfileSnapshot,
  block: BlockSnapshot,
  _ratings: SkillRatingSnapshot[],
): SessionPurpose {
  const primaryFocus = primaryFocusFromBlock(block);
  const secondaryFocuses = secondaryFocusesFromBlock(block);
  const intensity = intensityFromProfile(profile, sessionType);

  const reasonCodes: SessionPurpose["reasonCodes"] = ["BLOCK_FOCUS"];
  if (block.blockType === "weakness_focus") {
    reasonCodes.push("WEAKNESS_PRIORITY");
  }
  if (profile.primaryGoals.length > 0) {
    reasonCodes.push("USER_GOAL");
  }
  if (sessionType === "light") {
    reasonCodes.push("CONSISTENCY_RECOVERY");
  }

  return {
    primaryFocus,
    secondaryFocuses,
    sessionType,
    intensity,
    estimatedMinutes: profile.defaultSessionLengthMinutes,
    reasonCodes,
  };
}

export function buildSessionTemplate(
  purpose: SessionPurpose,
  block: BlockSnapshot,
): SessionSlot[] {
  const total = purpose.estimatedMinutes;
  switch (purpose.sessionType) {
    case "light":
    case "deload":
    case "maintenance":
      return buildSlotsFromDefs(LIGHT_SLOTS, total, block);
    case "test":
      return buildSlotsFromDefs(TEST_SLOTS, total, block);
    case "standard":
    default:
      return buildSlotsFromDefs(STANDARD_SLOTS, total, block);
  }
}
