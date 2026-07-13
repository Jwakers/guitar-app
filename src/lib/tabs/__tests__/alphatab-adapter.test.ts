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

/** Snapshot from exercise kh72tb7b46509r826xd60y9stx8aec8c (sliding pentatonic phrase). */
const slidingPentatonicPhraseTab: TabData = {
  tuning: ["E", "A", "D", "G", "B", "E"],
  tempo: 80,
  timeSignature: { beats: 4, beatValue: 4 },
  displayHints: {
    loopEndBar: 1,
    loopStartBar: 0,
    showFingering: false,
    showPicking: false,
  },
  bars: [
    {
      beats: [
        {
          duration: "eighth",
          notes: [{ finger: 1, fret: 5, string: 3, targetPitch: "D4" }],
        },
        {
          duration: "quarter",
          notes: [
            {
              articulationFromPrevious: "slide",
              finger: 3,
              fret: 7,
              string: 3,
              targetPitch: "E4",
            },
          ],
        },
        {
          duration: "eighth",
          notes: [{ finger: 1, fret: 8, string: 2, targetPitch: "G4" }],
        },
        {
          duration: "eighth",
          notes: [{ finger: 1, fret: 8, string: 2, targetPitch: "G4" }],
        },
        {
          duration: "quarter",
          notes: [
            {
              articulationFromPrevious: "slide",
              finger: 3,
              fret: 10,
              string: 2,
              targetPitch: "A4",
            },
          ],
        },
      ],
    },
    {
      beats: [
        {
          duration: "eighth",
          notes: [{ finger: 1, fret: 8, string: 1, targetPitch: "C5" }],
        },
        {
          duration: "eighth",
          notes: [{ finger: 3, fret: 10, string: 2, targetPitch: "A4" }],
        },
        {
          duration: "eighth",
          notes: [{ finger: 1, fret: 8, string: 2, targetPitch: "G4" }],
        },
        {
          duration: "quarter",
          notes: [
            {
              articulationFromPrevious: "slide",
              finger: 1,
              fret: 5,
              string: 2,
              targetPitch: "E4",
            },
          ],
        },
        {
          duration: "eighth",
          notes: [{ finger: 3, fret: 7, string: 3, targetPitch: "E4" }],
        },
        {
          duration: "quarter",
          notes: [
            {
              articulationFromPrevious: "slide",
              finger: 1,
              fret: 5,
              string: 3,
              targetPitch: "D4",
            },
          ],
        },
      ],
    },
  ],
};

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

  it("throws when bend targetPitch is not half or whole step", () => {
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
                      targetPitch: "A4",
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow(/half step \(1 semitone\) or whole step \(2 semitones\)/);
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

  it("emits hammer-on from articulationFromPrevious on same string", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              {
                duration: "eighth",
                notes: [{ string: 1, fret: 5, finger: 1 }],
              },
              {
                duration: "eighth",
                notes: [
                  {
                    string: 1,
                    fret: 7,
                    finger: 1,
                    articulationFromPrevious: "hammer_on",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("7.1{h}.8");
    expect(tex).not.toContain("lf");
  });

  it("does not emit hammer-on for invalid cross-string articulation", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              {
                duration: "eighth",
                notes: [{ string: 1, fret: 5 }],
              },
              {
                duration: "eighth",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    articulationFromPrevious: "hammer_on",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("7.2.8");
    expect(tex).not.toMatch(/7\.2\{h\}/);
  });

  it("emits pull-off from articulationFromPrevious on same string", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              { duration: "eighth", notes: [{ string: 1, fret: 7 }] },
              {
                duration: "eighth",
                notes: [
                  {
                    string: 1,
                    fret: 5,
                    articulationFromPrevious: "pull_off",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("5.1{h}.8");
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
                notes: [{ string: 4, fret: 5, finger: 1 }],
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

  it("emits ascending slide as sib with beam merge on source beat", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              { duration: "eighth", notes: [{ string: 2, fret: 5 }] },
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 7,
                    articulationFromPrevious: "slide",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("5.2.8{beam merge}");
    expect(tex).toContain("7.2{sib}.4");
    expect(tex).not.toContain("{sl}");
  });

  it("emits descending slide as sia with beam merge on source beat", () => {
    const tex = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              { duration: "eighth", notes: [{ string: 2, fret: 8 }] },
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 5,
                    articulationFromPrevious: "slide",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(tex).toContain("8.2.8{beam merge}");
    expect(tex).toContain("5.2{sia}.4");
    expect(tex).not.toContain("{sl}");
  });

  it("emits four directional slides for the sliding pentatonic phrase", () => {
    const tex = tabDataToAlphaTex(slidingPentatonicPhraseTab);
    expect(tex).toMatchInlineSnapshot(`
      "\\staff{score tabs}
      \\tuning (E4 B3 G3 D3 A2 E2)
      \\ts(4 4)
      \\tempo 80
      | 5.3.8{beam merge} 7.3{sib}.4 8.2.8 8.2.8{beam merge} 10.2{sib}.4
      | 8.1.8 10.2.8 8.2.8{beam merge} 5.2{sia}.4 7.3.8{beam merge} 5.3{sia}.4"
    `);
  });

  it("slide AlphaTeX repro matrix: directional slide-into plus beam merge", () => {
    const ascending = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              { duration: "eighth", notes: [{ string: 3, fret: 5 }] },
              {
                duration: "quarter",
                notes: [
                  {
                    string: 3,
                    fret: 7,
                    articulationFromPrevious: "slide",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(ascending).toContain("5.3.8{beam merge} 7.3{sib}.4");

    const descending = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              { duration: "eighth", notes: [{ string: 2, fret: 8 }] },
              {
                duration: "quarter",
                notes: [
                  {
                    string: 2,
                    fret: 5,
                    articulationFromPrevious: "slide",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(descending).toContain("8.2.8{beam merge} 5.2{sia}.4");
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
                notes: [{ string: 2, fret: 8 }],
              },
              {
                duration: "eighth",
                picking: "down",
                notes: [
                  {
                    string: 2,
                    fret: 10,
                    finger: 3,
                    articulationFromPrevious: "slide",
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
    expect(withHint).toContain("10.2{sib}.8{sd}");
    expect(withHint).toContain("12.2.8{su}");
    expect(withHint).not.toContain("lf");

    const withoutHint = tabDataToAlphaTex(
      baseTab({
        bars: [
          {
            beats: [
              { duration: "eighth", notes: [{ string: 2, fret: 5 }] },
              {
                duration: "eighth",
                notes: [
                  {
                    string: 2,
                    fret: 10,
                    articulationFromPrevious: "slide",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    expect(withoutHint).toContain("5.2.8{beam merge}");
    expect(withoutHint).toContain("10.2{sib}.8");
    expect(withoutHint).not.toContain("sd");
  });
});
