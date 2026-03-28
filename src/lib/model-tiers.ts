/**
 * Claude model tier abstraction — maps user-facing tiers to concrete model IDs.
 * AI features are dev-only, powered exclusively by the local Claude proxy.
 */

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
