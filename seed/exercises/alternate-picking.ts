import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const singleStringAlternatePickingControl: ExerciseSeed = {
  title: "Single String Alternate Picking Control",
  slug: "single-string-alternate-picking-control",
  version: 1,
  status: "active",

  description:
    "A foundational alternate picking drill on one string designed to build clean timing, strict pick direction, and relaxed motion.",

  purpose:
    "Build clean, repeatable alternate picking on one string before adding string changes or more complex coordination.",

  primarySkillId: "alternate_picking",

  secondarySkillIds: ["rhythm", "synchronisation"],

  targetWeaknesses: [
    "inconsistent pick direction",
    "rushing as tempo increases",
    "excess pick-hand tension",
    "poor hand synchronisation",
  ],

  difficultyLevel: 3,

  exerciseType: "primary",

  primaryProgressMetric: "clean_bpm",

  supportsBpm: true,

  defaultTargetBpm: 90,

  minimumCleanStandard:
    "The drill only counts as clean if the notes are evenly spaced, strict down-up picking is maintained, and the player feels able to repeat the performance again without noticeable tension.",

  measurementInstructions:
    "Log the highest BPM where you can repeat the drill cleanly for the prescribed duration without losing strict alternate picking, rushing, or adding noticeable tension.",

  successCriteria: [
    "Pick direction stays strictly down-up.",
    "Notes are evenly spaced.",
    "No rushing occurs at the end of the pattern.",
    "Fretting hand and picking hand stay synchronised.",
    "Picking hand stays relaxed.",
    "The player can repeat the pattern cleanly at the target BPM.",
  ],

  commonMistakes: [
    "Starting too fast.",
    "Tensing the wrist or forearm.",
    "Picking too deeply into the string.",
    "Letting the pick direction reset accidentally.",
    "Rushing the descending notes.",
    "Pressing too hard with the fretting hand.",
  ],

  coachingNotes: [
    "Use strict alternate picking throughout.",
    "Start slowly enough that every note sounds even.",
    "Use fingers 1, 2, 3, and 4 for frets 5, 6, 7, and 8.",
    "Keep the picking motion small and relaxed.",
    "Do not increase speed unless the pattern feels repeatable and controlled.",
    "Listen for even spacing between notes rather than focusing only on speed.",
  ],

  progressionRule:
    "Increase target BPM by 3–5 BPM after two recent Nailed It logs at the current target.",

  regressionRule:
    "Reduce target BPM by 5–10 BPM if the player logs Needs Work twice in a row, or reports pain, tension, or repeated timing breakdown.",

  feedbackSchema: [
    {
      id: "actual_bpm",
      label: "Clean BPM",
      type: "number",
      required: true,
    },
    {
      id: "training_verdict",
      label: "Training Verdict",
      type: "segmented",
      required: true,
      options: [
        { id: "nailed_it", label: "Nailed It" },
        { id: "nearly_there", label: "Nearly There" },
        { id: "needs_work", label: "Needs Work" },
      ],
    },
    {
      id: "difficulty",
      label: "Difficulty",
      type: "segmented",
      required: true,
      options: [
        { id: "easy", label: "Easy" },
        { id: "good", label: "Good" },
        { id: "hard", label: "Hard" },
        { id: "impossible", label: "Impossible" },
      ],
      followUpRules: [
        {
          ifOptionId: "impossible",
          showQuestionId: "difficulty_cause",
        },
      ],
    },
    {
      id: "cleanliness",
      label: "Cleanliness",
      type: "segmented",
      required: true,
      options: [
        { id: "messy", label: "Messy" },
        { id: "mostly_clean", label: "Mostly Clean" },
        { id: "clean", label: "Clean" },
      ],
    },
    {
      id: "difficulty_cause",
      label: "What caused the difficulty?",
      type: "choice",
      required: false,
      options: [
        { id: "too_fast", label: "Too fast" },
        { id: "coordination", label: "Coordination" },
        { id: "hand_fatigue", label: "Hand fatigue" },
        { id: "pain", label: "Pain" },
        { id: "unclear", label: "Didn't understand" },
      ],
    },
  ],

  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 90,
    timeSignature: {
      beats: 4,
      beatValue: 4,
    },
    bars: [
      {
        beats: [
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 5, finger: 1 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 6, finger: 2 }],
          },
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 7, finger: 3 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 8, finger: 4 }],
          },
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 7, finger: 3 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 6, finger: 2 }],
          },
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 5, finger: 1 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 6, finger: 2 }],
          },
        ],
      },
      {
        beats: [
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 7, finger: 3 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 8, finger: 4 }],
          },
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 7, finger: 3 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 6, finger: 2 }],
          },
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 5, finger: 1 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 6, finger: 2 }],
          },
          {
            duration: "eighth",
            picking: "down",
            notes: [{ string: 6, fret: 7, finger: 3 }],
          },
          {
            duration: "eighth",
            picking: "up",
            notes: [{ string: 6, fret: 8, finger: 4 }],
          },
        ],
      },
    ],
    displayHints: {
      showPicking: true,
      showFingering: true,
      loopStartBar: 1,
      loopEndBar: 2,
    },
  },

  estimatedMinutes: 5,

  isMvp: true,
};

export const alternatePickingExercises: ExerciseSeed[] = [
  singleStringAlternatePickingControl,
];
