import type {
  TabBar,
  TabBeat,
  TabBeatDuration,
  TabData,
  TabNote,
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
  // Triplet eighth — individual notes get the {tu 3} beat effect in AlphaTeX.
  triplet: 8,
};

// ---------------------------------------------------------------------------
// Converters
// ---------------------------------------------------------------------------

// AlphaTeX note format is {fret}.{string} — fret first, string second.
// String numbering matches our schema: 1 = high E (thinnest), 6 = low E (thickest).
function noteToAlphaTex(note: TabNote): string {
  return `${note.fret}.${note.string}`;
}

function beatToAlphaTex(beat: TabBeat): string {
  const dur = DURATION_MAP[beat.duration];
  const tupletSuffix = beat.duration === "triplet" ? "{tu 3}" : "";

  if (beat.rest === true || beat.notes.length === 0) {
    return `r.${dur}${tupletSuffix}`;
  }

  if (beat.notes.length === 1) {
    return `${noteToAlphaTex(beat.notes[0])}.${dur}${tupletSuffix}`;
  }

  // Chord: (s1.f1 s2.f2 ...).dur
  const noteStr = beat.notes.map(noteToAlphaTex).join(" ");
  return `(${noteStr}).${dur}${tupletSuffix}`;
}

function barToAlphaTex(bar: TabBar): string {
  return bar.beats.map(beatToAlphaTex).join(" ");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Converts structured TabData to an AlphaTeX notation string suitable for
 * passing to `AlphaTabApi.tex()`.
 *
 * AlphaTeX note format: {fret}.{string}.{duration}  (fret first, string second)
 * AlphaTeX reference: https://alphatab.net/docs/reference/score/
 *
 * Example output for this drill:
 *   \ts(4 4)
 *   \tempo 90
 *   | 5.6.8 6.6.8 7.6.8 8.6.8 7.6.8 6.6.8 5.6.8 6.6.8
 *   | 7.6.8 8.6.8 7.6.8 6.6.8 5.6.8 6.6.8 7.6.8 8.6.8
 */
export function tabDataToAlphaTex(data: TabData): string {
  const header = [
    // Parentheses are required for metadata arguments in AlphaTeX.
    `\\ts(${data.timeSignature.beats} ${data.timeSignature.beatValue})`,
    `\\tempo ${data.tempo}`,
  ].join("\n");

  const bars = data.bars
    .map((bar) => `| ${barToAlphaTex(bar)}`)
    .join("\n");

  return `${header}\n${bars}`;
}
