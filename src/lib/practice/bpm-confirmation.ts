export function needsBpmConfirmation(currentBpm: number, peakBpm: number): boolean {
  return peakBpm > currentBpm;
}

export function suggestedCleanBpmOptions(
  peakBpm: number,
  targetBpm?: number,
): number[] {
  const floor = targetBpm ?? Math.max(20, peakBpm - 20);
  if (peakBpm <= floor) {
    return [peakBpm];
  }

  const span = peakBpm - floor;
  if (span + 1 <= 12) {
    const options: number[] = [];
    for (let bpm = peakBpm; bpm >= floor; bpm -= 1) {
      options.push(bpm);
    }
    return options;
  }

  const options = new Set<number>([peakBpm, floor]);
  const step = span / 11;
  for (let i = 1; i < 11; i++) {
    options.add(Math.round(peakBpm - step * i));
  }

  return [...options].sort((a, b) => b - a).slice(0, 12);
}

export function exerciseUsesBpmMetric(exercise: {
  supportsBpm: boolean;
  primaryProgressMetric: string;
}): boolean {
  return exercise.supportsBpm || exercise.primaryProgressMetric === "clean_bpm";
}
