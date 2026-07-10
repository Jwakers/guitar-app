import { describe, expect, it } from "vitest";
import { validateTabData } from "../validate-tab-data";

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
                    targetPitch: "G6",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toThrow(/exceeds maximum supported bend/);
  });

  it("accepts drop-D tuning with octave-less open strings", () => {
    expect(() =>
      validateTabData({
        tuning: ["D", "A", "D", "G", "B", "E"],
        tempo: 90,
        timeSignature: { beats: 4, beatValue: 4 },
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
