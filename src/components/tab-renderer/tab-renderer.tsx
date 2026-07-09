"use client";

import { useEffect, useRef, useState } from "react";
import type { TabData } from "@/lib/tabs/internal-schema";
import { tabDataToAlphaTex } from "@/lib/tabs/alphatab-adapter";
import { createAlphaTabSettings } from "@/lib/tabs/render-config";
import { cn } from "@/lib/utils";

interface TabRendererProps {
  tabData: TabData;
  className?: string;
}

// Loose type for the AlphaTabApi instance — avoids importing alphatab at the
// module level which would crash SSR.
type AlphaTabInstance = {
  tex: (content: string) => void;
  destroy: () => void;
};

/**
 * Renders a TabData structure using AlphaTab.
 *
 * Client-only — AlphaTab accesses the DOM directly, so it is imported
 * dynamically inside a useEffect and never runs during SSR.
 *
 * Worker and font assets are loaded from the jsDelivr CDN at the pinned
 * version matching the installed npm package, which avoids any webpack/
 * Turbopack worker configuration.
 */
export function TabRenderer({ tabData, className }: TabRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let api: AlphaTabInstance | null = null;
    setLoadError(false);

    import("@coderline/alphatab")
      .then((alphaTab) => {
        if (!mounted || !containerRef.current) return;

        api = new alphaTab.AlphaTabApi(
          containerRef.current,
          createAlphaTabSettings(),
        ) as AlphaTabInstance;

        api.tex(tabDataToAlphaTex(tabData));
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        console.error("TabRenderer: failed to initialise AlphaTab", err);
        setLoadError(true);
      });

    return () => {
      mounted = false;
      if (api) {
        api.destroy();
        api = null;
      }
    };
  }, [tabData]);

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full min-h-40 overflow-x-auto rounded bg-white",
        className,
      )}
    />
  );
}
