import type {
  TabBar,
  TabBeat,
  TabBeatDuration,
  TabData,
  TabNote,
  TabNoteTechnique,
} from "./internal-schema";

// ---------------------------------------------------------------------------
// Duration mapping
// ---------------------------------------------------------------------------

const DURATION_MAP: Record<TabBeatDuration, number> = {
  whole: 1,
  half: 2,
  quarter: 4,
  eighth: 8,
  sixteenth: 16,
};

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

/** AlphaTeX bend values are quarter-tones (2 = half step, 4 = whole step). */
function bendQuarterTones(note: TabNote, tuning: string[]): number {
  if (!note.targetPitch?.trim()) {
    throw new Error(
      `Bend note on string ${note.string} fret ${note.fret} requires targetPitch`,
    );
  }
  const from = frettedMidi(tuning, note.string, note.fret);
  if (from === null) {
    throw new Error(
      `Cannot resolve fretted pitch for bend on string ${note.string} fret ${note.fret}`,
    );
  }
  const to = targetMidiAtOrAbove(note.targetPitch, from);
  if (to === null) {
    throw new Error(
      `Invalid targetPitch "${note.targetPitch}" for bend on string ${note.string} fret ${note.fret}`,
    );
  }
  const semitones = to - from;
  if (semitones <= 0) {
    throw new Error(
      `targetPitch "${note.targetPitch}" must be above fretted pitch for bend on string ${note.string} fret ${note.fret}`,
    );
  }
  return Math.min(24, semitones * 2);
}

const TECHNIQUE_EFFECTS: Partial<
  Record<Exclude<TabNoteTechnique, "bend" | "release" | "picked">, string>
> = {
  hammer_on: "h",
  pull_off: "h",
  slide: "sl",
  vibrato: "v",
  mute: "pm",
  harmonic: "nh",
};

type DisplayHints = NonNullable<TabData["displayHints"]>;

type EmitFlags = {
  showAccents: boolean;
  showPicking: boolean;
};

function resolveEmitFlags(hints: DisplayHints | undefined): EmitFlags {
  return {
    // Opt-out: accents still emit when the hint is unset.
    showAccents: hints?.showAccents !== false,
    // Opt-in: picking strokes only when explicitly requested.
    showPicking: hints?.showPicking === true,
  };
}

// ---------------------------------------------------------------------------
// Pitch helpers
// ---------------------------------------------------------------------------

function parsePitchToken(raw: string): { pc: number; octave: number | null } | null {
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

function pitchToMidi(raw: string): number | null {
  const parsed = parsePitchToken(raw);
  if (!parsed || parsed.octave === null) return null;
  return (parsed.octave + 1) * 12 + parsed.pc;
}

function resolveOpenStringPitch(tuningNote: string, tuningIndex: number): string {
  if (/\d$/.test(tuningNote)) return tuningNote;
  return STANDARD_GUITAR_OCTAVES[tuningIndex] ?? tuningNote;
}

/** TabData.tuning is string 6 → 1; note.string 1 = high E = last tuning entry. */
function frettedMidi(
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
function targetMidiAtOrAbove(targetPitch: string, fromMidi: number): number | null {
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

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

function tuningToAlphaTex(tuning: string[]): string {
  const pitches = tuning.map((note, index) => {
    if (/\d$/.test(note)) return note;
    return STANDARD_GUITAR_OCTAVES[index] ?? note;
  });
  // AlphaTeX expects string 1 (high) first through string 6 (low).
  return `\\tuning (${[...pitches].reverse().join(" ")})`;
}

function techniqueEffect(
  note: TabNote,
  tuning: string[],
  previousBendQt: number | null,
): string | null {
  if (note.technique === undefined || note.technique === "picked") return null;

  if (note.technique === "bend") {
    const qt = bendQuarterTones(note, tuning);
    return `b (0 ${qt})`;
  }

  if (note.technique === "release") {
    const qt = previousBendQt ?? bendQuarterTones(note, tuning);
    return `b (${qt} 0)`;
  }

  return TECHNIQUE_EFFECTS[note.technique] ?? null;
}

function noteEffects(
  note: TabNote,
  tuning: string[],
  accented: boolean,
  previousBendQt: number | null,
  flags: EmitFlags,
): string[] {
  const effects: string[] = [];

  const technique = techniqueEffect(note, tuning, previousBendQt);
  if (technique !== null) effects.push(technique);

  // Left-hand fingering is intentionally never rendered in AlphaTeX.
  // Finger guidance belongs in coaching notes / description text — AlphaTab
  // fingering collides with bend tip labels and is too prescriptive for drills.

  // `ac` is a note property in AlphaTeX — not a beat property.
  if (flags.showAccents && accented) {
    effects.push("ac");
  }

  return effects;
}

function beatEffects(beat: TabBeat, flags: EmitFlags): string[] {
  const effects: string[] = [];

  // AlphaTeX pick strokes are su/sd. `d` means dotted — do not use it for downstrokes.
  if (flags.showPicking) {
    if (beat.picking === "down") {
      effects.push("sd");
    } else if (beat.picking === "up") {
      effects.push("su");
    }
  }

  if (beat.tuplet !== undefined) {
    effects.push(`tu ${beat.tuplet}`);
  }

  return effects;
}

function formatEffects(effects: string[]): string {
  if (effects.length === 0) return "";
  // Match AlphaTeX docs: `3.3{h}`, `3.3{b (0 4)}`.
  return `{${effects.join(" ")}}`;
}

/**
 * Note effects must sit on fret.string *before* duration.
 * Properties after `.duration` are parsed as beat effects — `h` / `ac`
 * are note-only and fail with AT205 if placed there.
 */
function noteToAlphaTex(
  note: TabNote,
  tuning: string[],
  accented: boolean,
  previousBendQt: number | null,
  flags: EmitFlags,
): string {
  return `${note.fret}.${note.string}${formatEffects(
    noteEffects(note, tuning, accented, previousBendQt, flags),
  )}`;
}

function beatToAlphaTex(
  beat: TabBeat,
  tuning: string[],
  previousBendQt: number | null,
  flags: EmitFlags,
): { tex: string; bendQt: number | null } {
  const dur = DURATION_MAP[beat.duration];
  const beatFx = formatEffects(beatEffects(beat, flags));
  const accented = beat.accent === true;

  if (beat.rest === true || beat.notes.length === 0) {
    return { tex: `r.${dur}${beatFx}`, bendQt: previousBendQt };
  }

  let nextBendQt = previousBendQt;
  for (const note of beat.notes) {
    if (note.technique === "bend") {
      nextBendQt = bendQuarterTones(note, tuning);
    } else if (note.technique === "release") {
      nextBendQt = null;
    }
  }

  if (beat.notes.length === 1) {
    const note = beat.notes[0]!;
    return {
      tex: `${noteToAlphaTex(note, tuning, accented, previousBendQt, flags)}.${dur}${beatFx}`,
      bendQt: nextBendQt,
    };
  }

  // Chord: accent applies to each note; beat effects stay after duration.
  const noteStr = beat.notes
    .map((n) => noteToAlphaTex(n, tuning, accented, previousBendQt, flags))
    .join(" ");
  return { tex: `(${noteStr}).${dur}${beatFx}`, bendQt: nextBendQt };
}

function barToAlphaTex(bar: TabBar, tuning: string[], flags: EmitFlags): string {
  let previousBendQt: number | null = null;
  const parts: string[] = [];
  for (const beat of bar.beats) {
    const { tex, bendQt } = beatToAlphaTex(beat, tuning, previousBendQt, flags);
    parts.push(tex);
    previousBendQt = bendQt;
  }
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Converts structured TabData to an AlphaTeX notation string suitable for
 * passing to `AlphaTabApi.tex()`.
 *
 * AlphaTeX note format: {fret}.{string}{noteEffects}.{duration}{beatEffects}
 * Bend amounts use quarter-tones (2 = half step, 4 = whole step), inferred from
 * `targetPitch` (required for bend notes).
 *
 * `displayHints` gates optional annotations:
 * - showPicking: opt-in
 * - showAccents: opt-out (emitted when unset)
 * - showFingering: ignored (fingerings are never rendered)
 *
 * AlphaTeX reference: https://alphatab.net/docs/alphatex/note-properties
 */
export function tabDataToAlphaTex(data: TabData): string {
  const flags = resolveEmitFlags(data.displayHints);

  const header = [
    "\\staff{score tabs}",
    tuningToAlphaTex(data.tuning),
    ...(data.capo !== undefined && data.capo > 0
      ? [`\\capo ${data.capo}`]
      : []),
    // Parentheses are required for metadata arguments in AlphaTeX.
    `\\ts(${data.timeSignature.beats} ${data.timeSignature.beatValue})`,
    `\\tempo ${data.tempo}`,
  ].join("\n");

  const bars = data.bars
    .map((bar) => `| ${barToAlphaTex(bar, data.tuning, flags)}`)
    .join("\n");

  return `${header}\n${bars}`;
}
