import {
  TRAINING_ATTRIBUTES,
  type CoreSkill,
  type SubSkill,
  type TrainingAttribute,
} from "@/lib/skills/taxonomy";

export type TrainingAttributeHistogram = Record<TrainingAttribute, number>;

const DEFAULT_TARGET_WEIGHTS: Record<TrainingAttribute, number> = {
  accuracy: 0.28,
  consistency: 0.28,
  control: 0.24,
  speed: 0.12,
  endurance: 0.08,
};

/** Typical attribute emphasis per sub-skill (from seed library patterns). */
const SUB_SKILL_TARGET_WEIGHTS: Partial<
  Record<SubSkill, Partial<Record<TrainingAttribute, number>>>
> = {
  alternate_picking: {
    speed: 0.35,
    accuracy: 0.2,
    consistency: 0.25,
    control: 0.15,
    endurance: 0.05,
  },
  string_crossing: {
    accuracy: 0.3,
    consistency: 0.3,
    control: 0.25,
    speed: 0.1,
    endurance: 0.05,
  },
  string_skipping: {
    accuracy: 0.3,
    consistency: 0.3,
    control: 0.25,
    speed: 0.1,
    endurance: 0.05,
  },
  fretting_accuracy: {
    accuracy: 0.35,
    control: 0.3,
    consistency: 0.25,
    speed: 0.05,
    endurance: 0.05,
  },
  legato: {
    control: 0.3,
    consistency: 0.3,
    endurance: 0.2,
    accuracy: 0.15,
    speed: 0.05,
  },
  bends: {
    accuracy: 0.4,
    control: 0.3,
    consistency: 0.25,
    speed: 0.03,
    endurance: 0.02,
  },
};

const CORE_SKILL_TARGET_WEIGHTS: Partial<
  Record<CoreSkill, Partial<Record<TrainingAttribute, number>>>
> = {
  synchronisation: {
    control: 0.35,
    consistency: 0.3,
    accuracy: 0.25,
    speed: 0.05,
    endurance: 0.05,
  },
  picking: {
    speed: 0.3,
    accuracy: 0.22,
    consistency: 0.28,
    control: 0.15,
    endurance: 0.05,
  },
  lead_articulation: {
    accuracy: 0.35,
    control: 0.3,
    consistency: 0.25,
    speed: 0.05,
    endurance: 0.05,
  },
  fretting_control: {
    accuracy: 0.35,
    control: 0.3,
    consistency: 0.25,
    speed: 0.05,
    endurance: 0.05,
  },
};

function emptyHistogram(): TrainingAttributeHistogram {
  return {
    speed: 0,
    endurance: 0,
    accuracy: 0,
    control: 0,
    consistency: 0,
  };
}

function matchesSubSkillFilter(
  drillSubSkillIds: string[] | undefined,
  filterSubSkillIds: string[] | undefined,
): boolean {
  if (!filterSubSkillIds || filterSubSkillIds.length === 0) return true;
  if (!drillSubSkillIds || drillSubSkillIds.length === 0) return false;
  return filterSubSkillIds.some((id) => drillSubSkillIds.includes(id));
}

function averageSubSkillWeights(
  subSkillIds: string[],
): Partial<Record<TrainingAttribute, number>> | undefined {
  const layers = subSkillIds
    .map((id) => SUB_SKILL_TARGET_WEIGHTS[id as SubSkill])
    .filter((weights): weights is Partial<Record<TrainingAttribute, number>> =>
      Boolean(weights),
    );
  if (layers.length === 0) return undefined;

  const merged: Partial<Record<TrainingAttribute, number>> = {};
  for (const attribute of TRAINING_ATTRIBUTES) {
    const values = layers
      .map((layer) => layer[attribute])
      .filter((value): value is number => typeof value === "number");
    if (values.length > 0) {
      merged[attribute] =
        values.reduce((sum, value) => sum + value, 0) / values.length;
    }
  }
  return merged;
}

function targetWeights(
  coreSkillId?: string,
  subSkillIds?: string[],
): Record<TrainingAttribute, number> {
  const subWeights =
    subSkillIds && subSkillIds.length > 0
      ? averageSubSkillWeights(subSkillIds)
      : undefined;
  const coreWeights =
    coreSkillId && coreSkillId in CORE_SKILL_TARGET_WEIGHTS
      ? CORE_SKILL_TARGET_WEIGHTS[coreSkillId as CoreSkill]
      : undefined;

  const merged = { ...DEFAULT_TARGET_WEIGHTS, ...coreWeights, ...subWeights };
  const sum = TRAINING_ATTRIBUTES.reduce((total, id) => total + merged[id], 0);
  if (sum === 0) return DEFAULT_TARGET_WEIGHTS;

  return Object.fromEntries(
    TRAINING_ATTRIBUTES.map((id) => [id, merged[id] / sum]),
  ) as Record<TrainingAttribute, number>;
}

function scopedDrills(
  drills: Array<{
    trainingAttributes?: TrainingAttribute[];
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
) {
  return drills.filter((drill) => {
    if (
      coreSkillId &&
      drill.coreSkillId &&
      drill.coreSkillId !== coreSkillId
    ) {
      return false;
    }
    return matchesSubSkillFilter(drill.subSkillIds, subSkillIds);
  });
}

export function countTrainingAttributes(
  drills: Array<{
    trainingAttributes?: TrainingAttribute[];
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
): TrainingAttributeHistogram {
  const counts = emptyHistogram();

  for (const drill of scopedDrills(drills, coreSkillId, subSkillIds)) {
    for (const attribute of drill.trainingAttributes ?? []) {
      if (attribute in counts) {
        counts[attribute] += 1;
      }
    }
  }

  return counts;
}

/**
 * Pick up to three training attributes that are most under-represented for the
 * selected taxonomy slice, using skill-appropriate target weights.
 */
export function inferTrainingAttributes(
  drills: Array<{
    trainingAttributes?: TrainingAttribute[];
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
  count = 3,
): TrainingAttribute[] {
  const targets = targetWeights(coreSkillId, subSkillIds);
  const counts = countTrainingAttributes(drills, coreSkillId, subSkillIds);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const targetSum = TRAINING_ATTRIBUTES.reduce(
    (sum, id) => sum + targets[id],
    0,
  );

  const ranked = TRAINING_ATTRIBUTES.map((attribute) => {
    const targetShare = targets[attribute] / targetSum;
    const actualShare = total === 0 ? 0 : counts[attribute] / total;
    const absoluteGap =
      targetShare * (total + 1) - counts[attribute];
    const deficit = targetShare - actualShare + absoluteGap * 0.05;
    return { attribute, deficit, targetShare };
  }).sort((a, b) => {
    if (b.deficit !== a.deficit) return b.deficit - a.deficit;
    return b.targetShare - a.targetShare;
  });

  const picked = ranked.slice(0, count).map((entry) => entry.attribute);
  return picked.length > 0 ? picked : ["accuracy", "consistency", "control"];
}

export function formatTrainingAttributeDistribution(
  drills: Array<{
    trainingAttributes?: TrainingAttribute[];
    coreSkillId?: string;
    subSkillIds?: string[];
  }>,
  coreSkillId?: string,
  subSkillIds?: string[],
): string {
  const counts = countTrainingAttributes(drills, coreSkillId, subSkillIds);
  return TRAINING_ATTRIBUTES.map((id) => `${id}: ${counts[id]}`).join(", ");
}
