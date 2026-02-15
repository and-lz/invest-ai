import { NextResponse } from "next/server";
import { obterBrapiMarketDataService, obterBcbMacroDataService } from "@/lib/container";
import { cacheGlobal } from "@/lib/cache-em-memoria";
import { cabecalhosCachePublico } from "@/lib/cabecalhos-cache";
import type { DadosTendencias } from "@/schemas/trends.schema";

const CHAVE_CACHE_TENDENCIAS = "tendencias-mercado";

export async function GET() {
  // Verificar cache
  const dadosEmCache = cacheGlobal.obter<DadosTendencias>(CHAVE_CACHE_TENDENCIAS);
  if (dadosEmCache) {
    return NextResponse.json({ tendencias: dadosEmCache }, cabecalhosCachePublico(1800, 3600));
  }

  // Verificar configuracao
  if (!process.env.BRAPI_TOKEN) {
    return NextResponse.json({ erro: "BRAPI_TOKEN nao configurado" }, { status: 503 });
  }

  const servicoMercado = obterBrapiMarketDataService();
  const servicoMacro = obterBcbMacroDataService();

  // Buscar todas as fontes em paralelo com resiliencia
  const [
    resultadoAltas,
    resultadoBaixas,
    resultadoVolume,
    resultadoFundos,
    resultadoIbovespa,
    resultadoMacro,
    resultadoSetores,
  ] = await Promise.allSettled([
    servicoMercado.obterRankingAcoes("change", "desc", 10),
    servicoMercado.obterRankingAcoes("change", "asc", 10),
    servicoMercado.obterRankingAcoes("volume", "desc", 10),
    servicoMercado.obterRankingFundos("change", "desc", 10),
    servicoMercado.obterCotacaoIndice("^BVSP"),
    servicoMacro.obterIndicadores(),
    servicoMercado.obterSetoresPerformance(),
  ]);

  const tendencias: DadosTendencias = {
    maioresAltas: resultadoAltas.status === "fulfilled" ? resultadoAltas.value : [],
    maioresBaixas: resultadoBaixas.status === "fulfilled" ? resultadoBaixas.value : [],
    maisNegociados: resultadoVolume.status === "fulfilled" ? resultadoVolume.value : [],
    maioresAltasFundos: resultadoFundos.status === "fulfilled" ? resultadoFundos.value : [],
    indicesMercado: resultadoIbovespa.status === "fulfilled" ? [resultadoIbovespa.value] : [],
    indicadoresMacro: resultadoMacro.status === "fulfilled" ? resultadoMacro.value : [],
    setoresPerformance: resultadoSetores.status === "fulfilled" ? resultadoSetores.value : [],
    atualizadoEm: new Date().toISOString(),
  };

  // Logar erros parciais para debug
  const resultados = [
    resultadoAltas,
    resultadoBaixas,
    resultadoVolume,
    resultadoFundos,
    resultadoIbovespa,
    resultadoMacro,
    resultadoSetores,
  ];
  for (const resultado of resultados) {
    if (resultado.status === "rejected") {
      console.error("Erro parcial em /api/trends:", resultado.reason);
    }
  }

  // Salvar no cache (TTL padrao: 30 minutos)
  cacheGlobal.definir(CHAVE_CACHE_TENDENCIAS, tendencias);

  return NextResponse.json({ tendencias }, cabecalhosCachePublico(1800, 3600));
}
