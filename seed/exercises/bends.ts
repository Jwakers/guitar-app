import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const halfStepBendAccuracy: ExerciseSeed = {
  title: "Half-Step Bend Accuracy",
  slug: "half-step-bend-accuracy",
  description:
    "Train controlled half-step (one-fret) bends to target pitch using the third finger on the B string, building precise pitch control and muscle memory for accurate bend intonation.",
  purpose:
    "Develop accurate pitch bending to a specific target by training the fretting hand to apply consistent pressure and release, ensuring bends land exactly on pitch rather than under or over the target note.",
  targetWeaknesses: [
    "Bends landing sharp or flat of the target pitch",
    "Inconsistent bend pressure across repetitions",
    "Difficulty hearing whether a bend reached the target",
    "Over-bending or under-bending half-step intervals",
  ],
  minimumCleanStandard:
    "At least 8 out of 10 bends land audibly on the target pitch (one fret higher than the starting note) with controlled attack and release, no fret buzz, and no overshoot.",
  measurementInstructions:
    "Play the pattern at the prescribed tempo. After each session, count how many bends out of the total repetitions landed cleanly on pitch. Log your accuracy percentage and Training Verdict. Use a tuner or reference pitch if needed to verify target accuracy during practice.",
  coachingNotes: [
    "Use your third finger to fret and bend, with your first and second fingers lightly touching the same string behind it for support and strength.",
    "Anchor your thumb on the back of the neck, roughly opposite your second finger, to provide leverage for the pushing motion.",
    "Push the string upward (toward the ceiling) smoothly and steadily—bend motion comes from rotating the wrist and forearm, not just finger strength.",
    "The target pitch is exactly one fret higher: if you start on fret 7, bend until it sounds like fret 8. Sing or hum the target pitch before bending to internalize it.",
    "Listen carefully during the bend. If it sounds too high (sharp), reduce pressure slightly. If it sounds too low (flat), push a bit further.",
    "Practice the release just as carefully—let the pitch drop smoothly back to the original note without causing fret buzz or string noise.",
    "If your finger slips, check that you're pressing firmly enough and that your fingertip is positioned just behind the fret, not on top of it.",
  ],
  primarySkillId: "bends",
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "accuracy_score",
  supportsBpm: true,
  defaultTargetBpm: 60,
  successCriteria: [
    "Bends consistently reach the target pitch (one half-step above the unbent note)",
    "Each bend has controlled attack with no pitch wobble or overshoot",
    "Release returns smoothly to the original pitch without fret noise",
    "Bend intonation is consistent across all repetitions in the set",
  ],
  commonMistakes: [
    "Pushing the string too far and overshooting the target pitch",
    "Not applying enough pressure and landing flat of the target",
    "Bending with only one finger instead of supporting with fingers behind",
    "Rushing the bend or release instead of moving smoothly",
    "Not anchoring the thumb behind the neck for leverage",
    "Fretting finger slipping sideways off the string during the bend",
  ],
  progressionRule:
    "Progress when you achieve 85% or higher bend accuracy over three consecutive logged sessions with Training Verdict of Nailed It or Nearly There. Progression: increase tempo by 5 BPM, or move to whole-step bends, or introduce pre-bend and release patterns.",
  regressionRule:
    "Regress if accuracy drops below 60% for two consecutive sessions, or if Training Verdict is Needs Work with difficulty marked Impossible. Regression: reduce tempo by 10 BPM, or reduce number of repetitions per set, or switch to a lighter gauge string temporarily to build initial control.",
  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 60,
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
                string: 2,
                fret: 7,
                finger: 3,
                targetPitch: "F#4",
              },
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
            accent: true,
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 2,
                fret: 7,
                finger: 3,
                targetPitch: "F#4",
              },
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
            accent: true,
          },
        ],
      },
      {
        beats: [
          {
            duration: "quarter",
            notes: [
              {
                string: 2,
                fret: 7,
                finger: 3,
                targetPitch: "F#4",
              },
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
            accent: true,
          },
          {
            duration: "quarter",
            notes: [
              {
                string: 2,
                fret: 7,
                finger: 3,
                targetPitch: "F#4",
              },
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
            accent: true,
          },
        ],
      },
    ],
    displayHints: {
      showPicking: false,
      showAccents: true,
      showFingering: false,
      loopStartBar: 0,
      loopEndBar: 1,
    },
  },
  feedbackSchema: [
    {
      id: "accuracy_percentage",
      label: "Bend Accuracy (% on pitch)",
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
      id: "primary_issue",
      label: "What was the main challenge?",
      type: "choice",
      required: false,
      options: [
        {
          id: "overshoot",
          label: "Bends went too far (sharp)",
        },
        {
          id: "undershoot",
          label: "Bends didn't reach pitch (flat)",
        },
        {
          id: "inconsistent",
          label: "Inconsistent from bend to bend",
        },
        {
          id: "finger_slip",
          label: "Finger slipping on string",
        },
        {
          id: "hearing",
          label: "Hard to hear if I'm on pitch",
        },
      ],
      followUpRules: [
        {
          ifOptionId: "needs_work",
          showQuestionId: "primary_issue",
        },
      ],
    },
  ],
  estimatedMinutes: 4,
  isMvp: true,
  version: 3,
  status: "active",
};

export const bendsExercises: ExerciseSeed[] = [halfStepBendAccuracy];
