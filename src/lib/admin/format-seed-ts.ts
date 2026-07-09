import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";

function toCamelCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part, i) => {
      const cleaned = part.replace(/[^a-zA-Z0-9]/g, "");
      if (!cleaned) return "";
      return i === 0
        ? cleaned
        : cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .join("");
}

/** Build a valid TS identifier from a kebab-case slug (already Zod-validated). */
function toExportName(slug: string): string {
  let name = toCamelCase(slug);
  if (!name) name = "exercise";
  // Identifiers cannot start with a digit.
  if (/^[0-9]/.test(name)) name = `exercise${name}`;
  return name;
}

export type FormatSeedTsOptions = {
  /**
   * When true, include the import and skill exercises array so the paste
   * can bootstrap a new seed file. When false, only the exercise const.
   */
  isFirstForSkill: boolean;
};

/**
 * Serializes a validated ExerciseSeed to a paste-ready TypeScript export.
 *
 * First drill for a skill → full file scaffold (import + const + array).
 * Later drills → just the exercise const to append into an existing file.
 */
export function formatSeedTs(
  exercise: ExerciseSeed,
  options: FormatSeedTsOptions,
): string {
  const exportName = toExportName(exercise.slug);
  const body = JSON.stringify(exercise, null, 2);
  const exerciseConst = `export const ${exportName}: ExerciseSeed = ${body};`;

  if (!options.isFirstForSkill) {
    return `${exerciseConst}\n`;
  }

  const arrayName = `${toCamelCase(exercise.primarySkillId)}Exercises`;

  // Relative import assumes paste into seed/exercises/*.ts (not src/).
  // If the paste target moves, update this path to match.
  return `import type { ExerciseSeed } from "../../src/lib/exercises/exercise-schema";

${exerciseConst}

export const ${arrayName}: ExerciseSeed[] = [
  ${exportName},
];
`;
}
