import { describe, expect, it } from "vitest";
import { buildSession, SessionBuildError } from "../build-session";
import type { BlockSnapshot } from "../types";
import {
  FIXTURE_EXERCISES,
  FIXTURE_PROFILE,
  FIXTURE_RATINGS,
} from "./fixtures";

const block: BlockSnapshot = {
  blockType: "foundation",
  title: "Foundation Block",
  primaryGoal: "Build balanced control",
  focusCoreSkillIds: ["picking", "synchronisation"],
  focusSubSkillIds: ["alternate_picking"],
  supportCoreSkillIds: ["fretting_control"],
  supportSubSkillIds: [],
  intensity: "moderate",
  currentWeek: 1,
};

describe("buildSession", () => {
  it("assembles a standard session with multiple exercise slots", () => {
    const session = buildSession(
      "standard",
      {
        ...FIXTURE_PROFILE,
        focusCoreSkillIds: ["picking", "synchronisation"],
        focusSubSkillIds: ["alternate_picking"],
      },
      block,
      FIXTURE_RATINGS,
      FIXTURE_EXERCISES,
    );

    expect(session.sessionType).toBe("standard");
    expect(session.exerciseItems.length).toBeGreaterThan(0);
    expect(session.estimatedMinutes).toBeGreaterThan(0);
    expect(session.exerciseItems[0]?.status).toBe("pending");
    expect(session.exerciseItems[0]?.targetBpm).toBeDefined();
  });

  it("throws when catalog has no MVP exercises", () => {
    expect(() =>
      buildSession(
        "standard",
        {
          ...FIXTURE_PROFILE,
          focusCoreSkillIds: ["picking", "synchronisation"],
          focusSubSkillIds: [],
        },
        block,
        FIXTURE_RATINGS,
        [],
      ),
    ).toThrow(SessionBuildError);
  });

  it("builds a test session with benchmark slots", () => {
    const session = buildSession(
      "test",
      {
        ...FIXTURE_PROFILE,
        focusCoreSkillIds: ["picking"],
        focusSubSkillIds: ["alternate_picking"],
      },
      block,
      FIXTURE_RATINGS,
      FIXTURE_EXERCISES,
    );
    expect(session.sessionType).toBe("test");
    expect(
      session.exerciseItems.some((item) => item.slotType === "test"),
    ).toBe(true);
  });

  it("assembles a session from a sparse catalog with only primary drills", () => {
    const sparseCatalog = FIXTURE_EXERCISES.filter(
      (ex) => ex.exerciseType === "primary",
    );
    const session = buildSession(
      "standard",
      {
        ...FIXTURE_PROFILE,
        focusCoreSkillIds: ["picking", "synchronisation"],
        focusSubSkillIds: ["alternate_picking"],
      },
      block,
      FIXTURE_RATINGS,
      sparseCatalog,
    );

    expect(session.exerciseItems.length).toBeGreaterThan(0);
    expect(session.exerciseItems.length).toBeLessThanOrEqual(sparseCatalog.length);
  });
});
