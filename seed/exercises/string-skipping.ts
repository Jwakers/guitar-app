import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

export const everyOtherStringSkip: ExerciseSeed = {
  title: "Every Other String Skip",
  slug: "every-other-string-skip",
  description:
    "Train accurate pick jumps on a fixed every-other-string path (low E → D → B), clearing each skipped string without noise while keeping alternate picking and timing locked.",
  purpose:
    "Develop clean one-string skips on a repeating 6–4–2 ladder so the pick clears unused strings and lands with consistent attack and timing.",
  targetWeaknesses: [
    "Hitting or sounding the skipped string during the jump",
    "Overshooting or undershooting the target string after a skip",
    "Timing gaps during larger pick travel",
    "Inconsistent pick angle across non-adjacent landings",
    "Excessive arm motion instead of a controlled skip path",
  ],
  minimumCleanStandard:
    "All target notes ring clearly with no fret buzz, muted strikes, or timing errors. Skipped strings must stay silent. At least 90% of repetitions within the session must be clean at the logged BPM.",
  measurementInstructions:
    "Log the highest BPM at which you can loop both bars for at least 1 minute with clear notes, locked timing, consistent pick attack, and no noise from skipped strings. Only log repeatable clean performance, not one-off successes.",
  coachingNotes: [
    "Glide over the skipped string — clear it, do not strike it.",
    "Use the minimum pick path that still clears the middle string.",
    "Keep pick angle steady; aim the tip at the landing string.",
    "Mute lightly with unused fretting fingers so skipped strings cannot ring.",
    "If landings feel tense or noisy, slow down before chasing BPM.",
  ],
  primarySkillId: "string_skipping",
  secondarySkillIds: ["alternate_picking"],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "All target notes ring cleanly with no fret buzz or muted strikes",
    "Skipped strings stay silent on every jump",
    "Pick landings are accurate on the 6–4–2 path",
    "Timing stays locked to the metronome with no rushing or dragging",
    "Alternate picking direction stays consistent through the skips",
  ],
  commonMistakes: [
    "Sounding the skipped string instead of clearing it",
    "Using a full arm swing when a controlled wrist path would clear the string",
    "Changing pick angle mid-skip and missing the landing",
    "Leaving fretting-hand muting off so skipped strings ring sympathetically",
    "Rushing the note after each jump and losing the downbeat",
  ],
  progressionRule:
    "Progress to +5 BPM when the user logs 3 consecutive sessions at the current target BPM with Training Verdict 'Nailed It' or 'Nearly There', cleanliness rating 'clean' or 'mostly_clean', and difficulty rating 'easy' or 'good'.",
  regressionRule:
    "Regress by −5 BPM if the user logs 2 consecutive sessions with Training Verdict 'Needs Work', difficulty rating 'impossible', or cleanliness 'struggled'. If regression would go below 60 BPM, hold at 60 BPM and suggest reviewing basic alternate picking before retrying skips.",
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
      followUpRules: [
        {
          ifOptionId: "needs_work",
          showQuestionId: "issue",
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
          id: "hit_skipped_string",
          label: "Hit the skipped string",
        },
        {
          id: "missed_landing",
          label: "Missed the landing string",
        },
        {
          id: "timing",
          label: "Timing slipped on the jump",
        },
        {
          id: "pick_angle",
          label: "Pick angle inconsistent",
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
    },
  ],
  estimatedMinutes: 3,
  isMvp: true,
  version: 2,
  status: "active",
};

export const stringSkippingExercises: ExerciseSeed[] = [everyOtherStringSkip];
