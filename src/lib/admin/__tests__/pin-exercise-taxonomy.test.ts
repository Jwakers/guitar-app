import { describe, expect, it } from "vitest";
import {
  isTaxonomyValidationError,
  pinExerciseTaxonomy,
} from "../pin-exercise-taxonomy";

describe("pinExerciseTaxonomy", () => {
  it("replaces invalid model sub-skills with server-requested sub-skills", () => {
    const { exercise, pinnedFields, taxonomyPinned } = pinExerciseTaxonomy(
      {
        coreSkillId: "fretting_control",
        subSkillIds: ["slides"],
        title: "Test drill",
      },
      {
        coreSkillId: "fretting_control",
        subSkillIds: ["fretting_accuracy"],
      },
    );

    expect(exercise.subSkillIds).toEqual(["fretting_accuracy"]);
    expect(exercise.coreSkillId).toBe("fretting_control");
    expect(pinnedFields).toEqual(["subSkillIds"]);
    expect(taxonomyPinned).toBe(true);
  });

  it("pins coreSkillId when the model drifts", () => {
    const { exercise, pinnedFields } = pinExerciseTaxonomy(
      {
        coreSkillId: "lead_articulation",
        subSkillIds: ["fretting_accuracy"],
      },
      {
        coreSkillId: "fretting_control",
        subSkillIds: ["fretting_accuracy"],
      },
    );

    expect(exercise.coreSkillId).toBe("fretting_control");
    expect(pinnedFields).toContain("coreSkillId");
  });

  it("reports no pin when taxonomy already matches", () => {
    const { pinnedFields, taxonomyPinned } = pinExerciseTaxonomy(
      {
        coreSkillId: "fretting_control",
        subSkillIds: ["fretting_accuracy"],
      },
      {
        coreSkillId: "fretting_control",
        subSkillIds: ["fretting_accuracy"],
      },
    );

    expect(pinnedFields).toEqual([]);
    expect(taxonomyPinned).toBe(false);
  });

  it("uses only server sub-skills when model added extra valid tags", () => {
    const { exercise } = pinExerciseTaxonomy(
      {
        coreSkillId: "picking",
        subSkillIds: ["alternate_picking", "palm_muting"],
      },
      {
        coreSkillId: "picking",
        subSkillIds: ["alternate_picking"],
      },
    );

    expect(exercise.subSkillIds).toEqual(["alternate_picking"]);
  });
});

describe("isTaxonomyValidationError", () => {
  it("detects sub-skill under wrong core skill", () => {
    expect(
      isTaxonomyValidationError(
        'validateExercise: sub-skill "slides" is not allowed under core skill "fretting_control"',
      ),
    ).toBe(true);
  });

  it("detects invalid coreSkillId", () => {
    expect(
      isTaxonomyValidationError(
        'validateExercise: "coreSkillId" is invalid: "noise_control"',
      ),
    ).toBe(true);
  });

  it("returns false for tab validation errors", () => {
    expect(
      isTaxonomyValidationError(
        "validateTabData: loopEndBar out of range",
      ),
    ).toBe(false);
  });
});
