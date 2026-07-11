import { describe, expect, it } from "vitest";
import {
  computeNextTargetBpm,
  derivePeakBpm,
  deriveReliableBpm,
  evaluateProgressionSignal,
  recomputeExerciseStateFromLogs,
} from "../reliable-performance";
import type { ExerciseLogSnapshot } from "../reliable-performance";

function bpmLog(
  bpm: number,
  verdict: ExerciseLogSnapshot["trainingVerdict"],
  date: number,
): ExerciseLogSnapshot {
  return {
    date,
    trainingVerdict: verdict,
    objectiveResult: { metric: "clean_bpm", actualValue: bpm },
  };
}

describe("reliable-performance", () => {
  it("deriveReliableBpm uses repeatable logs, not one-off peaks", () => {
    const logs = [
      bpmLog(145, "nailed_it", 5),
      bpmLog(125, "nailed_it", 4),
      bpmLog(124, "nearly_there", 3),
      bpmLog(123, "nearly_there", 2),
      bpmLog(125, "nailed_it", 1),
    ];

    expect(deriveReliableBpm(logs)).toBe(125);
    expect(derivePeakBpm(logs)).toBe(145);
  });

  it("deriveReliableBpm ignores needs_work logs", () => {
    const logs = [
      bpmLog(100, "needs_work", 3),
      bpmLog(90, "nearly_there", 2),
      bpmLog(88, "nailed_it", 1),
    ];

    expect(deriveReliableBpm(logs)).toBe(89);
  });

  it("evaluateProgressionSignal flags progression and regression", () => {
    expect(
      evaluateProgressionSignal({
        recentVerdicts: ["nailed_it", "nearly_there"],
        consecutiveNailed: 1,
        consecutiveNeedsWork: 0,
      }),
    ).toEqual({ progressionReady: true, regressionRecommended: false });

    expect(
      evaluateProgressionSignal({
        recentVerdicts: ["needs_work", "needs_work"],
        consecutiveNailed: 0,
        consecutiveNeedsWork: 2,
      }),
    ).toEqual({ progressionReady: false, regressionRecommended: true });

    expect(
      evaluateProgressionSignal({
        recentVerdicts: ["needs_work", "nailed_it"],
        consecutiveNailed: 0,
        consecutiveNeedsWork: 1,
      }),
    ).toEqual({ progressionReady: false, regressionRecommended: true });

    expect(
      evaluateProgressionSignal({
        recentVerdicts: ["nearly_there"],
        consecutiveNailed: 0,
        consecutiveNeedsWork: 0,
      }),
    ).toEqual({ progressionReady: false, regressionRecommended: false });
  });

  it("computeNextTargetBpm steps from reliable baseline, not peak", () => {
    const fromReliable = computeNextTargetBpm({
      reliableBpm: 125,
      sessionType: "standard",
      progressionReady: true,
      regressionRecommended: false,
    });
    const fromPeak = computeNextTargetBpm({
      reliableBpm: 145,
      sessionType: "standard",
      progressionReady: true,
      regressionRecommended: false,
    });

    expect(fromReliable).toBe(130);
    expect(fromPeak).toBe(150);
    expect(fromReliable).toBeLessThan(fromPeak);
  });

  it("computeNextTargetBpm regresses on needs_work streak", () => {
    expect(
      computeNextTargetBpm({
        reliableBpm: 100,
        sessionType: "standard",
        progressionReady: false,
        regressionRecommended: true,
      }),
    ).toBe(95);
  });

  it("computeNextTargetBpm reduces targets on light and deload sessions", () => {
    expect(
      computeNextTargetBpm({
        reliableBpm: 100,
        sessionType: "deload",
        progressionReady: false,
        regressionRecommended: false,
      }),
    ).toBe(85);

    expect(
      computeNextTargetBpm({
        reliableBpm: 100,
        sessionType: "light",
        progressionReady: true,
        regressionRecommended: false,
      }),
    ).toBe(89);
  });

  it("recomputeExerciseStateFromLogs builds reliable and peak metrics", () => {
    const state = recomputeExerciseStateFromLogs(
      [
        bpmLog(145, "nailed_it", 5),
        bpmLog(125, "nailed_it", 4),
        bpmLog(124, "nearly_there", 3),
        bpmLog(123, "nearly_there", 2),
        bpmLog(125, "nailed_it", 1),
      ],
      1000,
    );

    expect(state.reliablePerformance).toEqual({
      metric: "clean_bpm",
      value: 125,
      unit: "bpm",
      calculatedAt: 1000,
    });
    expect(state.peakPerformance?.value).toBe(145);
    expect(state.progressionReady).toBe(true);
  });
});
