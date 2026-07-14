/**
 * AlphaTab playbackSpeed is a multiplier relative to the score's written tempo.
 * Desired BPM / written tempo → e.g. tab at 90, play at 100 → ~1.111.
 */
export function computePlaybackSpeed(
  tabTempo: number,
  playbackBpm: number,
): number {
  if (!(tabTempo > 0)) {
    return 1;
  }
  return playbackBpm / tabTempo;
}
