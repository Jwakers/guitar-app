import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { WizardData } from "../onboarding-wizard";

interface AboutYouStepProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TONE_OPTIONS = [
  {
    value: "factual",
    label: "Factual",
    description: "Just the numbers. No commentary.",
  },
  {
    value: "encouraging",
    label: "Encouraging",
    description: "Keep me motivated and positive.",
  },
  {
    value: "coach",
    label: "Coach",
    description: "Direct and push me to improve.",
  },
] as const;

export function AboutYouStep({ data, onUpdate, onNext, onBack }: AboutYouStepProps) {
  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          About you
        </h2>
        <p className="text-sm text-muted-foreground">
          GTPL is built for intermediate electric guitarists. We&apos;ve pre-set
          those below.
        </p>
      </div>

      {/* Locked fields */}
      <div className="flex flex-col gap-3">
        <LockedField label="EXPERIENCE LEVEL" value="Intermediate" />
        <LockedField label="GUITAR TYPE" value="Electric" />
      </div>

      {/* Tone preference */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          HOW SHOULD THE APP TALK TO YOU?
        </label>
        <div className="flex flex-col gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ dataTonePreference: opt.value })}
              className={cn(
                "flex flex-col gap-0.5 rounded-lg border p-4 text-left transition-colors",
                data.dataTonePreference === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs font-bold tracking-widest",
                  data.dataTonePreference === opt.value
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                {opt.label.toUpperCase()}
              </span>
              <span className="text-sm text-muted-foreground">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={false} />
    </div>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
      <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "CONTINUE",
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-auto flex gap-3 pt-4">
      <Button
        variant="outline"
        onClick={onBack}
        className="flex-1 rounded-lg font-mono text-xs font-bold tracking-widest"
      >
        BACK
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-2 rounded-lg font-mono text-xs font-bold tracking-widest"
      >
        {nextLabel}
      </Button>
    </div>
  );
}

export { StepNav };
