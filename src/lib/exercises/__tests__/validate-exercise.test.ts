import { describe, expect, it } from "vitest";
import type { ExerciseSeed } from "../exercise-schema";
import { validateExercise } from "../validate-exercise";

const baseExercise: ExerciseSeed = {
  title: "Valid Picking Loop",
  slug: "valid-picking-loop",
  description: "A complete alternate picking loop.",
  purpose: "Train consistent alternate picking.",
  targetWeaknesses: ["Uneven pick attack"],
  minimumCleanStandard: "All notes are clean and evenly timed.",
  measurementInstructions: "Log the highest clean BPM.",
  coachingNotes: ["Keep the picking motion small."],
  coreSkillId: "picking",
  subSkillIds: ["alternate_picking"],
  trainingAttributes: ["speed", "consistency"],
  difficultyLevel: 4,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 90,
  successCriteria: ["Strict alternate picking is maintained."],
  commonMistakes: ["Resetting pick direction."],
  progressionRule: "Increase by 5 BPM after three clean sessions.",
  regressionRule: "Reduce by 5 BPM after two needs-work sessions.",
  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 90,
    timeSignature: { beats: 4, beatValue: 4 },
    bars: [
      {
        beats: Array.from({ length: 8 }, (_, i) => ({
          duration: "eighth" as const,
          picking: i % 2 === 0 ? ("down" as const) : ("up" as const),
          notes: [{ string: 6 as const, fret: 5 + (i % 4) }],
        })),
      },
    ],
  },
  patternType: "standard_loop",
  feedbackSchema: [
    {
      id: "training_verdict",
      label: "Training Verdict",
      type: "segmented",
      required: true,
      options: [
        { id: "nailed_it", label: "Nailed It" },
        { id: "nearly_there", label: "Nearly There" },
        { id: "needs_work", label: "Needs Work" },
      ],
    },
  ],
  estimatedMinutes: 5,
  isMvp: true,
  version: 1,
  status: "active",
};

describe("validateExercise taxonomy", () => {
  it("accepts the new core/sub-skill/attribute fields", () => {
    expect(validateExercise(baseExercise)).toEqual(baseExercise);
  });

  it("rejects old flat skill values as core skills", () => {
    expect(() =>
      validateExercise({ ...baseExercise, coreSkillId: "alternate_picking" }),
    ).toThrow(/coreSkillId/);
  });

  it("rejects speed and endurance as core skills", () => {
    expect(() =>
      validateExercise({ ...baseExercise, coreSkillId: "speed" }),
    ).toThrow(/coreSkillId/);
    expect(() =>
      validateExercise({ ...baseExercise, coreSkillId: "endurance" }),
    ).toThrow(/coreSkillId/);
  });

  it("rejects sub-skills under the wrong core skill", () => {
    expect(() =>
      validateExercise({
        ...baseExercise,
        coreSkillId: "lead_articulation",
        subSkillIds: ["string_crossing"],
      }),
    ).toThrow(/does not belong/);
  });

  it("requires explicit micro-drill justification", () => {
    const micro = {
      ...baseExercise,
      patternType: "micro_drill",
    } satisfies ExerciseSeed;
    expect(() => validateExercise(micro)).toThrow(/microDrillJustification/);
  });

  it("rejects tiny patterns that are not declared as micro-drills", () => {
    expect(() =>
      validateExercise({
        ...baseExercise,
        tabData: {
          ...baseExercise.tabData,
          bars: [
            {
              beats: [
                {
                  duration: "quarter",
                  notes: [{ string: 6, fret: 5 }],
                },
              ],
            },
          ],
        },
      }),
    ).toThrow(/tiny patterns/);
  });

  it("requires string crossing tabs to use adjacent movement only", () => {
    expect(() =>
      validateExercise({
        ...baseExercise,
        subSkillIds: ["string_crossing"],
        tabData: {
          ...baseExercise.tabData,
          bars: [
            {
              beats: [
                { duration: "eighth", notes: [{ string: 6, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 4, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 5, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 4, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 5, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 4, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 5, fret: 5 }] },
                { duration: "eighth", notes: [{ string: 4, fret: 5 }] },
              ],
            },
          ],
        },
      }),
    ).toThrow(/string_crossing/);
  });

  it("requires bend drills to include bend notation and target pitch", () => {
    expect(() =>
      validateExercise({
        ...baseExercise,
        coreSkillId: "lead_articulation",
        subSkillIds: ["bends"],
        trainingAttributes: ["accuracy", "control"],
      }),
    ).toThrow(/claims bends/);
  });
});
