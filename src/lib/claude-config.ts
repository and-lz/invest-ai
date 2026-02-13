/**
 * Configuração centralizada para a Claude API
 *
 * Pricing Claude Opus 4.6 (Standard API):
 * - Input: $5.00 / 1M tokens
 * - Output: $25.00 / 1M tokens
 */

/**
 * Modelo Claude usado para extração de dados de PDFs e geração de insights
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MODEL
 */
export const CLAUDE_MODEL = (process.env.CLAUDE_MODEL || "claude-opus-4-6") as string;

/**
 * Número máximo de tokens para extração de PDFs
 *
 * Padrão: 32768 (32k) - suficiente para relatórios com até 16 páginas e ~60 ativos
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MAX_TOKENS_EXTRACTION
 *
 * Custo estimado por relatório (cenário típico):
 * - Input: ~10k tokens (PDF + prompt) = $0,05
 * - Output: ~15k tokens (JSON) = $0,375
 * - Total: ~$0,425 (~R$ 2,46 na cotação R$ 5,80/USD)
 * - Máximo: ~32k output = ~$0,85 (~R$ 4,93) ✓ Dentro do budget de R$ 5,00
 */
export const CLAUDE_MAX_TOKENS_EXTRACTION = parseInt(
  process.env.CLAUDE_MAX_TOKENS_EXTRACTION || "32768",
  10,
);

/**
 * Número máximo de tokens para geração de insights
 *
 * Padrão: 16384 (16k) - permite análises detalhadas e comparações
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MAX_TOKENS_INSIGHTS
 *
 * Custo estimado por insights (cenário típico):
 * - Input: ~5k tokens (2 relatórios + prompt) = $0,025
 * - Output: ~8k tokens (análises) = $0,20
 * - Total: ~$0,225 (~R$ 1,30 na cotação R$ 5,80/USD)
 * - Máximo: ~16k output = ~$0,425 (~R$ 2,46) ✓ Dentro do budget de R$ 5,00
 */
export const CLAUDE_MAX_TOKENS_INSIGHTS = parseInt(
  process.env.CLAUDE_MAX_TOKENS_INSIGHTS || "16384",
  10,
);
