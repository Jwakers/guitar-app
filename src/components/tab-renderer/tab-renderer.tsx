"use client";

import { useEffect, useRef } from "react";
import type { TabData } from "@/lib/tabs/internal-schema";
import { tabDataToAlphaTex } from "@/lib/tabs/alphatab-adapter";
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

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let api: AlphaTabInstance | null = null;

    import("@coderline/alphatab")
      .then((alphaTab) => {
        if (!mounted || !containerRef.current) return;

        api = new alphaTab.AlphaTabApi(containerRef.current, {
          core: {
            // Load the worker script from CDN so no webpack plugin is needed.
            scriptFile:
              "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.8.4/dist/alphaTab.min.js",
            fontDirectory:
              "https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.8.4/dist/font/",
          },
          display: {
            // 3 = StaveProfile.Tab — tab-only, no standard notation stave.
            staveProfile: 3,
          },
        }) as AlphaTabInstance;

        api.tex(tabDataToAlphaTex(tabData));
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        console.error("TabRenderer: failed to initialise AlphaTab", err);
      });

    return () => {
      mounted = false;
      if (api) {
        api.destroy();
        api = null;
      }
    };
  }, [tabData]);

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
