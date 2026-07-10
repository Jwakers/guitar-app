import type { TabNote } from "./internal-schema";

// Standard guitar octaves for TabData.tuning ordered string 6 → string 1.
const STANDARD_GUITAR_OCTAVES = ["E2", "A2", "D3", "G3", "B3", "E4"] as const;

/** Pitch-class → 0–11. */
const PITCH_CLASS: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

/** AlphaTeX maximum bend in quarter-tones (12 semitones). */
export const MAX_BEND_QUARTER_TONES = 24;

export function parsePitchToken(
  raw: string,
): { pc: number; octave: number | null } | null {
  const m = raw.trim().match(/^([A-Ga-g])([#b]?)(\d+)?$/);
  if (!m) return null;
  const letter = m[1]!.toUpperCase();
  const accidental = m[2] ?? "";
  const key = `${letter}${accidental}`;
  const pc = PITCH_CLASS[key];
  if (pc === undefined) return null;
  const octave = m[3] !== undefined ? Number(m[3]) : null;
  return { pc, octave };
}

export function pitchToMidi(raw: string): number | null {
  const parsed = parsePitchToken(raw);
  if (!parsed || parsed.octave === null) return null;
  return (parsed.octave + 1) * 12 + parsed.pc;
}

export function resolveOpenStringPitch(tuningNote: string, tuningIndex: number): string {
  if (/\d$/.test(tuningNote)) return tuningNote;
  const standardPitch = STANDARD_GUITAR_OCTAVES[tuningIndex];
  if (standardPitch === undefined) return tuningNote;
  const octave = standardPitch.match(/\d+$/)?.[0];
  if (octave === undefined) return tuningNote;
  return `${tuningNote}${octave}`;
}

/** TabData.tuning is string 6 → 1; note.string 1 = high E = last tuning entry. */
export function frettedMidi(
  tuning: string[],
  stringNum: TabNote["string"],
  fret: number,
): number | null {
  const tuningIndex = 6 - stringNum;
  const openRaw = tuning[tuningIndex];
  if (openRaw === undefined) return null;
  const openMidi = pitchToMidi(resolveOpenStringPitch(openRaw, tuningIndex));
  if (openMidi === null) return null;
  return openMidi + fret;
}

/**
 * Resolve targetPitch to a MIDI note at or above `fromMidi`.
 * Accepts bare names ("G", "F#") or octave-qualified ("G4").
 */
export function targetMidiAtOrAbove(
  targetPitch: string,
  fromMidi: number,
): number | null {
  const parsed = parsePitchToken(targetPitch);
  if (!parsed) return null;
  if (parsed.octave !== null) {
    return (parsed.octave + 1) * 12 + parsed.pc;
  }
  const fromPc = ((fromMidi % 12) + 12) % 12;
  let delta = parsed.pc - fromPc;
  if (delta <= 0) delta += 12;
  return fromMidi + delta;
}

export function validateBendTargetPitch(
  targetPitch: string,
  tuning: string[],
  stringNum: TabNote["string"],
  fret: number,
  path: string,
): void {
  const trimmed = targetPitch.trim();
  const parsed = parsePitchToken(trimmed);
  if (!parsed || parsed.octave === null) {
    throw new Error(
      `${path}.targetPitch: must be an octave-qualified pitch (e.g. "G4"), got ${JSON.stringify(targetPitch)}`,
    );
  }

  const from = frettedMidi(tuning, stringNum, fret);
  if (from === null) {
    throw new Error(
      `${path}.targetPitch: cannot resolve fretted pitch for string ${stringNum} fret ${fret}`,
    );
  }

  const to = pitchToMidi(trimmed);
  if (to === null) {
    throw new Error(
      `${path}.targetPitch: unrecognised pitch ${JSON.stringify(targetPitch)}`,
    );
  }

  if (to <= from) {
    throw new Error(
      `${path}.targetPitch: ${JSON.stringify(targetPitch)} must be above the fretted note on string ${stringNum} fret ${fret}`,
    );
  }

  const quarterTones = (to - from) * 2;
  if (quarterTones > MAX_BEND_QUARTER_TONES) {
    throw new Error(
      `${path}.targetPitch: bend of ${(to - from)} semitones exceeds maximum supported bend of ${MAX_BEND_QUARTER_TONES / 2} semitones`,
    );
  }
}

/** AlphaTeX bend values are quarter-tones (2 = half step, 4 = whole step). */
export function bendQuarterTones(note: TabNote, tuning: string[]): number {
  if (!note.targetPitch?.trim()) {
    throw new Error(
      `Bend note on string ${note.string} fret ${note.fret} requires targetPitch`,
    );
  }

  validateBendTargetPitch(
    note.targetPitch,
    tuning,
    note.string,
    note.fret,
    `string ${note.string} fret ${note.fret}`,
  );

  const from = frettedMidi(tuning, note.string, note.fret)!;
  const to = pitchToMidi(note.targetPitch.trim())!;
  return (to - from) * 2;
}
