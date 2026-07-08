import { cn } from "@/lib/utils";
import type { WizardData } from "../onboarding-wizard";
import { StepNav } from "./about-you-step";

interface ScheduleStepProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DAY_SHORT: Record<string, string> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

const SESSION_LENGTHS = [30, 45, 60, 90] as const;

const INTENSITIES = [
  {
    value: "light",
    label: "Light",
    description: "Shorter sessions, more focus on consistency.",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Balanced workload across skill areas.",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Dense sessions, maximum technique density.",
  },
] as const;

export function ScheduleStep({ data, onUpdate, onNext, onBack }: ScheduleStepProps) {
  function toggleDay(day: string) {
    const current = data.availableDays;
    if (current.includes(day)) {
      if (current.length <= 1) return; // keep at least one
      onUpdate({ availableDays: current.filter((d) => d !== day) });
    } else {
      onUpdate({ availableDays: [...current, day] });
    }
  }

  const canProceed = data.availableDays.length >= 1;

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Your schedule
        </h2>
        <p className="text-sm text-muted-foreground">
          When are you able to practise? We&apos;ll plan around your
          availability.
        </p>
      </div>

      {/* Available days */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          AVAILABLE DAYS ({data.availableDays.length} selected)
        </label>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((day) => {
            const selected = data.availableDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border font-mono text-[9px] font-bold tracking-widest transition-colors",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-border/60 hover:bg-muted/50",
                )}
              >
                {DAY_SHORT[day]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session length */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          DEFAULT SESSION LENGTH
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SESSION_LENGTHS.map((mins) => {
            const selected = data.defaultSessionLengthMinutes === mins;
            return (
              <button
                key={mins}
                onClick={() => onUpdate({ defaultSessionLengthMinutes: mins })}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border py-3 transition-colors",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-border/60 hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-lg font-bold",
                    selected ? "text-primary" : "text-foreground",
                  )}
                >
                  {mins}
                </span>
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground">
                  MIN
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          PREFERRED INTENSITY
        </label>
        <div className="flex flex-col gap-2">
          {INTENSITIES.map((opt) => {
            const selected = data.preferredIntensity === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onUpdate({ preferredIntensity: opt.value })}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg border p-4 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-border/60 hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs font-bold tracking-widest",
                    selected ? "text-primary" : "text-foreground",
                  )}
                >
                  {opt.label.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!canProceed} />
    </div>
  );
}
