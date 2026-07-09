import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const fourStringAdjacentAscendingLadder: ExerciseSeed = {
  title: "Four-String Adjacent Ascending Ladder",
  slug: "four-string-adjacent-ascending-ladder",
  description:
    "Ascending chromatic ladder across four adjacent strings (low E to G) to train consistent pick-path control, timing, and tone through multiple consecutive adjacent string changes.",
  purpose:
    "Train clean, controlled pick travel through multiple adjacent string changes in ascending motion, building efficiency and consistency across extended string-crossing sequences.",
  targetWeaknesses: [
    "Timing wobbles when chaining multiple adjacent string changes",
    "Uneven tone or volume across ascending string transitions",
    "Excess pick motion treating each adjacent cross like a skip",
    "Losing pick-angle consistency across wider adjacent-string ranges",
  ],
  minimumCleanStandard:
    "All notes ringing clearly with no muting or choking at string changes, timing locked to metronome at every adjacent cross, consistent volume and attack across all four strings, alternate picking direction maintained throughout the pattern.",
  measurementInstructions:
    "Log the highest BPM at which you can play 4 or more consecutive clean loops with locked timing, even tone, and no muted or timing-slipped notes at the string changes. Confirm with Training Verdict and cleanliness self-assessment that the BPM is truly clean.",
  coachingNotes: [
    "Keep pick path short—adjacent crosses need millimetres, not centimetres; glide, do not jump.",
    "Let the metronome be your guide; if you feel rushed at the cross, slow down before speeding up.",
    "Listen for even attack across all four strings; volume dips reveal angle or path inconsistency.",
    "Hold pick angle steady through every change; rotating mid-cross costs tone and timing.",
    "If tension creeps in, regress BPM and focus on smooth, minimal motion at each adjacent cross.",
  ],
  primarySkillId: "string_crossing",
  secondarySkillIds: [],
  difficultyLevel: 6,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "All notes ring clearly with no choking or muting at string changes",
    "Timing stays locked to the metronome through every adjacent cross",
    "Pick angle and attack remain consistent across all four strings",
    "No excess pick motion or arm tension during crosses",
    "Training Verdict is Nailed It or Nearly There for 4+ consecutive loops",
  ],
  commonMistakes: [
    "Rushing the first note immediately after each string change",
    "Using excess pick lift between adjacent strings as if crossing non-adjacent strings",
    "Uneven volume between strings, especially when crossing into thinner strings (4 or 3)",
    "Losing alternate-picking direction mid-pattern",
    "Tensing wrist or forearm when approaching thinner strings",
    "Digging in harder on the destination string to force clarity instead of maintaining consistent angle",
  ],
  progressionRule:
    "Increase BPM by +5 when player logs 2 or more consecutive sessions with Training Verdict Nailed It at current BPM, cleanliness rated clean or very_clean, and difficulty rated Easy or Good.",
  regressionRule:
    "Decrease BPM by -10 when Training Verdict is Needs Work for 2 or more sessions, or player reports difficulty as Impossible, or cleanliness is dirty with audible string-change noise.",
  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 80,
    timeSignature: {
      beats: 4,
      beatValue: 4,
    },
    bars: [
      {
        beats: [
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 5,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 6,
                technique: "picked",
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 7,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 8,
                technique: "picked",
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 5,
                fret: 5,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 5,
                fret: 6,
                technique: "picked",
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 5,
                fret: 7,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 5,
                fret: 8,
                technique: "picked",
              },
            ],
            picking: "up",
          },
        ],
      },
      {
        beats: [
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 6,
                technique: "picked",
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 7,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 8,
                technique: "picked",
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 6,
                technique: "picked",
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 7,
                technique: "picked",
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 8,
                technique: "picked",
              },
            ],
            picking: "up",
          },
        ],
      },
    ],
    displayHints: {
      showPicking: true,
      showAccents: false,
      showFingering: false,
      loopStartBar: 0,
      loopEndBar: 1,
    },
  },
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
        {
          id: "nailed_it",
          label: "Nailed It",
        },
        {
          id: "nearly_there",
          label: "Nearly There",
        },
        {
          id: "needs_work",
          label: "Needs Work",
        },
      ],
    },
    {
      id: "difficulty",
      label: "Difficulty",
      type: "segmented",
      required: true,
      options: [
        {
          id: "easy",
          label: "Easy",
        },
        {
          id: "good",
          label: "Good",
        },
        {
          id: "hard",
          label: "Hard",
        },
        {
          id: "impossible",
          label: "Impossible",
        },
      ],
    },
    {
      id: "cleanliness",
      label: "Cleanliness at string changes",
      type: "choice",
      required: true,
      options: [
        {
          id: "very_clean",
          label: "Very clean",
        },
        {
          id: "clean",
          label: "Clean",
        },
        {
          id: "slightly_dirty",
          label: "Slightly dirty",
        },
        {
          id: "dirty",
          label: "Dirty",
        },
      ],
      followUpRules: [
        {
          ifOptionId: "slightly_dirty",
          showQuestionId: "noise_location",
        },
        {
          ifOptionId: "dirty",
          showQuestionId: "noise_location",
        },
      ],
    },
    {
      id: "noise_location",
      label: "Where did the noise happen?",
      type: "choice",
      required: false,
      options: [
        {
          id: "cross_6_5",
          label: "6→5 cross",
        },
        {
          id: "cross_5_4",
          label: "5→4 cross",
        },
        {
          id: "cross_4_3",
          label: "4→3 cross",
        },
        {
          id: "multiple",
          label: "Multiple spots",
        },
      ],
    },
  ],
  estimatedMinutes: 8,
  isMvp: true,
  version: 1,
  status: "active",
};

export const stringCrossingExercises: ExerciseSeed[] = [
  fourStringAdjacentAscendingLadder,
];
