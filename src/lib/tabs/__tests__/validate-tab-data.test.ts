import { describe, expect, it } from "vitest";
import { INVALID_CROSS_STRING_LEGATO } from "../legato-validation";
import { validateTabData } from "../validate-tab-data";
import type { TabNote } from "../internal-schema";

const baseTab = {
  tuning: ["E", "A", "D", "G", "B", "E"],
  tempo: 90,
  timeSignature: { beats: 4, beatValue: 4 },
  bars: [
    {
      beats: [
        {
          duration: "quarter",
          notes: [
            {
              string: 2,
              fret: 7,
              technique: "bend",
              targetPitch: "G4",
            },
          ],
        },
      ],
    },
  ],
};

function makeLegatoTab(beats: { duration: string; notes: TabNote[] }[]) {
  return {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 90,
    timeSignature: { beats: 4, beatValue: 4 },
    bars: [{ beats }],
  };
}

describe("validateTabData bend validation", () => {
  it("accepts a valid octave-qualified bend target", () => {
    expect(() => validateTabData(baseTab)).not.toThrow();
  });

  it("rejects bare pitch names without octave", () => {
    expect(() =>
      validateTabData({
        ...baseTab,
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    technique: "bend",
                    targetPitch: "G",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toThrow(/octave-qualified pitch/);
  });

  it("rejects bend targets below the fretted note", () => {
    expect(() =>
      validateTabData({
        ...baseTab,
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    technique: "bend",
                    targetPitch: "E2",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toThrow(/must be above the fretted note/);
  });

  it("rejects bend intervals other than half or whole step", () => {
    expect(() =>
      validateTabData({
        ...baseTab,
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    technique: "bend",
                    targetPitch: "A4",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toThrow(/half step \(1 semitone\) or whole step \(2 semitones\), got 3/);
  });

  it("rejects excessively large bend intervals", () => {
    expect(() =>
      validateTabData({
        ...baseTab,
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    technique: "bend",
                    targetPitch: "D#5",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toThrow(/half step \(1 semitone\) or whole step \(2 semitones\), got 9/);
  });

  it("accepts whole-step bend target", () => {
    expect(() =>
      validateTabData({
        ...baseTab,
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    technique: "bend",
                    targetPitch: "G#4",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).not.toThrow();
  });

  it("accepts drop-D tuning with octave-less open strings", () => {
    expect(() =>
      validateTabData({
        ...baseTab,
        tuning: ["D", "A", "D", "G", "B", "E"],
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  {
                    string: 6,
                    fret: 0,
                    technique: "bend",
                    targetPitch: "D#2",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).not.toThrow();
  });
});

describe("validateTabData legato validation", () => {
  it("accepts valid hammer-on on same string (lower to higher fret)", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 5 }] },
          {
            duration: "eighth",
            notes: [
              { string: 1, fret: 7, articulationFromPrevious: "hammer_on" },
            ],
          },
        ]),
      ),
    ).not.toThrow();
  });

  it("rejects hammer-on across strings", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 5 }] },
          {
            duration: "eighth",
            notes: [
              { string: 2, fret: 7, articulationFromPrevious: "hammer_on" },
            ],
          },
        ]),
      ),
    ).toThrow(INVALID_CROSS_STRING_LEGATO);
  });

  it("rejects hammer-on from higher fret to lower fret", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 7 }] },
          {
            duration: "eighth",
            notes: [
              { string: 1, fret: 5, articulationFromPrevious: "hammer_on" },
            ],
          },
        ]),
      ),
    ).toThrow(/hammer-on requires/);
  });

  it("accepts valid pull-off on same string (higher to lower fret)", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 7 }] },
          {
            duration: "eighth",
            notes: [
              { string: 1, fret: 5, articulationFromPrevious: "pull_off" },
            ],
          },
        ]),
      ),
    ).not.toThrow();
  });

  it("accepts valid pull-off to open string", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 7 }] },
          {
            duration: "eighth",
            notes: [
              { string: 1, fret: 0, articulationFromPrevious: "pull_off" },
            ],
          },
        ]),
      ),
    ).not.toThrow();
  });

  it("rejects pull-off across strings", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 7 }] },
          {
            duration: "eighth",
            notes: [
              { string: 2, fret: 5, articulationFromPrevious: "pull_off" },
            ],
          },
        ]),
      ),
    ).toThrow(INVALID_CROSS_STRING_LEGATO);
  });

  it("rejects pull-off from lower fret to higher fret", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 5 }] },
          {
            duration: "eighth",
            notes: [
              { string: 1, fret: 7, articulationFromPrevious: "pull_off" },
            ],
          },
        ]),
      ),
    ).toThrow(/pull-off requires/);
  });

  it("requires slide to stay on same string", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 5 }] },
          {
            duration: "eighth",
            notes: [
              { string: 2, fret: 7, articulationFromPrevious: "slide" },
            ],
          },
        ]),
      ),
    ).toThrow(/slide requires/);
  });

  it("accepts valid slide on same string", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          { duration: "eighth", notes: [{ string: 1, fret: 5 }] },
          {
            duration: "eighth",
            notes: [
              { string: 1, fret: 7, articulationFromPrevious: "slide" },
            ],
          },
        ]),
      ),
    ).not.toThrow();
  });

  it("rejects legacy technique hammer_on on technique field", () => {
    expect(() =>
      validateTabData(
        makeLegatoTab([
          {
            duration: "eighth",
            notes: [{ string: 1, fret: 7, technique: "hammer_on" as never }],
          },
        ]),
      ),
    ).toThrow(/articulationFromPrevious/);
  });
});
