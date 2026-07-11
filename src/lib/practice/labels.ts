export const SLOT_LABEL: Record<string, string> = {
  warmup: "Warm-up",
  primary: "Primary",
  secondary: "Secondary",
  accessory: "Accessory",
  isolation: "Isolation",
  test: "Benchmark",
  maintenance: "Maintenance",
};

export const SESSION_TYPE_LABEL: Record<string, string> = {
  standard: "Standard",
  light: "Light",
  test: "Benchmark",
  deload: "Deload",
  maintenance: "Maintenance",
};

export const TRAINING_VERDICT_LABEL: Record<string, string> = {
  nailed_it: "Nailed it",
  nearly_there: "Nearly there",
  needs_work: "Needs work",
};

export type TrainingVerdict = keyof typeof TRAINING_VERDICT_LABEL;

export const VERDICT_OPTIONS: TrainingVerdict[] = [
  "nailed_it",
  "nearly_there",
  "needs_work",
];
