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
      loopStartBar: 0,
      loopEndBar: 1,
    },
  },

  estimatedMinutes: 5,

  isMvp: true,
};

export const twoStringAlternatePickingTransitions: ExerciseSeed = {
  title: "Two-String Alternate Picking Transitions",
  slug: "two-string-alternate-picking-transitions",
  description:
    "A simple two-string pattern that isolates the skill of maintaining strict alternate picking while crossing between adjacent strings.",
  purpose:
    "Train clean alternate picking across a two-string pattern to develop controlled string changes while maintaining strict down-up picking consistency.",
  targetWeaknesses: [
    "Losing picking consistency when crossing strings",
    "Timing disruption on string changes",
    "Uneven attack or volume across adjacent strings",
  ],
  minimumCleanStandard:
    "At least 90% of notes ring clearly, strict alternate picking is maintained throughout, and no string crossing causes a noticeable timing disruption.",
  measurementInstructions:
    "Play the drill at the prescribed BPM for 30–60 seconds. The clean BPM is the highest tempo at which you can maintain all success criteria throughout the entire duration. Log the actual clean BPM you achieved.",
  coachingNotes: [
    "Focus on keeping your picking motion small and consistent—don't change your pick angle or attack when you cross strings",
    "The string change should feel like a natural continuation of the picking motion, not a separate action",
    "Listen for any 'hiccup' in timing when moving to string 4—that's your primary feedback",
    "If you tense up, slow down 10 BPM and focus on relaxation before building speed again",
    "Your fretting hand should move economically: minimal lift, land just before the pick strikes",
  ],
  primarySkillId: "alternate_picking",
  secondarySkillIds: [],
  difficultyLevel: 5,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 80,
  successCriteria: [
    "All notes ring clearly with no buzzing or muting",
    "Strict down-up alternate picking maintained throughout",
    "No timing disruption on string changes",
    "Even attack and volume across both strings",
    "Pattern loops smoothly without hesitation",
  ],
  commonMistakes: [
    "Switching to economy picking (two downstrokes or two upstrokes) when crossing strings",
    "Slowing down or rushing the third note (first note on string 4)",
    "Angling the pick too much during string crossing, causing volume inconsistency",
    "Tensing the picking hand shoulder or wrist during the string change",
    "Lifting fretting fingers too early, causing muted or short notes",
  ],
  progressionRule:
    "Progress to +5 BPM when the user logs Training Verdict = 'Nailed It' for 2 consecutive sessions at current BPM, with Cleanliness rating ≥ 4/5 in both sessions and confidence ≥ 0.75.",
  regressionRule:
    "Regress by −5 BPM when the user logs Training Verdict = 'Needs Work' for 2 consecutive sessions, OR Difficulty = 'Impossible' in any session. Return to the last BPM where Training Verdict was 'Nailed It' or 'Nearly There'.",
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
                string: 5,
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
                string: 5,
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
                string: 4,
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
                string: 4,
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
                string: 5,
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
                string: 5,
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
                string: 4,
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
                string: 4,
                fret: 7,
                finger: 3,
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
                string: 5,
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
                string: 5,
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
                string: 4,
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
                string: 4,
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
                string: 5,
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
                string: 5,
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
                string: 4,
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
                string: 4,
                fret: 7,
                finger: 3,
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
      followUpRules: [
        {
          ifOptionId: "needs_work",
          showQuestionId: "main_challenge",
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
      label: "How clean were the string crossings?",
      type: "rating",
      required: true,
    },
    {
      id: "main_challenge",
      label: "What was your main challenge?",
      type: "choice",
      required: false,
      options: [
        {
          id: "lost_alternate_picking",
          label: "Lost alternate picking pattern",
        },
        {
          id: "timing_wobble",
          label: "Timing wobble on string change",
        },
        {
          id: "uneven_volume",
          label: "Uneven volume between strings",
        },
        {
          id: "picking_tension",
          label: "Tension in picking hand",
        },
        {
          id: "sync_issue",
          label: "Fretting hand synchronisation",
        },
      ],
    },
  ],
  estimatedMinutes: 5,
  isMvp: true,
  version: 1,
  status: "active",
};

export const threeStringAlternatePickingPyramid: ExerciseSeed = {
  title: "Three-String Alternate Picking Pyramid",
  slug: "three-string-alternate-picking-pyramid",
  description:
    "A pyramid pattern across three adjacent strings that trains alternate picking consistency and control through ascending and descending phrases with continuous eighth-note motion.",
  purpose:
    "Build controlled alternate picking endurance and accuracy across three adjacent strings using a pyramid pattern that requires consistent pick direction through ascending and descending phrases.",
  targetWeaknesses: [
    "Losing pick direction when phrases reverse direction",
    "Inconsistent timing during three-string patterns",
    "Uneven volume or muted notes during multi-string alternate picking",
    "Tension and fatigue during extended alternate picking phrases",
  ],
  minimumCleanStandard:
    "Every note sounds clearly with no buzz, muting, or timing gaps. Strict down-up alternate picking with no corrections or double-strokes. The phrase sounds musical and even.",
  measurementInstructions:
    "Play the 4-bar pattern in a continuous loop. Your clean BPM is the highest tempo where you can complete at least 3 consecutive loops with no missed notes, no timing errors, no pick direction mistakes, and consistent tone.",
  coachingNotes: [
    "Start each practice session below your target BPM to warm up the picking motion",
    "Focus on keeping pick motion small and parallel to the strings",
    "Let the pick naturally alternate—don't think about direction on every note, just maintain the down-up pattern",
    "If you lose pick direction, slow down rather than trying to correct mid-phrase",
    "The pyramid peaks (fret 8) are common rushing points—keep the metronome priority",
    "Relax your grip slightly if you notice tension building in your forearm",
  ],
  primarySkillId: "alternate_picking",
  secondarySkillIds: [],
  difficultyLevel: 6,
  exerciseType: "primary",
  primaryProgressMetric: "clean_bpm",
  supportsBpm: true,
  defaultTargetBpm: 100,
  successCriteria: [
    "All notes sound with even volume and clear tone",
    "No accidental string noise or muting between string changes",
    "Strict alternate picking maintained throughout with no double-downstrokes",
    "Timing remains steady with no rushing or dragging",
    "Can complete 3 consecutive clean loops at the logged BPM",
  ],
  commonMistakes: [
    "Losing pick direction when reversing from ascending to descending patterns",
    "Accidental downstroke-downstroke at phrase turnarounds",
    "Rushing through the pyramid peaks at fret 8",
    "Muting adjacent strings during string changes",
    "Tensing the picking hand causing uneven volume",
    "Looking at the picking hand instead of the fretting hand",
  ],
  progressionRule:
    "Progress to +5 BPM when you log 3 consecutive sessions at current BPM with Training Verdict 'Nailed It' or 'Nearly There' and cleanliness rating 'perfectly_clean' or 'mostly_clean'. Do not progress if difficulty is 'impossible' even if BPM was achieved.",
  regressionRule:
    "Regress to -10 BPM if Training Verdict is 'Needs Work' for 2 consecutive sessions, or if difficulty is rated 'impossible' in any session. Also regress if cleanliness drops to 'lots_of_mistakes' even with a 'Nearly There' verdict.",
  tabData: {
    tuning: ["E", "A", "D", "G", "B", "E"],
    tempo: 100,
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
                string: 4,
                fret: 5,
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
                fret: 7,
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
                string: 4,
                fret: 8,
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
                fret: 7,
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
                string: 4,
                fret: 5,
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
                fret: 7,
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
                string: 4,
                fret: 8,
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
                fret: 7,
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
                string: 3,
                fret: 5,
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
                string: 3,
                fret: 7,
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
                string: 3,
                fret: 8,
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
                string: 3,
                fret: 7,
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
                string: 3,
                fret: 5,
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
                string: 3,
                fret: 7,
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
                string: 3,
                fret: 8,
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
                string: 3,
                fret: 7,
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
                string: 2,
                fret: 5,
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
                string: 2,
                fret: 7,
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
                fret: 8,
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
                string: 2,
                fret: 7,
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
                string: 2,
                fret: 7,
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
                fret: 8,
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
                string: 2,
                fret: 7,
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
                string: 3,
                fret: 5,
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
                string: 3,
                fret: 7,
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
                string: 3,
                fret: 8,
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
                string: 3,
                fret: 7,
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
                string: 3,
                fret: 5,
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
                string: 3,
                fret: 7,
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
                string: 3,
                fret: 8,
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
                string: 3,
                fret: 7,
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
      showFingering: false,
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
      followUpRules: [
        {
          ifOptionId: "needs_work",
          showQuestionId: "pick_direction_control",
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
          id: "perfectly_clean",
          label: "Perfectly Clean",
        },
        {
          id: "mostly_clean",
          label: "Mostly Clean",
        },
        {
          id: "some_mistakes",
          label: "Some Mistakes",
        },
        {
          id: "lots_of_mistakes",
          label: "Lots of Mistakes",
        },
      ],
    },
    {
      id: "pick_direction_control",
      label: "Did you maintain strict alternate picking throughout?",
      type: "segmented",
      required: false,
      options: [
        {
          id: "always",
          label: "Always",
        },
        {
          id: "mostly",
          label: "Mostly",
        },
        {
          id: "sometimes",
          label: "Sometimes",
        },
        {
          id: "rarely",
          label: "Rarely",
        },
      ],
    },
  ],
  estimatedMinutes: 8,
  isMvp: true,
  version: 1,
  status: "active",
};

export const alternatePickingExercises: ExerciseSeed[] = [
  singleStringAlternatePickingControl,
  twoStringAlternatePickingTransitions,
  threeStringAlternatePickingPyramid,
];
