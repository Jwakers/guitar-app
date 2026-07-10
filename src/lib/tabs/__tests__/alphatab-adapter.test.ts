import { describe, expect, it } from "vitest";
import { tabDataToAlphaTex } from "../alphatab-adapter";
import type { TabData } from "../internal-schema";

const halfStepBendTab: TabData = {
  tuning: ["E", "A", "D", "G", "B", "E"],
  tempo: 60,
  timeSignature: { beats: 4, beatValue: 4 },
  bars: [
    {
      beats: [
        {
          duration: "quarter",
          notes: [{ string: 2, fret: 7, finger: 3, targetPitch: "F#4" }],
        },
        {
          duration: "quarter",
          accent: true,
          notes: [
            {
              string: 2,
              fret: 7,
              finger: 3,
              technique: "bend",
              targetPitch: "G4",
            },
          ],
        },
      ],
    },
  ],
};

const baseTab = (overrides: Partial<TabData> = {}): TabData => ({
  tuning: ["E", "A", "D", "G", "B", "E"],
  tempo: 90,
  timeSignature: { beats: 4, beatValue: 4 },
  bars: [
    {
      beats: [
        {
          duration: "eighth",
          notes: [{ string: 6, fret: 5 }],
        },
      ],
    },
  ],
  ...overrides,
});

describe("tabDataToAlphaTex", () => {
  it("emits score+tabs staff header", () => {
    const tex = tabDataToAlphaTex(baseTab());
    expect(tex).toContain("\\staff{score tabs}");
    expect(tex).toContain("\\tuning (E4 B3 G3 D3 A2 E2)");
    expect(tex).toContain("\\ts(4 4)");
    expect(tex).toContain("\\tempo 90");
  });

  it("places bend effects on the note before duration", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                notes: [
                  { string: 2, fret: 7, technique: "bend", targetPitch: "G#4" },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("7.2{b (0 4)}.4");
  });

  it("throws when a bend note has no targetPitch", () => {
    expect(() =>
      tabDataToAlphaTex(
        baseTab({
          bars: [
            {
              beats: [
                {
                  duration: "quarter",
                  notes: [{ string: 1, fret: 7, technique: "bend" }],
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow(/targetPitch/);
  });

  it("throws when bend targetPitch exceeds supported range", () => {
    expect(() =>
      tabDataToAlphaTex(
        baseTab({
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
      ),
    ).toThrow(/exceeds maximum supported bend/);
  });

  it("infers half-step bend amount from targetPitch", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
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
      }),
    );
    // B3+7 = F#4 → G4 is one semitone → 2 quarter-tones ("1/2" in AlphaTab).
    expect(tex).toContain("7.2{b (0 2)}.4");
  });

  it("infers whole-step bend amount from targetPitch", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
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
    );
    expect(tex).toContain("7.2{b (0 4)}.4");
  });

  it("never emits left-hand fingering in AlphaTeX", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        displayHints: { showFingering: true },
        bars: [
          {
            beats: [
              {
                duration: "eighth",
                notes: [
                  { string: 4, fret: 5, technique: "hammer_on", finger: 1 },
                ],
              },
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    finger: 3,
                    technique: "bend",
                    targetPitch: "G4",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("5.4{h}.8");
    expect(tex).toContain("7.2{b (0 2)}.4");
    expect(tex).not.toContain("lf");
  });

  it("emits half-step bends for a half-step bend accuracy pattern", () => {
    const tex = tabDataToAlphaTex(halfStepBendTab);
    expect(tex).toContain("b (0 2)");
    expect(tex).not.toContain("b (0 4)");
    expect(tex).toContain("7.2{b (0 2) ac}.4");
    expect(tex).not.toContain("lf");
  });

  it("emits rests without crashing", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [{ duration: "quarter", notes: [], rest: true }],
          },
        ],
      }),
    );
    expect(tex).toContain("r.4");
  });

  it("emits accents as note effects before duration", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                accent: true,
                notes: [
                  { string: 5, fret: 3, technique: "vibrato" },
                  { string: 4, fret: 2 },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("(3.5{v ac} 2.4{ac}).4");
  });

  it("omits accents when showAccents is false", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        displayHints: { showAccents: false },
        bars: [
          {
            beats: [
              {
                duration: "quarter",
                accent: true,
                notes: [{ string: 5, fret: 3 }],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("3.5.4");
    expect(tex).not.toContain("ac");
  });

  it("emits pick strokes only when showPicking is true", () => {
    const withHint = tabDataToAlphaTex(
      baseTab({
        displayHints: { showPicking: true },
        bars: [
          {
            beats: [
              {
                duration: "eighth",
                picking: "down",
                notes: [
                  {
                    string: 2,
                    fret: 10,
                    finger: 3,
                    technique: "slide",
                  },
                ],
              },
              {
                duration: "eighth",
                picking: "up",
                notes: [{ string: 2, fret: 12 }],
              },
            ],
          },
        ],
      }),
    );
    expect(withHint).toContain("10.2{sl}.8{sd}");
    expect(withHint).toContain("12.2.8{su}");
    expect(withHint).not.toContain("lf");

    const withoutHint = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              {
                duration: "eighth",
                picking: "down",
                notes: [{ string: 2, fret: 10, technique: "slide" }],
              },
            ],
          },
        ],
      }),
    );
    expect(withoutHint).toContain("10.2{sl}.8");
    expect(withoutHint).not.toContain("sd");
  });
});
