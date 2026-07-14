/**
 * AlphaTab display / asset settings shared by TabRenderer.
 *
 * Keep CDN pins aligned with the installed `@coderline/alphatab` version
 * in package.json.
 */

const ALPHATAB_CDN_VERSION = "1.8.4";

const ALPHATAB_CDN_BASE = `https://cdn.jsdelivr.net/npm/@coderline/alphatab@${ALPHATAB_CDN_VERSION}/dist`;

/** Numeric values from alphaTab.StaveProfile enum. */
export const StaveProfile = {
  ScoreTab: 1,
} as const;

/** Settings passed to `new AlphaTabApi(element, settings)`. */
export function createAlphaTabSettings(options?: {
  scrollElement?: HTMLElement | null;
}): {
  core: { scriptFile: string; fontDirectory: string };
  display: { staveProfile: number };
  player: {
    enablePlayer: boolean;
    enableCursor: boolean;
    enableAnimatedBeatCursor: boolean;
    enableElementHighlighting: boolean;
    enableUserInteraction: boolean;
    soundFont: string;
    scrollElement?: HTMLElement;
  };
} {
  return {
    core: {
      scriptFile: `${ALPHATAB_CDN_BASE}/alphaTab.min.js`,
      fontDirectory: `${ALPHATAB_CDN_BASE}/font/`,
    },
    display: {
      staveProfile: StaveProfile.ScoreTab,
    },
    player: {
      enablePlayer: true,
      enableCursor: true,
      enableAnimatedBeatCursor: true,
      enableElementHighlighting: true,
      enableUserInteraction: true,
      soundFont: `${ALPHATAB_CDN_BASE}/soundfont/sonivox.sf2`,
      ...(options?.scrollElement
        ? { scrollElement: options.scrollElement }
        : {}),
    },
  };
}
