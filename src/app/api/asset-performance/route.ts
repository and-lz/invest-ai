import { NextResponse } from "next/server";
import { obterFilesystemReportRepository, obterBrapiAssetDetailService } from "@/lib/container";
import { agregarDadosDoAtivo, listarAtivosUnicos } from "@/lib/agregar-dados-ativo";
import { verificarCacheAnalise } from "@/lib/analise-ativo-storage";
import { cabecalhosCachePrivado } from "@/lib/cabecalhos-cache";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";

/**
 * GET /api/asset-performance?ticker=PETR4
 *
 * Retorna dados agregados do ativo (carteira + brapi) sem IA.
 * Se nenhum ticker fornecido, retorna lista de ativos da carteira.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tickerParam = searchParams.get("ticker");

    const repositorio = await obterFilesystemReportRepository();
    const todosMetadados = await repositorio.listarTodosMetadados();

    // Carregar todos os relatorios extraidos
    const relatorios: RelatorioExtraido[] = [];
    for (const metadado of todosMetadados) {
      const dados = await repositorio.obterDadosExtraidos(metadado.identificador);
      if (dados) relatorios.push(dados);
    }

    // Se nenhum ticker: retorna lista de ativos unicos da carteira
    if (!tickerParam) {
      const ativosUnicos = listarAtivosUnicos(relatorios);
      return NextResponse.json({ ativos: ativosUnicos }, cabecalhosCachePrivado(60, 300));
    }

    // Agregar dados do ativo nos relatorios
    const dadosAgregados = agregarDadosDoAtivo(relatorios, tickerParam);

    // Buscar dados brapi em paralelo com verificacao de cache
    const servicoBrapi = obterBrapiAssetDetailService();
    const [detalhesBrapi, cacheAnalise] = await Promise.all([
      servicoBrapi.obterDetalhesAtivo(tickerParam).catch(() => null),
      verificarCacheAnalise(tickerParam),
    ]);

    const estaNaCarteira = dadosAgregados !== null;

    return NextResponse.json(
      {
        codigoAtivo: tickerParam.toUpperCase(),
        nomeAtivo:
          dadosAgregados?.nomeAtivo ?? detalhesBrapi?.nomeAtivo ?? tickerParam.toUpperCase(),
        estrategia: dadosAgregados?.estrategia ?? null,
        estaNaCarteira,
        historicoNaCarteira: dadosAgregados?.historicoNaCarteira ?? [],
        movimentacoesDoAtivo: dadosAgregados?.movimentacoesDoAtivo ?? [],
        eventosFinanceirosDoAtivo: dadosAgregados?.eventosFinanceirosDoAtivo ?? [],
        cotacaoAtual: detalhesBrapi?.cotacaoAtual ?? null,
        dadosFundamentalistas: detalhesBrapi?.dadosFundamentalistas ?? null,
        historicoDividendos: detalhesBrapi?.historicoDividendos ?? [],
        saldoAtualCentavos: dadosAgregados?.saldoAtualCentavos ?? 0,
        participacaoAtualCarteira: dadosAgregados?.participacaoAtualCarteira ?? 0,
        analiseCacheada: cacheAnalise,
      },
      cabecalhosCachePrivado(60, 300),
    );
  } catch (erro) {
    console.error("Erro ao buscar dados do ativo:", erro);
    return NextResponse.json({ erro: "Falha ao buscar dados do ativo" }, { status: 500 });
  }
}
