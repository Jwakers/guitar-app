import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const hammerOnReleaseTiming: ExerciseSeed = {
  title: "Hammer-On Release Timing",
  slug: "hammer-on-release-timing",
  description:
    "Train exact synchronisation between picking hand attack and fretting hand hammer-on landing on a single string, ensuring both hands land and release at precisely the same moment with no lag or early arrival.",
  purpose:
    "Isolate and train exact synchronisation between the fretting hand's hammer-on landing and the picking hand's attack, ensuring both hands land and release notes at exactly the same time with no lag or early hammer.",
  targetWeaknesses: [
    "Early hammer-ons that sound before the pick strikes",
    "Delayed hammer-ons that create uneven note spacing",
    "Inconsistent timing between pick attack and fretting hand articulation",
    "Rhythmic drift caused by poor hand coordination",
  ],
  minimumCleanStandard:
    "Four consecutive bars at any tempo with all hammer-ons landing precisely on time, even eighth-note spacing throughout, and no audible lag or rush between pick and hammer.",
  measurementInstructions:
    "Log the highest BPM at which you can play four consecutive bars cleanly with every hammer-on landing exactly on time and producing even eighth-note spacing. The hammered notes must sound as rhythmically consistent as the picked notes. If more than one hammer-on is early, late, or unclear, the run does not count as clean.",
  coachingNotes: [
    "Focus on listening to the metronome on beats 1 and 3 to lock in the reference pulse.",
    "The hammer-on should feel like it arrives exactly when you hear the picked note, not before or after.",
    "If hammer-ons sound early, slow down and focus on delaying the hammer until the pick makes contact.",
    "If hammer-ons sound late, work on pre-positioning the hammer finger closer to the string so it can land immediately after the pick.",
    "Use consistent hammer-on pressure—too light and the note won't speak; too hard and you'll overshoot the timing.",
    "Record yourself or use a metronome with a strong click to check whether the hammered notes align with the subdivisions.",
  ],
  primarySkillId: "synchronisation",
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "All hammer-ons land exactly on time with no early or late arrivals",
    "Picked and hammered notes form an even, continuous eighth-note rhythm",
    "No audible lag between pick attack and hammer landing",
    "Clean execution for four consecutive bars at target BPM",
  ],
  commonMistakes: [
    "Hammer-on finger lifting too early and landing before the pick strikes",
    "Hesitating after the pick, causing a late hammer and uneven rhythm",
    "Inconsistent hammer-on pressure, making some hammers louder or softer and masking timing issues",
    "Picking too hard or too soft, making it difficult to hear whether the hammer arrived on time",
    "Not listening to the metronome on beats 1 and 3, losing the reference and drifting tempo",
  ],
  progressionRule:
    "Increase BPM by 5 when the user logs clean_bpm >= target BPM, Training Verdict 'Nailed It' or 'Nearly There', and Timing rating 'locked_in' for two consecutive sessions.",
  regressionRule:
    "Decrease BPM by 10 when the user logs Training Verdict 'Needs Work' or Timing rating 'drifting' or 'lost' for two consecutive sessions, or when clean BPM falls more than 15 BPM below target for one session.",
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                fret: 7,
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
          {
            duration: "eighth",
            notes: [
              {
                string: 3,
                fret: 5,
                finger: 1,
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
                finger: 3,
                technique: "hammer_on",
              },
            ],
          },
        ],
      },
    ],
    displayHints: {
      showPicking: true,
      showAccents: false,
      showFingering: true,
      loopStartBar: 0,
      loopEndBar: 3,
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
      id: "timing",
      label: "How did the hammer-ons land?",
      type: "segmented",
      required: true,
      options: [
        {
          id: "locked_in",
          label: "Locked In",
        },
        {
          id: "close",
          label: "Close",
        },
        {
          id: "drifting",
          label: "Drifting",
        },
        {
          id: "lost",
          label: "Lost",
        },
      ],
      followUpRules: [
        {
          ifOptionId: "drifting",
          showQuestionId: "clarity",
        },
        {
          ifOptionId: "lost",
          showQuestionId: "clarity",
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
      id: "clarity",
      label: "Were the hammer-ons clear and consistent in volume?",
      type: "boolean",
      required: false,
    },
  ],
  estimatedMinutes: 8,
  isMvp: true,
  version: 1,
  status: "active",
};

export const synchronisationExercises: ExerciseSeed[] = [hammerOnReleaseTiming];
