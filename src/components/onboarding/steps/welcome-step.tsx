import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
          <Activity className="h-7 w-7 text-primary" />
        </div>
        <div className="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          System Online
        </div>
      </div>

      <div className="flex max-w-sm flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Let&apos;s build your training programme.
        </h1>
        <p className="text-base text-muted-foreground">
          Five quick questions. No fluff. We&apos;ll use your answers to build a
          personalised training block and daily sessions tailored to your
          weaknesses and goals.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button
          onClick={onNext}
          size="lg"
          className="w-full rounded-lg font-mono text-sm font-bold tracking-widest"
        >
          BEGIN SETUP
        </Button>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
          TAKES ABOUT 3 MINUTES
        </p>
      </div>
    </div>
  );
}
