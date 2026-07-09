import type { TrainingAttribute } from "@/lib/skills/taxonomy";
import { describe, expect, it } from "vitest";
import {
  countTrainingAttributes,
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
    const attrs = inferTrainingAttributes(
      drills,
      "picking",
      "alternate_picking",
    );
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
    const counts = countTrainingAttributes(
      drills,
      "lead_articulation",
      "bends",
    );
    expect(counts.speed).toBe(0);
    expect(counts.accuracy).toBe(1);
  });
});
