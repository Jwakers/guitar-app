"use client";

import { cn } from "@/lib/utils";
import type { WizardData } from "../onboarding-wizard";
import { StepNav } from "./step-nav";

interface ScheduleStepProps {
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SESSION_LENGTHS = [30, 45, 60, 90] as const;

const SESSIONS_PER_WEEK = [3, 4, 5, 6, 7] as const;

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
  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Your preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Practice is available every day. Set targets for session length and how
          often you aim to train each week.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          SESSIONS PER WEEK YOU AIM FOR
        </label>
        <div className="grid grid-cols-5 gap-2">
          {SESSIONS_PER_WEEK.map((count) => {
            const selected = data.sessionsPerWeek === count;
            return (
              <button
                type="button"
                key={count}
                onClick={() => onUpdate({ sessionsPerWeek: count })}
                className={cn(
                  "rounded-lg border py-3 font-mono text-sm font-bold transition-colors",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-border/60",
                )}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          DEFAULT SESSION LENGTH
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SESSION_LENGTHS.map((mins) => {
            const selected = data.defaultSessionLengthMinutes === mins;
            return (
              <button
                type="button"
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

      <div className="flex flex-col gap-3">
        <label className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          PREFERRED INTENSITY
        </label>
        <div className="flex flex-col gap-2">
          {INTENSITIES.map((opt) => {
            const selected = data.preferredIntensity === opt.value;
            return (
              <button
                type="button"
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

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
