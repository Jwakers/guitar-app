type SessionItemBpmSource = {
  targetBpm?: number;
};

type ExerciseBpmSource = {
  defaultTargetBpm?: number;
  tabData: { tempo: number };
};

export function resolveInitialBpm(
  sessionItem: SessionItemBpmSource,
  exercise: ExerciseBpmSource,
): number {
  if (sessionItem.targetBpm !== undefined) {
    return sessionItem.targetBpm;
  }
  if (exercise.defaultTargetBpm !== undefined) {
    return exercise.defaultTargetBpm;
  }
  return exercise.tabData.tempo;
}
