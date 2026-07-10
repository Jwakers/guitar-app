import { describe, expect, it } from "vitest";
import { inferSubSkillIds } from "../infer-sub-skills";

describe("inferSubSkillIds", () => {
  it("defaults to primary sub-skill when the library is empty", () => {
    expect(inferSubSkillIds([], "picking")).toEqual(["alternate_picking"]);
  });

  it("picks the least-represented sub-skill for the core", () => {
    const drills = [
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { coreSkillId: "picking", subSkillIds: ["string_crossing"] },
    ];
    const inferred = inferSubSkillIds(drills, "picking");
    expect(inferred).toEqual(["string_skipping"]);
  });

  it("scopes counts to the selected core skill", () => {
    const drills = [
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
      { coreSkillId: "lead_articulation", subSkillIds: ["bends"] },
      { coreSkillId: "lead_articulation", subSkillIds: ["bends"] },
    ];
    const inferred = inferSubSkillIds(drills, "picking");
    expect(inferred).toEqual(["string_crossing"]);
  });

  it("counts each sub-skill tag on multi-tagged drills", () => {
    const drills = [
      {
        coreSkillId: "picking",
        subSkillIds: ["alternate_picking", "string_crossing"],
      },
      { coreSkillId: "picking", subSkillIds: ["alternate_picking"] },
    ];
    const inferred = inferSubSkillIds(drills, "picking");
    expect(inferred).toEqual(["string_skipping"]);
  });
});
