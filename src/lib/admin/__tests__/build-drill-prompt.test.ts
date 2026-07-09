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
});

describe("buildDrillPrompt", () => {
  it("embeds the primary skill knowledge document", () => {
    const { prompt } = buildDrillPrompt({
      primarySkillSlug: "string_crossing",
      secondarySkillSlugs: [],
      difficultyLevel: 5,
      difficultyInferred: false,
      exerciseType: "primary",
      existingDrills: [],
      skills: [
        {
          name: "String Crossing",
          slug: "string_crossing",
          description: "Adjacent only",
          category: "picking",
        },
      ],
    });

    expect(prompt).toContain("## Primary skill context (authoritative)");
    expect(prompt).toContain("# String Crossing");
    expect(prompt).toContain("adjacent only");
    expect(prompt).toContain("string_crossing = adjacent only");
    expect(prompt).toContain("patternType:");
    expect(prompt).toContain("Short pattern warning");
  });
});
