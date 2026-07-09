import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const fourFingerLegatoFlow: ExerciseSeed = {
  title: "Four-Finger Legato Flow",
  slug: "four-finger-legato-flow",
  description:
    "Build smooth, even legato across all four fretting fingers using hammer-ons and pull-offs on a single string, focusing on consistent volume and clarity.",
  purpose:
    "Develop consistent hammer-on and pull-off technique across all four fretting fingers, training even volume and clarity without pick attacks after the initial note.",
  targetWeaknesses: [
    "Weak hammer-on force producing inconsistent note volume",
    "Pull-offs that lack clarity or snap",
    "Uneven finger strength causing volume imbalance across fingers",
    "Over-reliance on the pick for every note",
  ],
  minimumCleanStandard:
    "All legato notes must sound clearly and at roughly equal volume. No picked notes beyond the first note of each phrase. No fret buzz, dead notes, or rhythmic gaps. At least three consecutive clean cycles.",
  measurementInstructions:
    "Set a metronome to the target BPM (16th notes). Play through both bars cleanly three times in a row. Log the highest BPM at which you maintained clear, even volume and no missed or muted notes across all three cycles. If you cannot complete three clean cycles, reduce BPM by 5–10 and retry.",
  coachingNotes: [
    "Pick only the first note of each group of four with a downstroke",
    "Hammer-on the remaining three notes in bar 1, pressing firmly just behind the fret",
    "Pull-off the four notes in bar 2, snapping each finger slightly across the string to sound the lower note",
    "Keep all four fretting fingers hovering close to the string",
    "Listen for volume consistency—no note should be significantly louder or quieter than the others",
    "Maintain one-finger-per-fret positioning (no stretching or collapsing)",
  ],
  primarySkillId: "legato",
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 70,
  successCriteria: [
    "All 16 notes in each bar sound clearly at consistent volume",
    "No muted, weak, or overly loud notes",
    "Smooth transitions with no rhythmic hiccups",
    "Clean tone with no fret buzz or string noise",
    "Ability to maintain quality for 3+ clean cycles at target BPM",
  ],
  commonMistakes: [
    "Hammering too softly with the weaker fingers (ring, pinky), causing volume drop",
    "Pulling off vertically instead of slightly across the string, losing clarity",
    "Lifting fretting fingers too far from the string between notes",
    "Picking more than the first note of each group",
    "Collapsing or over-stretching the one-finger-per-fret frame",
  ],
  progressionRule:
    "Progress when: training_verdict is 'nailed_it' for two consecutive sessions at the current BPM, cleanliness rating is 'very_clean' or 'perfect,' and difficulty is 'easy' or 'good.' Increase BPM by 5.",
  regressionRule:
    "Regress when: training_verdict is 'needs_work' for two consecutive sessions, or cleanliness is 'struggled' or 'messy,' or difficulty is 'impossible.' Decrease BPM by 10.",
  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 70,
    timeSignature: {
      beats: 4,
      beatValue: 4,
    },
    bars: [
      {
        beats: [
          {
            duration: "sixteenth",
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
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
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
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
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
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
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
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
                technique: "hammer_on",
              },
            ],
          },
        ],
      },
      {
        beats: [
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 8,
                finger: 4,
              },
            ],
            picking: "down",
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 7,
                finger: 3,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 6,
                finger: 2,
                technique: "pull_off",
              },
            ],
          },
          {
            duration: "sixteenth",
            notes: [
              {
                string: 6,
                fret: 5,
                finger: 1,
                technique: "pull_off",
              },
            ],
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
          id: "perfect",
          label: "Perfect",
        },
        {
          id: "very_clean",
          label: "Very Clean",
        },
        {
          id: "acceptable",
          label: "Acceptable",
        },
        {
          id: "struggled",
          label: "Struggled",
        },
        {
          id: "messy",
          label: "Messy",
        },
      ],
      followUpRules: [
        {
          ifOptionId: "struggled",
          showQuestionId: "volume_consistency",
        },
        {
          ifOptionId: "messy",
          showQuestionId: "volume_consistency",
        },
      ],
    },
    {
      id: "volume_consistency",
      label: "Which fingers sounded weakest?",
      type: "choice",
      required: false,
      options: [
        {
          id: "pinky",
          label: "Pinky (4th)",
        },
        {
          id: "ring",
          label: "Ring (3rd)",
        },
        {
          id: "middle",
          label: "Middle (2nd)",
        },
        {
          id: "multiple",
          label: "Multiple fingers",
        },
        {
          id: "none",
          label: "All were even",
        },
      ],
    },
  ],
  estimatedMinutes: 4,
  isMvp: true,
  version: 1,
  status: "active",
};

export const legatoExercises: ExerciseSeed[] = [fourFingerLegatoFlow];
