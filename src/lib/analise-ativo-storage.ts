import { obterFileManager } from "@/lib/container";
import { AnaliseAtivoResponseSchema } from "@/schemas/analise-ativo.schema";
import type { AnaliseAtivoResponse } from "@/schemas/analise-ativo.schema";

// ============================================================
// Storage para analises de ativo individual.
// Persiste em data/asset-analysis/{ticker}.json (dev) ou Vercel Blob (prod).
// Cache de 24h.
// ============================================================

const SUBDIRETORIO_ANALISES = "asset-analysis";
const CACHE_DURACAO_HORAS = 24;

function obterCaminhoArquivo(codigoAtivo: string): string {
  const tickerNormalizado = codigoAtivo.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return `${SUBDIRETORIO_ANALISES}/${tickerNormalizado}.json`;
}

/**
 * Salva analise de ativo no filesystem.
 */
export async function salvarAnaliseAtivo(analise: AnaliseAtivoResponse): Promise<void> {
  const fileManager = await obterFileManager();
  const caminhoRelativo = obterCaminhoArquivo(analise.codigoAtivo);
  await fileManager.salvarJson(caminhoRelativo, analise);
}

/**
 * Carrega analise cacheada de um ativo.
 * Retorna null se nao existe ou se o cache expirou (> 24h).
 */
export async function lerAnaliseAtivo(
  codigoAtivo: string,
): Promise<AnaliseAtivoResponse | null> {
  const fileManager = await obterFileManager();
  const caminhoRelativo = obterCaminhoArquivo(codigoAtivo);

  const existe = await fileManager.arquivoExiste(caminhoRelativo);
  if (!existe) return null;

  try {
    const dadosBrutos = await fileManager.lerJson<unknown>(caminhoRelativo);
    const resultado = AnaliseAtivoResponseSchema.safeParse(dadosBrutos);

    if (!resultado.success) {
      console.warn(
        `[AnaliseAtivoStorage] JSON invalido para ${codigoAtivo}:`,
        resultado.error,
      );
      return null;
    }

    // Verificar se cache expirou
    if (cacheExpirou(resultado.data.dataAnalise)) {
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
): Promise<{ existe: boolean; dataAnalise: string | null }> {
  const fileManager = await obterFileManager();
  const caminhoRelativo = obterCaminhoArquivo(codigoAtivo);

  const existe = await fileManager.arquivoExiste(caminhoRelativo);
  if (!existe) return { existe: false, dataAnalise: null };

  try {
    const dadosBrutos = await fileManager.lerJson<unknown>(caminhoRelativo);
    const resultado = AnaliseAtivoResponseSchema.safeParse(dadosBrutos);

    if (!resultado.success) return { existe: false, dataAnalise: null };

    if (cacheExpirou(resultado.data.dataAnalise)) {
      return { existe: false, dataAnalise: resultado.data.dataAnalise };
    }

    return { existe: true, dataAnalise: resultado.data.dataAnalise };
  } catch {
    return { existe: false, dataAnalise: null };
  }
}

function cacheExpirou(dataAnalise: string): boolean {
  const dataAnaliseDate = new Date(dataAnalise);
  const agora = new Date();
  const diferencaHoras =
    (agora.getTime() - dataAnaliseDate.getTime()) / (1000 * 60 * 60);
  return diferencaHoras > CACHE_DURACAO_HORAS;
}
