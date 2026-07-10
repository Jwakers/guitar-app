import type { GatewayModelId } from "ai";

/**
 * Default model for the drill generator.
 * Change this constant to switch models — `GatewayModelId` gives autocomplete.
 */
export const DEFAULT_DRILL_GENERATOR_MODEL =
  "anthropic/claude-opus-4.8" satisfies GatewayModelId;

export type DrillGeneratorModel = GatewayModelId;

/** Curated options shown in the admin UI model picker. */
export const DRILL_GENERATOR_MODEL_OPTIONS = [
  {
    id: "anthropic/claude-sonnet-4.5" satisfies GatewayModelId,
    label: "Claude Sonnet 4.5",
  },
  {
    id: "anthropic/claude-sonnet-4.6" satisfies GatewayModelId,
    label: "Claude Sonnet 4.6",
  },
  {
    id: "anthropic/claude-sonnet-5" satisfies GatewayModelId,
    label: "Claude Sonnet 5",
  },
  {
    id: "anthropic/claude-opus-4.5" satisfies GatewayModelId,
    label: "Claude Opus 4.5",
  },
  {
    id: "anthropic/claude-opus-4.6" satisfies GatewayModelId,
    label: "Claude Opus 4.6",
  },
  {
    id: "anthropic/claude-opus-4.8" satisfies GatewayModelId,
    label: "Claude Opus 4.8",
  },
  {
    id: "anthropic/claude-haiku-4.5" satisfies GatewayModelId,
    label: "Claude Haiku 4.5",
  },
  {
    id: "openai/gpt-4.1" satisfies GatewayModelId,
    label: "GPT-4.1",
  },
  {
    id: "openai/gpt-4.1-mini" satisfies GatewayModelId,
    label: "GPT-4.1 Mini",
  },
  {
    id: "google/gemini-2.5-pro" satisfies GatewayModelId,
    label: "Gemini 2.5 Pro",
  },
] as const;

export type DrillGeneratorModelOptionId =
  (typeof DRILL_GENERATOR_MODEL_OPTIONS)[number]["id"];
