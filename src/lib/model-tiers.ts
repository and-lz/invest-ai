/**
 * Model tier abstraction — maps user-facing tiers to concrete Gemini model IDs.
 *
 * Concrete models are configurable via env vars so you can swap models
 * without code changes:
 *   GEMINI_MODEL_ECONOMIC=models/gemini-2.5-flash
 *   GEMINI_MODEL_CAPABLE=models/gemini-2.5-pro
 */

const FALLBACK_ECONOMIC = "models/gemini-2.5-flash";
const FALLBACK_CAPABLE = "models/gemini-2.5-pro";

export type ModelTier = "economic" | "capable";

export const DEFAULT_MODEL_TIER: ModelTier = "economic";

export const MODEL_TIER_OPTIONS: ReadonlyArray<{
  value: ModelTier;
  label: string;
  description: string;
}> = [
  {
    value: "economic",
    label: "Econômico",
    description: "Mais rápido e menor custo. Ideal para tarefas do dia a dia.",
  },
  {
    value: "capable",
    label: "Mais capaz",
    description: "Maior qualidade de análise. Ideal para insights complexos.",
  },
];

/**
 * Resolves a model tier to its concrete Gemini model ID.
 * Reads from env vars first, falls back to built-in defaults.
 */
export function resolveModelId(tier: string | null | undefined): string {
  switch (tier) {
    case "capable":
      return process.env.GEMINI_MODEL_CAPABLE || FALLBACK_CAPABLE;
    case "economic":
    default:
      return process.env.GEMINI_MODEL_ECONOMIC || FALLBACK_ECONOMIC;
  }
}
