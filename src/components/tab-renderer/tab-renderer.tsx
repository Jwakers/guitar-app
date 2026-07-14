"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TabData } from "@/lib/tabs/internal-schema";
import { tabDataToAlphaTex } from "@/lib/tabs/alphatab-adapter";
import { computePlaybackSpeed } from "@/lib/tabs/playback-speed";
import { createAlphaTabSettings } from "@/lib/tabs/render-config";
import { cn } from "@/lib/utils";

interface TabRendererProps {
  tabData: TabData;
  /** Desired playback tempo; defaults to `tabData.tempo`. */
  playbackBpm?: number;
  className?: string;
}

/** AlphaTab PlayerState.Playing */
const PLAYER_STATE_PLAYING = 1;

type PlayerStateChangedArgs = {
  state: number;
  stopped: boolean;
};

type PositionChangedArgs = {
  currentTime: number;
  endTime: number;
};

type EventEmitter = {
  on: (handler: () => void) => () => void;
};

type EventEmitterOfT<T> = {
  on: (handler: (arg: T) => void) => () => void;
};

// Loose type for the AlphaTabApi instance — avoids importing alphatab at the
// module level which would crash SSR.
type AlphaTabInstance = {
  tex: (content: string) => void;
  destroy: () => void;
  playPause: () => void;
  stop: () => void;
  playbackSpeed: number;
  playerReady: EventEmitter;
  playerStateChanged: EventEmitterOfT<PlayerStateChangedArgs>;
  playerPositionChanged: EventEmitterOfT<PositionChangedArgs>;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Renders a TabData structure using AlphaTab, with optional MIDI playback.
 *
 * Client-only — AlphaTab accesses the DOM directly, so it is imported
 * dynamically inside a useEffect and never runs during SSR.
 *
 * Worker, font, and soundfont assets are loaded from the jsDelivr CDN at the
 * pinned version matching the installed npm package.
 */
export function TabRenderer({
  tabData,
  playbackBpm,
  className,
}: TabRendererProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<AlphaTabInstance | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionLabel, setPositionLabel] = useState("00:00 / 00:00");

  const effectiveBpm = playbackBpm ?? tabData.tempo;

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let api: AlphaTabInstance | null = null;
    const unsubscribers: Array<() => void> = [];
    setLoadError(false);
    setPlayerReady(false);
    setIsPlaying(false);
    setPositionLabel("00:00 / 00:00");

    import("@coderline/alphatab")
      .then((alphaTab) => {
        if (!mounted || !containerRef.current) return;

        api = new alphaTab.AlphaTabApi(
          containerRef.current,
          createAlphaTabSettings({
            // Parent viewport scrolls; mount node stays unclipped for cursors.
            scrollElement: viewportRef.current,
          }),
        ) as AlphaTabInstance;

        apiRef.current = api;

        unsubscribers.push(
          api.playerReady.on(() => {
            if (!mounted) return;
            api!.playbackSpeed = computePlaybackSpeed(
              tabData.tempo,
              playbackBpm ?? tabData.tempo,
            );
            setPlayerReady(true);
          }),
        );

        unsubscribers.push(
          api.playerStateChanged.on((args) => {
            if (!mounted) return;
            setIsPlaying(args.state === PLAYER_STATE_PLAYING);
          }),
        );

        let lastSecond = -1;
        unsubscribers.push(
          api.playerPositionChanged.on((args) => {
            if (!mounted) return;
            const currentSeconds = Math.floor(args.currentTime / 1000);
            if (currentSeconds === lastSecond && args.currentTime > 0) {
              return;
            }
            lastSecond = currentSeconds;
            setPositionLabel(
              `${formatDuration(args.currentTime)} / ${formatDuration(args.endTime)}`,
            );
          }),
        );

        api.tex(tabDataToAlphaTex(tabData));
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        console.error("TabRenderer: failed to initialise AlphaTab", err);
        setLoadError(true);
      });

    return () => {
      mounted = false;
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      if (api) {
        try {
          api.stop();
        } catch {
          // Ignore stop failures during teardown.
        }
        api.destroy();
        api = null;
      }
      apiRef.current = null;
    };
    // Re-init when the score itself changes; BPM updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: avoid re-creating API on BPM tweaks
  }, [tabData]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api || !playerReady) return;
    api.playbackSpeed = computePlaybackSpeed(tabData.tempo, effectiveBpm);
  }, [effectiveBpm, tabData.tempo, playerReady]);

  const handlePlayPause = () => {
    // Optimistic UI — AudioContext wake can lag a beat behind the click.
    if (!isPlaying) {
      setIsPlaying(true);
    }
    apiRef.current?.playPause();
  };

  const handleStop = () => {
    apiRef.current?.stop();
    setIsPlaying(false);
    setPositionLabel((prev) => {
      const end = prev.split(" / ")[1] ?? "00:00";
      return `00:00 / ${end}`;
    });
  };

  if (loadError) {
    return (
      <div
        className={cn(
          "flex min-h-40 w-full items-center justify-center rounded border border-destructive/30 bg-destructive/5 px-4 py-6",
          className,
        )}
      >
        <p className="text-center font-mono text-sm text-destructive">
          Unable to load tab notation. Please refresh and try again.
        </p>
      </div>
    );
  }

  const statusLabel = !playerReady
    ? "Loading audio…"
    : isPlaying
      ? `Playing · ${positionLabel}`
      : positionLabel;

  return (
    <div className={cn("tab-renderer w-full", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          HEAR TAB
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!playerReady}
            onClick={handlePlayPause}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!playerReady}
            onClick={handleStop}
          >
            Stop
          </Button>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
          {Math.round(effectiveBpm)} BPM · {statusLabel}
        </p>
      </div>
      <div
        ref={viewportRef}
        className="w-full overflow-x-auto rounded bg-white"
      >
        <div ref={containerRef} className="relative min-h-40 w-full" />
      </div>
    </div>
  );
}
