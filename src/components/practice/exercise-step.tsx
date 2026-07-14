"use client";

import { ExerciseDetailSections } from "@/components/exercises/exercise-detail-sections";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";
import { resolveInitialBpm } from "@/lib/metronome/defaults";
import { SLOT_LABEL, TRAINING_VERDICT_LABEL } from "@/lib/practice/labels";
import type { PlayerMode } from "@/lib/practice/player-mode";
import { coreSkillLabel, subSkillLabel } from "@/lib/skills/taxonomy";
import { MetronomePanel } from "./metronome-panel";

type SessionItem = {
  slotType: string;
  targetBpm?: number;
  targetValue?: number;
  targetMetric: string;
  durationMinutes: number;
  status: string;
};

type LoggedResult = {
  trainingVerdict: string;
  objectiveResult: {
    actualValue?: number;
    unit?: string;
  };
};

type ExerciseStepProps = {
  exercise: Doc<"exercises">;
  sessionItem: SessionItem;
  isReviewingPast: boolean;
  canGoBack: boolean;
  playerMode: PlayerMode;
  loggedResult?: LoggedResult;
  metronomeKey: string;
  currentBpm: number;
  onBpmChange: (bpm: number) => void;
  onBack: () => void;
  onReturnToCurrent: () => void;
  onComplete: () => void;
};

export function ExerciseStep({
  exercise,
  sessionItem,
  isReviewingPast,
  canGoBack,
  playerMode,
  loggedResult,
  metronomeKey,
  currentBpm,
  onBpmChange,
  onBack,
  onReturnToCurrent,
  onComplete,
}: ExerciseStepProps) {
  const initialBpm = resolveInitialBpm(sessionItem, exercise);
  const completeLabel =
    playerMode === "replay" ? "Next exercise" : "Complete exercise";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pt-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">
              {SLOT_LABEL[sessionItem.slotType]?.toUpperCase() ??
                sessionItem.slotType.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
              {sessionItem.durationMinutes} MIN
            </span>
            {sessionItem.targetBpm !== undefined && (
              <span className="font-mono text-[10px] font-bold tracking-widest text-foreground">
                TARGET {sessionItem.targetBpm} BPM
              </span>
            )}
          </div>

          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">
            {exercise.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {exercise.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded border border-border px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              {coreSkillLabel(exercise.coreSkillId).toUpperCase()}
            </span>
            {exercise.subSkillIds.map((id) => (
              <span
                key={id}
                className="rounded border border-border px-2 py-1 font-mono text-[10px] tracking-widest text-muted-foreground"
              >
                {subSkillLabel(id).toUpperCase()}
              </span>
            ))}
          </div>

          {loggedResult && playerMode === "replay" && (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                LOGGED RESULT
              </p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {loggedResult.objectiveResult.actualValue !== undefined && (
                  <>
                    {loggedResult.objectiveResult.actualValue}{" "}
                    {loggedResult.objectiveResult.unit ?? "BPM"} ·{" "}
                  </>
                )}
                {TRAINING_VERDICT_LABEL[loggedResult.trainingVerdict] ??
                  loggedResult.trainingVerdict}
              </p>
            </div>
          )}

          {sessionItem.targetBpm !== undefined && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                TODAY&apos;S TARGET
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">
                {sessionItem.targetBpm} BPM
              </p>
            </div>
          )}

          {isReviewingPast && (
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Reviewing a completed exercise
            </p>
          )}
        </div>

        <ExerciseDetailSections
          tabData={exercise.tabData}
          purpose={exercise.purpose}
          minimumCleanStandard={exercise.minimumCleanStandard}
          measurementInstructions={exercise.measurementInstructions}
          coachingNotes={exercise.coachingNotes}
          successCriteria={exercise.successCriteria}
          showSuccessCriteria
          playbackBpm={currentBpm}
        />
      </div>

      <div className="sticky bottom-16 z-40 shrink-0 border-t border-border bg-background/95 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.45)] backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <MetronomePanel
            key={metronomeKey}
            docked
            initialBpm={initialBpm}
            targetBpm={sessionItem.targetBpm}
            beatsPerBar={exercise.tabData.timeSignature.beats}
            onBpmChange={onBpmChange}
          />
        </div>

        <div className="mx-auto flex w-full max-w-2xl gap-3 px-4 pb-3 pt-1">
          {canGoBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          {(playerMode === "replay" || !isReviewingPast) && (
            <Button type="button" className="flex-1" onClick={onComplete}>
              {completeLabel}
            </Button>
          )}
          {isReviewingPast && playerMode === "live" && (
            <Button
              type="button"
              className="flex-1"
              variant="secondary"
              onClick={onReturnToCurrent}
            >
              Return to current exercise
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
