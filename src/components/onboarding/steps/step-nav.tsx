import { Button } from "@/components/ui/button";

interface StepNavProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
}

export function StepNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "CONTINUE",
}: StepNavProps) {
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
