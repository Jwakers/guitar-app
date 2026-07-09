import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const fourFretChromaticPlacement: ExerciseSeed = {
  title: "Four-Fret Chromatic Placement",
  slug: "four-fret-chromatic-placement",
  description:
    "Single-string chromatic exercise using one-finger-per-fret positioning to develop clean, buzz-free fretting and accurate finger placement behind the fret.",
  purpose:
    "Develop accurate, buzz-free fretting by pressing cleanly behind the fret on a single string while maintaining one-finger-per-fret positioning across four frets.",
  targetWeaknesses: [
    "Inconsistent finger placement behind fret",
    "Fret buzz from insufficient or misplaced pressure",
    "Collapsed or over-extended finger joints",
    "Slow or uncertain finger placement",
  ],
  minimumCleanStandard:
    "Every note must ring clearly with no fret buzz, muted tone, or pitch distortion. If any note in the pattern buzzes or dies, the rep does not count as clean.",
  measurementInstructions:
    "Log the highest BPM at which you can play three consecutive clean reps (ascending + descending = one rep) with zero fret buzz and consistent tone on every note.",
  coachingNotes: [
    "Press just behind the fret wire, not on top of it or too far back",
    "Maintain one-finger-per-fret position: finger 1 at fret 5, finger 2 at fret 6, finger 3 at fret 7, finger 4 at fret 8",
    "Keep earlier fingers down when possible; do not lift all fingers between notes",
    "Listen for buzz or muted notes rather than watching your hand",
    "Use consistent pressure across all four fingers; finger 3 and 4 often need extra attention",
    "If you hear buzz, check finger placement first, then pressure",
  ],
  primarySkillId: "fretting_accuracy",
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "Every note rings clearly with no fret buzz",
    "Consistent tone quality across all four fingers",
    "Fingers land just behind the fret wire on every note",
    "No hesitation or visible hunting for fret position",
    "Three consecutive clean reps at target BPM",
  ],
  commonMistakes: [
    "Pressing on top of the fret wire or too far back, causing buzz or muted notes",
    "Lifting all fingers between notes instead of maintaining one-finger-per-fret position",
    "Collapsing finger joints, reducing pressure and clarity",
    "Using inconsistent pressure across different fingers (often weak on finger 3 or 4)",
    "Watching the fretting hand instead of listening for buzz",
  ],
  progressionRule:
    "Progress to +5 BPM when the user logs three sessions at current BPM with Training Verdict 'Nailed It' and cleanliness rating 'no_buzz' across all reps.",
  regressionRule:
    "Regress to -10 BPM if the user logs Training Verdict 'Needs Work' and cleanliness rating 'frequent_buzz' for two consecutive sessions, or if actual clean BPM is more than 15 BPM below target for two sessions.",
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
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 2,
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
                finger: 3,
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
                finger: 4,
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 7,
                finger: 3,
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 6,
                finger: 2,
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 2,
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
                finger: 3,
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
                finger: 4,
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 7,
                finger: 3,
              },
            ],
            picking: "up",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 6,
                finger: 2,
              },
            ],
            picking: "down",
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "up",
          },
        ],
      },
    ],
    displayHints: {
      showPicking: true,
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
      id: "cleanliness",
      label: "Cleanliness",
      type: "segmented",
      required: true,
      options: [
        {
          id: "no_buzz",
          label: "No buzz",
        },
        {
          id: "occasional_buzz",
          label: "Occasional buzz",
        },
        {
          id: "frequent_buzz",
          label: "Frequent buzz",
        },
      ],
      followUpRules: [
        {
          ifOptionId: "occasional_buzz",
          showQuestionId: "finger_consistency",
        },
        {
          ifOptionId: "frequent_buzz",
          showQuestionId: "finger_consistency",
        },
      ],
    },
    {
      id: "finger_consistency",
      label: "Which fingers had issues?",
      type: "choice",
      required: false,
      options: [
        {
          id: "all_even",
          label: "All fingers even",
        },
        {
          id: "finger_3_weak",
          label: "Finger 3 weak",
        },
        {
          id: "finger_4_weak",
          label: "Finger 4 weak",
        },
        {
          id: "multiple_inconsistent",
          label: "Multiple fingers inconsistent",
        },
      ],
    },
  ],
  estimatedMinutes: 8,
  isMvp: true,
  version: 1,
  status: "active",
};

export const frettingAccuracyExercises: ExerciseSeed[] = [
  fourFretChromaticPlacement,
];
