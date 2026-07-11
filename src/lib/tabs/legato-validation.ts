import type {
  NoteArticulation,
  TabData,
  TabNote,
  TabNoteString,
} from "./internal-schema";

export const INVALID_CROSS_STRING_LEGATO =
  "Invalid legato: hammer-on or pull-off connects notes on different strings.";

export const NO_ANCHOR_NOTE_LEGATO =
  "Invalid legato: hammer-on or pull-off requires a previous note on the same string.";

const LEGATO_ARTICULATIONS = new Set<NoteArticulation>([
  "hammer_on",
  "pull_off",
  "slide",
]);

export type FlatNoteEntry = {
  path: string;
  note: TabNote;
};

export function flattenNoteSequence(tabData: TabData): FlatNoteEntry[] {
  const entries: FlatNoteEntry[] = [];

  for (let barIndex = 0; barIndex < tabData.bars.length; barIndex++) {
    const bar = tabData.bars[barIndex]!;
    for (let beatIndex = 0; beatIndex < bar.beats.length; beatIndex++) {
      const beat = bar.beats[beatIndex]!;
      for (let noteIndex = 0; noteIndex < beat.notes.length; noteIndex++) {
        const note = beat.notes[noteIndex]!;
        entries.push({
          path: `tabData.bars[${barIndex}].beats[${beatIndex}].notes[${noteIndex}]`,
          note,
        });
      }
    }
  }

  return entries;
}

type PreviousNoteOnString = {
  fret: number;
  path: string;
};

export function isValidArticulationFromPrevious(
  articulation: NoteArticulation,
  previous: PreviousNoteOnString | undefined,
  current: Pick<TabNote, "fret">,
): boolean {
  if (articulation === "picked") {
    return true;
  }

  if (previous === undefined) {
    return false;
  }

  switch (articulation) {
    case "hammer_on":
      return current.fret > previous.fret && current.fret > 0;
    case "pull_off":
      return previous.fret > 0 && current.fret < previous.fret;
    case "slide":
      return current.fret !== previous.fret;
    default:
      return false;
  }
}

function legatoErrorMessage(
  articulation: NoteArticulation,
  path: string,
  previous: PreviousNoteOnString | undefined,
  anyNoteSeen: boolean,
): string {
  if (
    (articulation === "hammer_on" || articulation === "pull_off") &&
    previous === undefined
  ) {
    if (anyNoteSeen) {
      return `${path}: ${INVALID_CROSS_STRING_LEGATO}`;
    }
    return `${path}: ${NO_ANCHOR_NOTE_LEGATO}`;
  }

  switch (articulation) {
    case "hammer_on":
      return `${path}: hammer-on requires a previous note on the same string with a lower fret`;
    case "pull_off":
      return `${path}: pull-off requires a previous fretted note on the same string with a higher fret`;
    case "slide":
      return `${path}: slide requires a previous note on the same string with a different fret`;
    default:
      return `${path}: invalid articulationFromPrevious "${articulation}"`;
  }
}

export function validateLegatoArticulations(tabData: TabData): void {
  const lastNoteOnString = new Map<TabNoteString, PreviousNoteOnString>();
  let anyNoteSeen = false;

  for (const { path, note } of flattenNoteSequence(tabData)) {
    const articulation = note.articulationFromPrevious;

    if (note.technique === "vibrato" && articulation !== undefined) {
      if (LEGATO_ARTICULATIONS.has(articulation)) {
        throw new Error(
          `${path}: vibrato must apply to a sustained note, not a legato connection`,
        );
      }
    }

    if (articulation === undefined) {
      anyNoteSeen = true;
      lastNoteOnString.set(note.string, { fret: note.fret, path });
      continue;
    }

    const previous = lastNoteOnString.get(note.string);

    if (!isValidArticulationFromPrevious(articulation, previous, note)) {
      throw new Error(
        legatoErrorMessage(articulation, path, previous, anyNoteSeen),
      );
    }

    anyNoteSeen = true;
    lastNoteOnString.set(note.string, { fret: note.fret, path });
  }
}
