import { describe, expect, it } from "vitest";
import { canReplaySession, resolvePlayerMode } from "../player-mode";

describe("player-mode", () => {
  it("resolvePlayerMode returns live for active session", () => {
    expect(
      resolvePlayerMode({
        sessionStatus: "active",
        sessionDate: "2026-07-10",
        todayDate: "2026-07-10",
        replayRequested: false,
      }),
    ).toBe("live");
  });

  it("resolvePlayerMode returns summary for completed session", () => {
    expect(
      resolvePlayerMode({
        sessionStatus: "completed",
        sessionDate: "2026-07-10",
        todayDate: "2026-07-10",
        replayRequested: false,
      }),
    ).toBe("summary");
  });

  it("resolvePlayerMode returns replay for same-day completed replay", () => {
    expect(
      resolvePlayerMode({
        sessionStatus: "completed",
        sessionDate: "2026-07-10",
        todayDate: "2026-07-10",
        replayRequested: true,
      }),
    ).toBe("replay");
  });

  it("resolvePlayerMode rejects replay on different day", () => {
    expect(
      resolvePlayerMode({
        sessionStatus: "completed",
        sessionDate: "2026-07-09",
        todayDate: "2026-07-10",
        replayRequested: true,
      }),
    ).toBe("summary");
  });

  it("canReplaySession requires completed same-day session", () => {
    expect(
      canReplaySession({
        sessionStatus: "completed",
        sessionDate: "2026-07-10",
        todayDate: "2026-07-10",
      }),
    ).toBe(true);
    expect(
      canReplaySession({
        sessionStatus: "active",
        sessionDate: "2026-07-10",
        todayDate: "2026-07-10",
      }),
    ).toBe(false);
  });
});
