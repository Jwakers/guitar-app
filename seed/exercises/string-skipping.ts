import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const adjacentToNonAdjacentStringCrossing: ExerciseSeed = {
  title: "Adjacent to Non-Adjacent String Crossing",
  slug: "adjacent-to-non-adjacent-string-crossing",
  description:
    "Train accurate and efficient pick movement across non-adjacent strings with controlled motion, targeting string crossing mechanics while maintaining timing and pick angle consistency.",
  purpose:
    "Isolate and develop the specific mechanical skill of crossing non-adjacent strings cleanly with the pick, bridging the gap between simple adjacent-string changes and full string skipping.",
  targetWeaknesses: [
    "Loss of control when crossing non-adjacent strings",
    "Inconsistent pick angle across string changes",
    "Unwanted string noise during large pick movements",
    "Timing slips when traversing multiple strings",
    "Excessive motion or tension in the picking hand during string crossings",
  ],
  minimumCleanStandard:
    "All notes must ring clearly with no fret buzz, muted strikes, or timing errors. At least 90% of repetitions within the session must be clean at the logged BPM.",
  measurementInstructions:
    "Log the highest BPM at which you can play both bars cleanly in a loop for at least 1 minute, with consistent pick attack, clear notes, and locked timing. Only log repeatable clean performance, not one-off successes.",
  coachingNotes: [
    "Focus on the pick path: let the pick glide over the skipped strings rather than lifting high above them.",
    "Keep your pick angle consistent—most string crossing problems come from rotating the pick mid-motion.",
    "Use the minimum motion necessary; efficient string crossing is about control, not speed.",
    "Mute lightly with your fretting hand palm or unused fingers to avoid sympathetic ringing.",
    "If you feel tension in your forearm or shoulder, slow down and check that your wrist is doing most of the work.",
  ],
  primarySkillId: "string_crossing",
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "All notes ring cleanly with no fret buzz or muted strikes",
    "Pick motion is smooth and controlled across all string crossings",
    "Timing is locked to the metronome with no rushing or dragging",
    "No unwanted string noise between notes",
    "Consistent pick attack and tone across all three strings",
  ],
  commonMistakes: [
    "Using excessive motion in the picking hand instead of controlled, efficient movements",
    "Changing pick angle mid-cross, causing inconsistent tone or missed notes",
    "Allowing sympathetic ringing from open or adjacent strings",
    "Tensing the shoulder or forearm rather than using wrist and finger motion",
    "Rushing through crossings or losing the downbeat",
  ],
  progressionRule:
    "Progress to +5 BPM when the user logs 3 consecutive sessions at the current target BPM with Training Verdict 'Nailed It' or 'Nearly There', cleanliness rating 'clean' or 'mostly_clean', and difficulty rating 'easy' or 'good'. Confidence must be medium or high.",
  regressionRule:
    "Regress by −5 BPM if the user logs 2 consecutive sessions with Training Verdict 'Needs Work', difficulty rating 'impossible', or cleanliness 'struggled'. If regression would go below 60 BPM, hold at 60 BPM and suggest reviewing basic alternate picking or fretting accuracy.",
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
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 2,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 2,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
        ],
      },
      {
        beats: [
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 2,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 2,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
            accent: false,
            rest: false,
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 4,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
            accent: false,
            rest: false,
          },
        ],
      },
    ],
    displayHints: {
      showPicking: true,
      showAccents: false,
      showFingering: true,
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
      label: "Cleanliness",
      type: "segmented",
      required: true,
      options: [
        {
          id: "clean",
          label: "Clean",
        },
        {
          id: "mostly_clean",
          label: "Mostly Clean",
        },
        {
          id: "struggled",
          label: "Struggled",
        },
      ],
    },
    {
      id: "issue",
      label: "What was the main challenge?",
      type: "choice",
      required: false,
      options: [
        {
          id: "pick_motion",
          label: "Pick motion inconsistent",
        },
        {
          id: "string_noise",
          label: "Unwanted string noise",
        },
        {
          id: "timing",
          label: "Timing slipped",
        },
        {
          id: "tension",
          label: "Tension in hand/arm",
        },
        {
          id: "other",
          label: "Other",
        },
      ],
      followUpRules: [
        {
          ifOptionId: "needs_work",
          showQuestionId: "issue",
        },
      ],
    },
  ],
  estimatedMinutes: 3,
  isMvp: true,
  version: 1,
  status: "active",
};

export const stringSkippingExercises: ExerciseSeed[] = [
  adjacentToNonAdjacentStringCrossing,
];
