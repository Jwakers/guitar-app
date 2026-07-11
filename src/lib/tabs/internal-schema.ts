/**
 * TypeScript types for structured tab data.
 * These mirror the Convex validators in convex/schema.ts exactly.
 * Do not diverge from the Convex validators.
 */

export type TabNoteString = 1 | 2 | 3 | 4 | 5 | 6;
export type TabNoteFinger = 1 | 2 | 3 | 4;

/** How the current note connects from the previous note on the same string. */
export type NoteArticulation = "picked" | "hammer_on" | "pull_off" | "slide";

/** Sustained or note-local effects — not inter-note connections. */
export type TabNoteTechnique =
  | "bend"
  | "release"
  | "vibrato"
  | "mute"
  | "harmonic";

export type TabNote = {
  string: TabNoteString;
  fret: number;
  finger?: TabNoteFinger;
  articulationFromPrevious?: NoteArticulation;
  technique?: TabNoteTechnique;
  targetPitch?: string;
};

export type TabBeatDuration =
  | "whole"
  | "half"
  | "quarter"
  | "eighth"
  | "sixteenth";

export type TabBeatPicking =
  | "down"
  | "up"
  | "alternate"
  | "economy"
  | "sweep";

export type TabBeat = {
  duration: TabBeatDuration;
  notes: TabNote[];
  tuplet?: number;
  picking?: TabBeatPicking;
  accent?: boolean;
  rest?: boolean;
};

export type TabBar = {
  beats: TabBeat[];
};

export type TabData = {
  tuning: string[];
  capo?: number;
  tempo: number;
  timeSignature: {
    beats: number;
    beatValue: number;
  };
  bars: TabBar[];
  displayHints?: {
    showPicking?: boolean;
    showAccents?: boolean;
    showFingering?: boolean;
    loopStartBar?: number;
    loopEndBar?: number;
  };
};
