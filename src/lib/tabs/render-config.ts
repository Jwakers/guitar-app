/**
 * AlphaTab display / asset settings shared by TabRenderer.
 *
 * Keep CDN pins aligned with the installed `@coderline/alphatab` version
 * in package.json.
 */

const ALPHATAB_CDN_VERSION = "1.8.4";

/** Numeric values from alphaTab.StaveProfile enum. */
export const StaveProfile = {
  ScoreTab: 1,
} as const;

/** Settings passed to `new AlphaTabApi(element, settings)`. */
export function createAlphaTabSettings(): {
  core: { scriptFile: string; fontDirectory: string };
  display: { staveProfile: number };
} {
  return {
    core: {
      scriptFile: `https://cdn.jsdelivr.net/npm/@coderline/alphatab@${ALPHATAB_CDN_VERSION}/dist/alphaTab.min.js`,
      fontDirectory: `https://cdn.jsdelivr.net/npm/@coderline/alphatab@${ALPHATAB_CDN_VERSION}/dist/font/`,
    },
    display: {
      staveProfile: StaveProfile.ScoreTab,
    },
  };
}
