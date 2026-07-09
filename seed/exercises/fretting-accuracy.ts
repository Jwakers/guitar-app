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

export const crossStringFrettingPrecision: ExerciseSeed = {
  title: "Cross-String Fretting Precision",
  slug: "cross-string-fretting-precision",
  description:
    "Train accurate, buzz-free fretting across four adjacent strings using a simple ascending pattern that isolates finger placement and pressure consistency while navigating string changes.",
  purpose:
    "Develop accurate, buzz-free fretting across multiple strings by pressing cleanly behind the fret with efficient finger placement, training the fretting hand to maintain consistent pressure and placement while navigating string changes.",
  targetWeaknesses: [
    "Inconsistent finger pressure across different strings",
    "Buzzing when moving between strings",
    "Poor finger placement (too far from fret or on top of fret wire)",
    "Fingers not landing directly behind the fret",
  ],
  minimumCleanStandard:
    "At the target BPM, all four notes must ring clearly with consistent tone, no buzz, no choking, and no muted partials. You must achieve this for at least 8 complete 4-note cycles without a break in cleanliness.",
  measurementInstructions:
    "Play the two-bar pattern on loop for at least 30 seconds at your current target BPM. Log the highest tempo at which you can maintain clean, buzz-free fretting for at least 8 consecutive note cycles (all 4 notes × 8 = 32 clean notes minimum). If any note in a cycle buzzes or chokes, that cycle does not count toward the 8-cycle minimum.",
  coachingNotes: [
    "Press each note directly behind the fret wire, not on top of it and not too far back",
    "Use just enough pressure for a clean sound—too much causes fatigue, too little causes buzz",
    "Keep fingers arched and use fingertips perpendicular to the fretboard, not flat pads",
    "Keep fingers close to the fretboard between notes; don't lift unnecessarily high",
    "Listen for consistent tone quality across all four strings—each should sound equally clear",
    "If one string consistently buzzes, check finger angle and pressure on that specific string",
  ],
  primarySkillId: "fretting_accuracy",
  secondarySkillIds: [],
  difficultyLevel: 6,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "All four notes ring clearly with no buzz or rattle",
    "Consistent tone quality across all four strings",
    "Fingers land directly behind fret wire (not on top, not too far back)",
    "No muted or choked notes",
    "Even volume across all four notes",
    "Can maintain clean execution for 8+ consecutive repetitions (4+ loops of the 2-bar pattern)",
    "Can increase tempo by 5–10 BPM while maintaining cleanliness",
  ],
  commonMistakes: [
    "Pressing on top of the fret wire instead of behind it, causing muted or thin tone",
    "Using too much pressure, causing fatigue and tension",
    "Using too little pressure, causing buzz",
    "Flattening fingers and using pads instead of fingertips",
    "Fingers landing at an angle instead of perpendicular to fretboard",
    "Not keeping fingers close to fretboard between notes",
    "Lifting fingers too high before or after notes",
    "Inconsistent finger arch across different strings",
  ],
  progressionRule:
    "Progress to +5 BPM when Training Verdict is 'Nailed It' for two consecutive sessions at current BPM, AND Cleanliness rating is 'Very clean' or 'Perfect', AND User reports confidence as 'Easy' or 'Good'.",
  regressionRule:
    "Regress by –5 BPM when Training Verdict is 'Needs Work' for two consecutive sessions, OR User reports difficulty as 'Impossible', OR Cleanliness rating is 'Some buzz' or worse for two sessions in a row. Never regress below 50 BPM; if player cannot achieve clean standard at 50 BPM, recommend pausing this drill and working on 'Four-Fret Chromatic Placement' until fundamental fretting accuracy improves.",
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
            duration: "quarter",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 5,
                fret: 6,
                finger: 2,
              },
            ],
            picking: "down",
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 4,
                fret: 7,
                finger: 3,
              },
            ],
            picking: "down",
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 3,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
        ],
      },
      {
        beats: [
          {
            duration: "quarter",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
              },
            ],
            picking: "down",
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 5,
                fret: 6,
                finger: 2,
              },
            ],
            picking: "down",
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 4,
                fret: 7,
                finger: 3,
              },
            ],
            picking: "down",
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 3,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
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
      followUpRules: [
        {
          ifOptionId: "nearly_there",
          showQuestionId: "hardest_string",
        },
        {
          ifOptionId: "needs_work",
          showQuestionId: "hardest_string",
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
          id: "perfect",
          label: "Perfect",
        },
        {
          id: "very_clean",
          label: "Very clean",
        },
        {
          id: "slight_buzz",
          label: "Slight buzz",
        },
        {
          id: "some_buzz",
          label: "Some buzz",
        },
        {
          id: "significant_buzz",
          label: "Significant buzz",
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
      id: "hardest_string",
      label: "Which string was hardest to fret cleanly?",
      type: "choice",
      required: false,
      options: [
        {
          id: "string_6",
          label: "Low E (6th)",
        },
        {
          id: "string_5",
          label: "A (5th)",
        },
        {
          id: "string_4",
          label: "D (4th)",
        },
        {
          id: "string_3",
          label: "G (3rd)",
        },
      ],
    },
  ],
  estimatedMinutes: 3,
  isMvp: true,
  version: 1,
  status: "active",
};

export const frettingAccuracyExercises: ExerciseSeed[] = [
  fourFretChromaticPlacement,
  crossStringFrettingPrecision,
];
