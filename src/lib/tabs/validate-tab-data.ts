import type {
  TabBar,
  TabBeat,
  TabBeatDuration,
  TabBeatPicking,
  TabData,
  TabNote,
  TabNoteFinger,
  TabNoteString,
  TabNoteTechnique,
  NoteArticulation,
} from "./internal-schema";
import { validateLegatoArticulations } from "./legato-validation";
import { validateBendTargetPitch } from "./pitch-helpers";

const VALID_DURATIONS = new Set<TabBeatDuration>([
  "whole",
  "half",
  "quarter",
  "eighth",
  "sixteenth",
]);

const VALID_PICKINGS = new Set<TabBeatPicking>([
  "down",
  "up",
  "alternate",
  "economy",
  "sweep",
]);

const VALID_ARTICULATIONS = new Set<NoteArticulation>([
  "picked",
  "hammer_on",
  "pull_off",
  "slide",
]);

const VALID_TECHNIQUES = new Set<TabNoteTechnique>([
  "bend",
  "release",
  "vibrato",
  "mute",
  "harmonic",
]);

const DEPRECATED_CONNECTION_TECHNIQUES = new Set([
  "picked",
  "hammer_on",
  "pull_off",
  "slide",
]);

const VALID_STRINGS = new Set<TabNoteString>([1, 2, 3, 4, 5, 6]);
const VALID_FINGERS = new Set<TabNoteFinger>([1, 2, 3, 4]);

const MAX_FRET = 24;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateNote(note: unknown, path: string, tuning: string[]): TabNote {
  if (!isRecord(note)) {
    throw new Error(`${path}: expected an object`);
  }

  const {
    string,
    fret,
    finger,
    articulationFromPrevious,
    technique,
    targetPitch,
  } = note;

  if (!VALID_STRINGS.has(string as TabNoteString)) {
    throw new Error(
      `${path}.string: must be 1–6, got ${JSON.stringify(string)}`,
    );
  }

  if (typeof fret !== "number" || !Number.isInteger(fret) || fret < 0 || fret > MAX_FRET) {
    throw new Error(
      `${path}.fret: must be an integer 0–${MAX_FRET}, got ${JSON.stringify(fret)}`,
    );
  }

  if (finger !== undefined && !VALID_FINGERS.has(finger as TabNoteFinger)) {
    throw new Error(
      `${path}.finger: must be 1–4 if set, got ${JSON.stringify(finger)}`,
    );
  }

  if (
    articulationFromPrevious !== undefined &&
    !VALID_ARTICULATIONS.has(articulationFromPrevious as NoteArticulation)
  ) {
    throw new Error(
      `${path}.articulationFromPrevious: unrecognised value ${JSON.stringify(articulationFromPrevious)}`,
    );
  }

  if (
    technique !== undefined &&
    DEPRECATED_CONNECTION_TECHNIQUES.has(technique as string)
  ) {
    throw new Error(
      `${path}.technique: use articulationFromPrevious for hammer_on, pull_off, slide, or picked — not technique`,
    );
  }

  if (
    technique !== undefined &&
    !VALID_TECHNIQUES.has(technique as TabNoteTechnique)
  ) {
    throw new Error(
      `${path}.technique: unrecognised value ${JSON.stringify(technique)}`,
    );
  }

  if (targetPitch !== undefined && typeof targetPitch !== "string") {
    throw new Error(`${path}.targetPitch: must be a string if set`);
  }

  if (technique === "bend") {
    if (
      typeof targetPitch !== "string" ||
      targetPitch.trim().length === 0
    ) {
      throw new Error(
        `${path}.targetPitch: required for technique "bend" (octave-qualified pitch, e.g. "G4")`,
      );
    }
    validateBendTargetPitch(
      targetPitch,
      tuning,
      string as TabNoteString,
      fret as number,
      path,
    );
  }

  return note as TabNote;
}

function validateBeat(beat: unknown, path: string, tuning: string[]): TabBeat {
  if (!isRecord(beat)) {
    throw new Error(`${path}: expected an object`);
  }

  const { duration, notes, tuplet, picking, accent, rest } = beat;

  if (!VALID_DURATIONS.has(duration as TabBeatDuration)) {
    throw new Error(
      `${path}.duration: unrecognised value ${JSON.stringify(duration)}`,
    );
  }

  if (tuplet !== undefined) {
    if (
      typeof tuplet !== "number" ||
      !Number.isInteger(tuplet) ||
      tuplet < 2
    ) {
      throw new Error(
        `${path}.tuplet: must be an integer >= 2 if set, got ${JSON.stringify(tuplet)}`,
      );
    }
  }

  if (!Array.isArray(notes)) {
    throw new Error(`${path}.notes: must be an array`);
  }

  const validatedNotes = notes.map((n, i) =>
    validateNote(n, `${path}.notes[${i}]`, tuning),
  );

  if (picking !== undefined && !VALID_PICKINGS.has(picking as TabBeatPicking)) {
    throw new Error(
      `${path}.picking: unrecognised value ${JSON.stringify(picking)}`,
    );
  }

  if (accent !== undefined && typeof accent !== "boolean") {
    throw new Error(`${path}.accent: must be a boolean if set`);
  }

  if (rest !== undefined && typeof rest !== "boolean") {
    throw new Error(`${path}.rest: must be a boolean if set`);
  }

  return { ...beat, notes: validatedNotes } as TabBeat;
}

function validateBar(bar: unknown, path: string, tuning: string[]): TabBar {
  if (!isRecord(bar)) {
    throw new Error(`${path}: expected an object`);
  }

  const { beats } = bar;

  if (!Array.isArray(beats)) {
    throw new Error(`${path}.beats: must be an array`);
  }

  return {
    beats: beats.map((b, i) => validateBeat(b, `${path}.beats[${i}]`, tuning)),
  };
}

/**
 * Validates unknown data as TabData, throwing a descriptive error on failure.
 * Returns the typed TabData on success.
 */
export function validateTabData(data: unknown): TabData {
  if (!isRecord(data)) {
    throw new Error("tabData: expected an object");
  }

  const { tuning, capo, tempo, timeSignature, bars, displayHints } = data;

  // tuning — must be an array of exactly 6 strings
  if (
    !Array.isArray(tuning) ||
    tuning.length !== 6 ||
    !tuning.every((s) => typeof s === "string")
  ) {
    throw new Error("tabData.tuning: must be an array of exactly 6 strings");
  }

  if (capo !== undefined && typeof capo !== "number") {
    throw new Error("tabData.capo: must be a number if set");
  }

  if (typeof tempo !== "number" || tempo <= 0) {
    throw new Error("tabData.tempo: must be a positive number");
  }

  if (!isRecord(timeSignature)) {
    throw new Error("tabData.timeSignature: expected an object");
  }
  if (
    typeof timeSignature.beats !== "number" ||
    typeof timeSignature.beatValue !== "number"
  ) {
    throw new Error(
      "tabData.timeSignature: beats and beatValue must both be numbers",
    );
  }

  if (!Array.isArray(bars) || bars.length === 0) {
    throw new Error("tabData.bars: must be a non-empty array");
  }

  const validatedTuning = tuning as string[];
  const validatedBars = bars.map((b, i) =>
    validateBar(b, `tabData.bars[${i}]`, validatedTuning),
  );

  // displayHints is optional; validate its fields if present
  if (displayHints !== undefined) {
    if (!isRecord(displayHints)) {
      throw new Error("tabData.displayHints: must be an object if set");
    }
    const boolFields = [
      "showPicking",
      "showAccents",
      "showFingering",
    ] as const;
    for (const field of boolFields) {
      if (
        displayHints[field] !== undefined &&
        typeof displayHints[field] !== "boolean"
      ) {
        throw new Error(`tabData.displayHints.${field}: must be a boolean if set`);
      }
    }
    const numFields = ["loopStartBar", "loopEndBar"] as const;
    for (const field of numFields) {
      if (
        displayHints[field] !== undefined &&
        typeof displayHints[field] !== "number"
      ) {
        throw new Error(`tabData.displayHints.${field}: must be a number if set`);
      }
    }

    const barCount = validatedBars.length;
    const loopStartBar =
      displayHints.loopStartBar !== undefined
        ? (displayHints.loopStartBar as number)
        : undefined;
    const loopEndBar =
      displayHints.loopEndBar !== undefined
        ? (displayHints.loopEndBar as number)
        : undefined;

    if (loopStartBar !== undefined) {
      if (
        !Number.isInteger(loopStartBar) ||
        loopStartBar < 0 ||
        loopStartBar >= barCount
      ) {
        throw new Error(
          `tabData.displayHints.loopStartBar: must be an integer between 0 and ${barCount - 1}, got ${JSON.stringify(loopStartBar)}`,
        );
      }
    }
    if (loopEndBar !== undefined) {
      if (
        !Number.isInteger(loopEndBar) ||
        loopEndBar < 0 ||
        loopEndBar >= barCount
      ) {
        throw new Error(
          `tabData.displayHints.loopEndBar: must be an integer between 0 and ${barCount - 1}, got ${JSON.stringify(loopEndBar)}`,
        );
      }
    }
    if (
      loopStartBar !== undefined &&
      loopEndBar !== undefined &&
      loopStartBar > loopEndBar
    ) {
      throw new Error(
        "tabData.displayHints: loopStartBar must be less than or equal to loopEndBar",
      );
    }
  }

  const tabData: TabData = {
    tuning: validatedTuning,
    ...(capo !== undefined ? { capo: capo as number } : {}),
    tempo: tempo as number,
    timeSignature: timeSignature as { beats: number; beatValue: number },
    bars: validatedBars,
    ...(displayHints !== undefined
      ? { displayHints: displayHints as TabData["displayHints"] }
      : {}),
  };

  validateLegatoArticulations(tabData);

  return tabData;
}
