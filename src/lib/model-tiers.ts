/**
 * Model tier abstraction — maps user-facing tiers to concrete model IDs.
 *
 * Gemini models are configurable via env vars so you can swap models
 * without code changes:
 *   GEMINI_MODEL_ECONOMIC=models/gemini-2.5-flash
 *   GEMINI_MODEL_CAPABLE=models/gemini-2.5-pro
 */

const FALLBACK_ECONOMIC = "models/gemini-2.5-flash";
const FALLBACK_CAPABLE = "models/gemini-2.5-pro";

// ---- Gemini tiers ----

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
 * Resolves a Gemini model tier to its concrete model ID.
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

// ---- Claude tiers ----

export type ClaudeModelTier = "haiku" | "sonnet" | "opus";

export const DEFAULT_CLAUDE_MODEL_TIER: ClaudeModelTier = "sonnet";

export const CLAUDE_MODEL_TIER_OPTIONS: ReadonlyArray<{
  value: ClaudeModelTier;
  label: string;
  description: string;
}> = [
  {
    value: "haiku",
    label: "Haiku",
    description: "Mais rápido. Ideal para tarefas simples e respostas curtas.",
  },
  {
    value: "sonnet",
    label: "Sonnet",
    description: "Equilíbrio entre velocidade e qualidade. Recomendado.",
  },
  {
    value: "opus",
    label: "Opus",
    description: "Maior qualidade. Ideal para análises complexas.",
  },
];

/**
 * Resolves a Claude model tier to its concrete Anthropic model ID.
 */
export function resolveClaudeModelId(tier: string | null | undefined): string {
  switch (tier) {
    case "haiku":
      return "claude-haiku-4-5";
    case "opus":
      return "claude-opus-4-6";
    case "sonnet":
    default:
      return "claude-sonnet-4-5";
  }
}

// ---- AI provider ----

export type AiProvider = "gemini" | "claude-proxy";

export const DEFAULT_AI_PROVIDER: AiProvider =
  (process.env.AI_PROVIDER as AiProvider | undefined) === "claude-proxy"
    ? "claude-proxy"
    : "gemini";

export const AI_PROVIDER_OPTIONS: ReadonlyArray<{
  value: AiProvider;
  label: string;
  description: string;
}> = [
  {
    value: "gemini",
    label: "Gemini",
    description: "Google Gemini via chave de API. Suporta streaming e busca na web.",
  },
  {
    value: "claude-proxy",
    label: "Claude (proxy local)",
    description: "Claude via proxy local. Requer claude CLI instalado e proxy rodando.",
  },
];
