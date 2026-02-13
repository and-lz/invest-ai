/**
 * Configuração centralizada para a Claude API
 *
 * Pricing (Standard API):
 * - Claude Sonnet 4.6 (extração PDF):
 *   - Input: $3.00 / 1M tokens
 *   - Output: $15.00 / 1M tokens
 *
 * - Claude Opus 4.6 (insights):
 *   - Input: $5.00 / 1M tokens
 *   - Output: $25.00 / 1M tokens
 *
 * - Claude Sonnet 4.6 (fallback):
 *   - Input: $3.00 / 1M tokens
 *   - Output: $15.00 / 1M tokens
 */

/**
 * Modelo Claude para extração de dados de PDFs
 * Padrão: Sonnet 4.6 (capaz para JSON estruturado complexo, rate limits maiores que Opus)
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MODEL_EXTRACTION
 */
export const CLAUDE_MODEL_EXTRACTION = (process.env.CLAUDE_MODEL_EXTRACTION || "claude-sonnet-4-20250514") as string;

/**
 * Modelo Claude para geração de insights
 * Padrão: Opus 4.6 (raciocínio complexo, análises profundas)
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MODEL_INSIGHTS
 */
export const CLAUDE_MODEL_INSIGHTS = (process.env.CLAUDE_MODEL_INSIGHTS || "claude-opus-4-6") as string;

/**
 * Modelo Claude para fallback
 * Padrão: Sonnet 4 (meio termo entre velocidade e capacidade)
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MODEL_FALLBACK
 */
export const CLAUDE_MODEL_FALLBACK = (process.env.CLAUDE_MODEL_FALLBACK || "claude-sonnet-4-20250514") as string;

/**
 * @deprecated Usar CLAUDE_MODEL_EXTRACTION ou CLAUDE_MODEL_INSIGHTS em vez disso
 */
export const CLAUDE_MODEL = (process.env.CLAUDE_MODEL || CLAUDE_MODEL_EXTRACTION) as string;

/**
 * Número máximo de tokens para extração de PDFs
 *
 * Padrão: 32768 (32k) - suficiente para relatórios com até 16 páginas e ~60 ativos
 * Pode ser sobrescrito pela variável de ambiente CLAUDE_MAX_TOKENS_EXTRACTION
 *
 * Custo estimado por relatório (cenário típico com Sonnet 4.6):
 * - Input: ~10k tokens (PDF + prompt) = $0,03
 * - Output: ~15k tokens (JSON) = $0,225
 * - Total: ~$0,255 (~R$ 1,48 na cotação R$ 5,80/USD)
 * - Máximo: ~32k output = ~$0,48 (~R$ 2,78) ✓ Dentro do budget de R$ 5,00
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
