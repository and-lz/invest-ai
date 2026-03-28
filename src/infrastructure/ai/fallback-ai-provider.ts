import type {
  ProvedorAi,
  ConfiguracaoGeracao,
  RespostaAi,
} from "@/domain/interfaces/ai-provider";
import { AiApiQuotaError } from "@/domain/errors/app-errors";

/**
 * Decorator that wraps a primary ProvedorAi with an automatic fallback.
 * If the primary provider fails (except quota errors), the fallback is tried.
 * Quota errors are user-specific and should not be retried with a different provider.
 */
export class FallbackProvedorAi implements ProvedorAi {
  constructor(
    private readonly primary: ProvedorAi,
    private readonly fallback: ProvedorAi | null,
  ) {}

  async gerar(configuracao: ConfiguracaoGeracao): Promise<RespostaAi> {
    try {
      return await this.primary.gerar(configuracao);
    } catch (err) {
      if (!this.fallback || err instanceof AiApiQuotaError) throw err;

      console.warn(
        `[FallbackProvedorAi] Primary provider failed, falling back. Error: ${err instanceof Error ? err.message : String(err)}`,
      );

      return this.fallback.gerar(configuracao);
    }
  }

  async *transmitir(
    configuracao: ConfiguracaoGeracao,
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Try to get at least the first chunk from primary
      const primaryStream = this.primary.transmitir(configuracao);
      const first = await primaryStream.next();

      if (first.done) return;
      yield first.value;

      // Continue with primary stream
      yield* primaryStream;
    } catch (err) {
      if (!this.fallback || err instanceof AiApiQuotaError) throw err;

      console.warn(
        `[FallbackProvedorAi] Primary streaming failed, falling back. Error: ${err instanceof Error ? err.message : String(err)}`,
      );

      // Fall back to fallback provider's stream
      yield* this.fallback.transmitir(configuracao);
    }
  }
}
