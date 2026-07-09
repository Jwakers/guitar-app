import { describe, expect, it } from "vitest";
import {
  buildDrillPrompt,
  loadSkillKnowledge,
  skillSlugToKnowledgeFilename,
} from "../build-drill-prompt";

describe("skillSlugToKnowledgeFilename", () => {
  it("maps snake_case slugs to hyphenated markdown filenames", () => {
    expect(skillSlugToKnowledgeFilename("string_crossing")).toBe(
      "string-crossing.md",
    );
    expect(skillSlugToKnowledgeFilename("string_skipping")).toBe(
      "string-skipping.md",
    );
    expect(skillSlugToKnowledgeFilename("alternate_picking")).toBe(
      "alternate-picking.md",
    );
  });

  it("rejects slugs that could traverse directories", () => {
    expect(() => skillSlugToKnowledgeFilename("../secrets")).toThrow(
      /Invalid skill slug/,
    );
    expect(() => skillSlugToKnowledgeFilename("foo/bar")).toThrow(
      /Invalid skill slug/,
    );
    expect(() => skillSlugToKnowledgeFilename("..")).toThrow(
      /Invalid skill slug/,
    );
    expect(() => skillSlugToKnowledgeFilename("speed")).toThrow(
      /Invalid skill slug/,
    );
  });
});

describe("loadSkillKnowledge", () => {
  it("loads authored string crossing and skipping docs", () => {
    const crossing = loadSkillKnowledge("string_crossing");
    const skipping = loadSkillKnowledge("string_skipping");
    expect(crossing).toContain("# String Crossing");
    expect(crossing).toContain("Not This Skill");
    expect(skipping).toContain("# String Skipping");
    expect(skipping).toContain("Not This Skill");
  });

  it("returns null for skills without docs yet", () => {
    expect(loadSkillKnowledge("alternate_picking")).toBeNull();
  });

  it("returns null for traversal / invalid slugs without reading outside knowledge/skills", () => {
    expect(loadSkillKnowledge("../package")).toBeNull();
    expect(loadSkillKnowledge("../../package.json")).toBeNull();
    expect(loadSkillKnowledge("foo/../../README")).toBeNull();
  });
});

describe("buildDrillPrompt", () => {
  it("embeds the primary skill knowledge document", () => {
    const { prompt } = buildDrillPrompt({
      coreSkillId: "picking",
      subSkillIds: ["string_crossing"],
      trainingAttributes: ["accuracy", "consistency"],
      difficultyLevel: 5,
      difficultyInferred: false,
      exerciseType: "primary",
      existingDrills: [],
    });

    expect(prompt).toContain("## Core skill context");
    expect(prompt).toContain("## Sub-skill context");
    expect(prompt).toContain("# String Crossing");
    expect(prompt).toContain("Core Skill: picking");
    expect(prompt).toContain("Training attributes: accuracy");
    expect(prompt).toContain("string_crossing = adjacent only");
    expect(prompt).toContain("exercise.patternType is the source of truth");
    expect(prompt).toContain("Short pattern warning");
  });
});
