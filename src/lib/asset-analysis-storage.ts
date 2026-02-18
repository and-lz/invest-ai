import { db } from "@/lib/db";
import { analiseAtivos } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { AnaliseAtivoResponseSchema } from "@/schemas/asset-analysis.schema";
import type { AnaliseAtivoResponse } from "@/schemas/asset-analysis.schema";

// ============================================================
// Storage para analises de ativo individual.
// Persiste no PostgreSQL via Drizzle (Neon).
// Cache de 24h controlado pela aplicação via campo dataAnalise.
// ============================================================

const CACHE_DURACAO_HORAS = 24;

function normalizarTicker(codigoAtivo: string): string {
  return codigoAtivo.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

/**
 * Salva analise de ativo no banco de dados.
 */
export async function salvarAnaliseAtivo(
  analise: AnaliseAtivoResponse,
  usuarioId: string,
): Promise<void> {
  const codigoNormalizado = normalizarTicker(analise.codigoAtivo);
  await db
    .insert(analiseAtivos)
    .values({
      usuarioId,
      codigoAtivo: codigoNormalizado,
      dados: analise as unknown as Record<string, unknown>,
      dataAnalise: new Date(analise.dataAnalise),
      atualizadoEm: new Date(),
    })
    .onConflictDoUpdate({
      target: [analiseAtivos.usuarioId, analiseAtivos.codigoAtivo],
      set: {
        dados: analise as unknown as Record<string, unknown>,
        dataAnalise: new Date(analise.dataAnalise),
        atualizadoEm: new Date(),
      },
    });
}

/**
 * Carrega analise cacheada de um ativo.
 * Retorna null se nao existe ou se o cache expirou (> 24h).
 */
export async function lerAnaliseAtivo(
  codigoAtivo: string,
  usuarioId: string,
): Promise<AnaliseAtivoResponse | null> {
  const codigoNormalizado = normalizarTicker(codigoAtivo);

  try {
    const rows = await db
      .select()
      .from(analiseAtivos)
      .where(
        and(
          eq(analiseAtivos.usuarioId, usuarioId),
          eq(analiseAtivos.codigoAtivo, codigoNormalizado),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0]!;
    if (cacheExpirou(row.dataAnalise)) return null;

    const resultado = AnaliseAtivoResponseSchema.safeParse(row.dados);
    if (!resultado.success) {
      console.warn(`[AnaliseAtivoStorage] Dados invalidos para ${codigoAtivo}:`, resultado.error);
      return null;
    }

    return resultado.data;
  } catch (erro) {
    console.warn(`[AnaliseAtivoStorage] Falha ao ler analise de ${codigoAtivo}:`, erro);
    return null;
  }
}

/**
 * Verifica se existe analise cacheada valida (< 24h).
 * Retorna a dataAnalise se existe, null se nao.
 */
export async function verificarCacheAnalise(
  codigoAtivo: string,
  usuarioId: string,
): Promise<{ existe: boolean; dataAnalise: string | null }> {
  const codigoNormalizado = normalizarTicker(codigoAtivo);

  try {
    const rows = await db
      .select({ dataAnalise: analiseAtivos.dataAnalise })
      .from(analiseAtivos)
      .where(
        and(
          eq(analiseAtivos.usuarioId, usuarioId),
          eq(analiseAtivos.codigoAtivo, codigoNormalizado),
        ),
      )
      .limit(1);

    if (rows.length === 0) return { existe: false, dataAnalise: null };

    const dataAnalise = rows[0]!.dataAnalise.toISOString();
    if (cacheExpirou(rows[0]!.dataAnalise)) {
      return { existe: false, dataAnalise };
    }

    return { existe: true, dataAnalise };
  } catch {
    return { existe: false, dataAnalise: null };
  }
}

function cacheExpirou(dataAnalise: Date): boolean {
  const agora = new Date();
  const diferencaHoras = (agora.getTime() - dataAnalise.getTime()) / (1000 * 60 * 60);
  return diferencaHoras > CACHE_DURACAO_HORAS;
}
