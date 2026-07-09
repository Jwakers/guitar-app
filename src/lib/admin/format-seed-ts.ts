import type { ExerciseSeed } from "@/lib/exercises/exercise-schema";

function toExportName(slug: string): string {
  return slug
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

/**
 * Serializes a validated ExerciseSeed to a paste-ready TypeScript export.
 */
export function formatSeedTs(exercise: ExerciseSeed): string {
  const exportName = toExportName(exercise.slug);
  const body = JSON.stringify(exercise, null, 2);

  return `export const ${exportName}: ExerciseSeed = ${body};
`;
}
