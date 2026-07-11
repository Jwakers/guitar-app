export type PlayerMode = "live" | "replay" | "summary";

export function resolvePlayerMode(args: {
  sessionStatus: string;
  sessionDate: string;
  todayDate: string | undefined;
  replayRequested: boolean;
}): PlayerMode {
  if (args.replayRequested) {
    if (
      args.sessionStatus === "completed" &&
      args.todayDate !== undefined &&
      args.sessionDate === args.todayDate
    ) {
      return "replay";
    }
    return "summary";
  }

  if (args.sessionStatus === "completed") {
    return "summary";
  }

  return "live";
}

export function canReplaySession(args: {
  sessionStatus: string;
  sessionDate: string;
  todayDate: string;
}): boolean {
  return (
    args.sessionStatus === "completed" && args.sessionDate === args.todayDate
  );
}
