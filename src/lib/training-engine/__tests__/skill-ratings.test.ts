import { describe, expect, it } from "vitest";
import {
  computeRatingFromLogs,
  computeTrend,
  deriveConfidence,
  deriveStatus,
  logPerformanceScore,
  recomputeSkillRating,
} from "../skill-ratings";
import type { SkillRatingLogSnapshot } from "../skill-ratings";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.parse("2026-07-11T12:00:00Z");

function log(
  daysAgo: number,
  verdict: SkillRatingLogSnapshot["trainingVerdict"],
  actualBpm?: number,
  targetBpm = 80,
): SkillRatingLogSnapshot {
  return {
    date: now - daysAgo * DAY,
    trainingVerdict: verdict,
    objectiveResult: {
      metric: "clean_bpm",
      targetValue: targetBpm,
      actualValue: actualBpm,
    },
  };
}

describe("logPerformanceScore", () => {
  it("maps verdicts to base scores", () => {
    expect(logPerformanceScore(log(0, "nailed_it", 80))).toBeGreaterThan(80);
    expect(logPerformanceScore(log(0, "needs_work", 60))).toBeLessThan(70);
  });
});

describe("computeRatingFromLogs", () => {
  it("preserves previous rating when there are no logs", () => {
    expect(computeRatingFromLogs([], 60)).toBe(60);
  });

  it("gently adjusts down on needs_work without cratering", () => {
    const previous = 70;
    const rating = computeRatingFromLogs(
      [log(0, "needs_work", 50)],
      previous,
    );
    expect(rating).toBeGreaterThanOrEqual(previous - 6);
    expect(rating).toBeLessThan(previous);
  });

  it("can increase on strong nailed_it logs", () => {
    const rating = computeRatingFromLogs(
      [log(0, "nailed_it", 88), log(1, "nailed_it", 86)],
      60,
    );
    expect(rating).toBeGreaterThan(60);
  });
});

describe("deriveStatus", () => {
  it("maps rating bands to status", () => {
    expect(deriveStatus(35)).toBe("weak");
    expect(deriveStatus(50)).toBe("developing");
    expect(deriveStatus(65)).toBe("stable");
    expect(deriveStatus(80)).toBe("strong");
  });

  it("marks strong ratings as maintenance after inactivity", () => {
    expect(
      deriveStatus(80, {
        lastTrainedAt: now - 30 * DAY,
        now,
      }),
    ).toBe("maintenance");
    expect(
      deriveStatus(80, {
        lastTrainedAt: now - 5 * DAY,
        now,
      }),
    ).toBe("strong");
  });
});

describe("computeTrend", () => {
  it("returns 0 when there is no history before the cutoff", () => {
    expect(
      computeTrend([log(1, "nailed_it", 85)], 60, now, 7),
    ).toBe(0);
  });

  it("returns positive trend when recent logs outperform older logs", () => {
    const logs = [
      log(1, "nailed_it", 90),
      log(10, "nearly_there", 70),
      log(20, "needs_work", 60),
    ];
    expect(computeTrend(logs, 60, now, 7)).toBeGreaterThan(0);
  });

  it("returns negative trend when recent logs underperform older logs", () => {
    const logs = [
      log(1, "needs_work", 55),
      log(2, "needs_work", 52),
      log(10, "nailed_it", 88),
      log(20, "nailed_it", 86),
    ];
    expect(computeTrend(logs, 70, now, 7)).toBeLessThan(0);
  });
});

describe("deriveConfidence", () => {
  it("derives confidence from a fixed baseline and total log count", () => {
    expect(deriveConfidence(2)).toBeCloseTo(0.56);
    expect(deriveConfidence(20)).toBe(0.9);
  });

  it("is idempotent when log count is unchanged", () => {
    const first = deriveConfidence(4);
    const second = deriveConfidence(4);
    expect(second).toBe(first);
  });
});

describe("recomputeSkillRating", () => {
  it("returns full rating snapshot with trends and lastTrainedAt", () => {
    const result = recomputeSkillRating({
      logs: [log(0, "nearly_there", 78), log(3, "nailed_it", 82)],
      previousRating: 60,
      now,
    });

    expect(result.rating).toBeGreaterThan(60);
    expect(result.status).toBe("stable");
    expect(result.confidence).toBeCloseTo(0.56);
    expect(result.lastTrainedAt).toBe(now);
    expect(result.trend7Day).toBe(0);
  });

  it("preserves stored lastTrainedAt and maintenance status when logs are empty", () => {
    const lastTrainedAt = now - 30 * DAY;

    const result = recomputeSkillRating({
      logs: [],
      previousRating: 80,
      previousLastTrainedAt: lastTrainedAt,
      now,
    });

    expect(result.rating).toBe(80);
    expect(result.lastTrainedAt).toBe(lastTrainedAt);
    expect(result.status).toBe("maintenance");
  });
});
