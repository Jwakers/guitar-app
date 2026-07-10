import type { TrainingAttribute } from "@/lib/skills/taxonomy";
import { describe, expect, it } from "vitest";
import {
  countTrainingAttributes,
  formatTrainingAttributeDistribution,
  inferTrainingAttributes,
} from "../infer-training-attributes";

describe("inferTrainingAttributes", () => {
  it("defaults to accuracy-focused attributes when the library is empty", () => {
    const attrs = inferTrainingAttributes([]);
    expect(attrs).toContain("accuracy");
    expect(attrs).toContain("consistency");
    expect(attrs.length).toBe(3);
  });

  it("prefers speed for alternate picking when under-represented", () => {
    const drills = [
      {
        coreSkillId: "picking" as const,
        subSkillIds: ["alternate_picking" as const],
        trainingAttributes: [
          "accuracy",
          "consistency",
          "control",
        ] satisfies TrainingAttribute[],
      },
      {
        coreSkillId: "picking" as const,
        subSkillIds: ["alternate_picking" as const],
        trainingAttributes: [
          "accuracy",
          "consistency",
          "control",
        ] satisfies TrainingAttribute[],
      },
    ];
    const attrs = inferTrainingAttributes(drills, "picking", ["alternate_picking"]);
    expect(attrs).toContain("speed");
  });

  it("scopes counts to the selected taxonomy slice", () => {
    const drills = [
      {
        coreSkillId: "picking" as const,
        subSkillIds: ["alternate_picking" as const],
        trainingAttributes: [
          "speed",
          "consistency",
          "control",
        ] satisfies TrainingAttribute[],
      },
      {
        coreSkillId: "lead_articulation" as const,
        subSkillIds: ["bends" as const],
        trainingAttributes: [
          "accuracy",
          "control",
          "consistency",
        ] satisfies TrainingAttribute[],
      },
    ];
    const counts = countTrainingAttributes(drills, "lead_articulation", ["bends"]);
    expect(counts.speed).toBe(0);
    expect(counts.accuracy).toBe(1);
  });

  it("includes drills matching any selected sub-skill", () => {
    const drills = [
      {
        coreSkillId: "picking" as const,
        subSkillIds: ["alternate_picking" as const],
        trainingAttributes: ["speed"] satisfies TrainingAttribute[],
      },
      {
        coreSkillId: "picking" as const,
        subSkillIds: ["string_crossing" as const],
        trainingAttributes: ["accuracy"] satisfies TrainingAttribute[],
      },
    ];
    const counts = countTrainingAttributes(drills, "picking", [
      "alternate_picking",
      "string_crossing",
    ]);
    expect(counts.speed).toBe(1);
    expect(counts.accuracy).toBe(1);
  });

  it("respects the count limit", () => {
    const attrs = inferTrainingAttributes([], undefined, undefined, 2);
    expect(attrs).toHaveLength(2);
  });

  it("handles drills with missing training attributes", () => {
    const drills = [
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      {
        coreSkillId: "picking",
        subSkillIds: ["alternate_picking"],
        trainingAttributes: ["accuracy"] satisfies TrainingAttribute[],
      },
    ];
    const attrs = inferTrainingAttributes(drills, "picking", ["alternate_picking"]);
    expect(attrs.length).toBe(3);
  });
});

describe("formatTrainingAttributeDistribution", () => {
  it("formats zero counts when the library is empty", () => {
    expect(formatTrainingAttributeDistribution([])).toBe(
      "speed: 0, endurance: 0, accuracy: 0, control: 0, consistency: 0",
    );
  });

  it("formats scoped counts for the selected slice", () => {
    const drills = [
      {
        coreSkillId: "picking" as const,
        subSkillIds: ["alternate_picking" as const],
        trainingAttributes: ["speed", "accuracy"] satisfies TrainingAttribute[],
      },
    ];
    expect(
      formatTrainingAttributeDistribution(drills, "picking", ["alternate_picking"]),
    ).toBe("speed: 1, endurance: 0, accuracy: 1, control: 0, consistency: 0");
  });
});
