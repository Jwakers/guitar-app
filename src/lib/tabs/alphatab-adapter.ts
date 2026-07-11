import type {
  TabBar,
  TabBeat,
  TabBeatDuration,
  TabData,
  TabNote,
  TabNoteTechnique,
  NoteArticulation,
  TabNoteString,
} from "./internal-schema";
import { isValidArticulationFromPrevious } from "./legato-validation";
import { bendQuarterTones, resolveOpenStringPitch } from "./pitch-helpers";

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

/** AlphaTeX uses `h` for both hammer-ons and pull-offs; fret direction defines which. */
const ARTICULATION_EFFECTS: Partial<Record<NoteArticulation, string>> = {
  hammer_on: "h",
  pull_off: "h",
  slide: "sl",
};

const NOTE_TECHNIQUE_EFFECTS: Partial<
  Record<Exclude<TabNoteTechnique, "bend" | "release">, string>
> = {
  vibrato: "v",
  mute: "pm",
  harmonic: "nh",
};

type DisplayHints = NonNullable<TabData["displayHints"]>;

type EmitFlags = {
  showAccents: boolean;
  showPicking: boolean;
};

type PreviousNoteOnString = {
  fret: number;
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
// Converters
// ---------------------------------------------------------------------------

function tuningToAlphaTex(tuning: string[]): string {
  const pitches = tuning.map((note, index) => resolveOpenStringPitch(note, index));
  // AlphaTeX expects string 1 (high) first through string 6 (low).
  return `\\tuning (${[...pitches].reverse().join(" ")})`;
}

function articulationEffect(
  note: TabNote,
  previousOnString: PreviousNoteOnString | undefined,
): string | null {
  const articulation = note.articulationFromPrevious;
  if (articulation === undefined || articulation === "picked") {
    return null;
  }

  if (!isValidArticulationFromPrevious(articulation, previousOnString, note)) {
    return null;
  }

  return ARTICULATION_EFFECTS[articulation] ?? null;
}

function noteTechniqueEffect(
  note: TabNote,
  tuning: string[],
  previousBendQt: number | null,
): string | null {
  if (note.technique === undefined) return null;

  if (note.technique === "bend") {
    const qt = bendQuarterTones(note, tuning);
    return `b (0 ${qt})`;
  }

  if (note.technique === "release") {
    const qt = previousBendQt ?? bendQuarterTones(note, tuning);
    return `b (${qt} 0)`;
  }

  return NOTE_TECHNIQUE_EFFECTS[note.technique] ?? null;
}

function noteEffects(
  note: TabNote,
  tuning: string[],
  accented: boolean,
  previousBendQt: number | null,
  previousOnString: PreviousNoteOnString | undefined,
  flags: EmitFlags,
): string[] {
  const effects: string[] = [];

  const articulation = articulationEffect(note, previousOnString);
  if (articulation !== null) effects.push(articulation);

  const technique = noteTechniqueEffect(note, tuning, previousBendQt);
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
  previousOnString: PreviousNoteOnString | undefined,
  flags: EmitFlags,
): string {
  return `${note.fret}.${note.string}${formatEffects(
    noteEffects(
      note,
      tuning,
      accented,
      previousBendQt,
      previousOnString,
      flags,
    ),
  )}`;
}

function beatToAlphaTex(
  beat: TabBeat,
  tuning: string[],
  previousBendQt: number | null,
  lastNoteOnString: Map<TabNoteString, PreviousNoteOnString>,
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
    const previousOnString = lastNoteOnString.get(note.string);
    const tex = `${noteToAlphaTex(note, tuning, accented, previousBendQt, previousOnString, flags)}.${dur}${beatFx}`;
    lastNoteOnString.set(note.string, { fret: note.fret });
    return { tex, bendQt: nextBendQt };
  }

  // Chord: accent applies to each note; beat effects stay after duration.
  const noteStr = beat.notes
    .map((n) => {
      const previousOnString = lastNoteOnString.get(n.string);
      const rendered = noteToAlphaTex(
        n,
        tuning,
        accented,
        previousBendQt,
        previousOnString,
        flags,
      );
      lastNoteOnString.set(n.string, { fret: n.fret });
      return rendered;
    })
    .join(" ");
  return { tex: `(${noteStr}).${dur}${beatFx}`, bendQt: nextBendQt };
}

function barToAlphaTex(
  bar: TabBar,
  tuning: string[],
  flags: EmitFlags,
  lastNoteOnString: Map<TabNoteString, PreviousNoteOnString>,
): string {
  let previousBendQt: number | null = null;
  const parts: string[] = [];
  for (const beat of bar.beats) {
    const { tex, bendQt } = beatToAlphaTex(
      beat,
      tuning,
      previousBendQt,
      lastNoteOnString,
      flags,
    );
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
 * Legato effects (`h`, `sl`) are emitted only from `articulationFromPrevious`
 * when the transition passes legato validation — never from proximity or
 * deprecated `technique` fields.
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
  const lastNoteOnString = new Map<TabNoteString, PreviousNoteOnString>();

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
    .map((bar) => `| ${barToAlphaTex(bar, data.tuning, flags, lastNoteOnString)}`)
    .join("\n");

  return `${header}\n${bars}`;
}
