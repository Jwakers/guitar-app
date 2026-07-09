import { describe, expect, it } from "vitest";
import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";
import { formatSeedTs } from "../format-seed-ts";

const sample = {
  title: "Test Drill",
  slug: "test-drill",
  primarySkillId: "string_skipping",
  description: "d",
  purpose: "p",
  targetWeaknesses: ["w"],
  minimumCleanStandard: "m",
  measurementInstructions: "i",
  coachingNotes: ["c"],
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: ["s"],
  commonMistakes: ["m"],
  progressionRule: "p",
  regressionRule: "r",
  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 80,
    timeSignature: { beats: 4, beatValue: 4 },
    bars: [
      {
        beats: [
          {
            duration: "quarter",
            notes: [{ string: 6, fret: 0 }],
          },
        ],
      },
    ],
  },
  feedbackSchema: [
    {
      id: "training_verdict",
      label: "Training Verdict",
      type: "segmented",
      required: true,
    },
  ],
  estimatedMinutes: 5,
  isMvp: true,
  version: 1,
  status: "active",
} as ExerciseSeed;

describe("formatSeedTs", () => {
  it("includes import and exercises array for the first drill of a skill", () => {
    const ts = formatSeedTs(sample, { isFirstForSkill: true });
    expect(ts).toContain(
      'import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema"',
    );
    expect(ts).toContain("export const testDrill: ExerciseSeed =");
    expect(ts).toContain("export const stringSkippingExercises: ExerciseSeed[]");
    expect(ts).toContain("testDrill,");
  });

  it("omits import and array for subsequent drills", () => {
    const ts = formatSeedTs(sample, { isFirstForSkill: false });
    expect(ts).not.toContain("import type");
    expect(ts).not.toContain("Exercises");
    expect(ts).toContain("export const testDrill: ExerciseSeed =");
  });
});
