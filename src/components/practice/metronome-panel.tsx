"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMetronome } from "@/lib/metronome/use-metronome";

type MetronomePanelProps = {
  initialBpm: number;
  targetBpm?: number;
  beatsPerBar?: number;
  onBpmChange?: (bpm: number) => void;
  docked?: boolean;
};

export function MetronomePanel({
  initialBpm,
  targetBpm,
  beatsPerBar = 4,
  onBpmChange,
  docked = false,
}: MetronomePanelProps) {
  const [state, actions] = useMetronome({
    initialBpm,
    onBpmChange,
  });

  useEffect(() => {
    actions.setTimeSignature({ beats: beatsPerBar, subdivision: 4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatsPerBar]);

  const step = (delta: number) => {
    actions.setBpm(state.bpm + delta);
  };

  return (
    <div
      className={
        docked
          ? "bg-transparent p-0"
          : "rounded-lg border border-border bg-card p-4"
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
            METRONOME
          </p>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-foreground">
            {state.bpm}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              BPM
            </span>
          </p>
          {targetBpm !== undefined && (
            <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              TARGET {targetBpm} BPM
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: beatsPerBar }).map((_, i) => (
            <span
              key={i}
              className={`size-2 rounded-full ${
                state.isPlaying && state.currentBeat === i
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => step(-5)}>
          -5
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => step(-1)}>
          -1
        </Button>
        <Button
          type="button"
          className="min-w-20"
          size="sm"
          onClick={() => actions.toggle()}
        >
          {state.isPlaying ? "Stop" : "Play"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => step(1)}>
          +1
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => step(5)}>
          +5
        </Button>
      </div>
    </div>
  );
}
