export function needsBpmConfirmation(currentBpm: number, peakBpm: number): boolean {
  return peakBpm > currentBpm;
}

export function suggestedCleanBpmOptions(
  peakBpm: number,
  targetBpm?: number,
): number[] {
  const floor = targetBpm ?? Math.max(20, peakBpm - 20);
  const options: number[] = [];
  for (let bpm = peakBpm; bpm >= floor; bpm -= 1) {
    options.push(bpm);
    if (options.length >= 12) break;
  }
  return options;
}

export function exerciseUsesBpmMetric(exercise: {
  supportsBpm: boolean;
  primaryProgressMetric: string;
}): boolean {
  return exercise.supportsBpm || exercise.primaryProgressMetric === "clean_bpm";
}
