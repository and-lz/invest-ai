import type { ReportRepository } from "@/domain/interfaces/report-repository";
import type { AssetAnalysisService } from "@/domain/interfaces/asset-analysis-service";
import type { AnaliseAtivoResponse } from "@/schemas/analise-ativo.schema";
import type { DadosAtivoParaPrompt, ContextoMacroCondensado } from "@/lib/serializar-dados-ativo-markdown";
import type { ComparacaoBenchmarks } from "@/schemas/report-extraction.schema";
import type { DetalhesAtivoBrapi, BrapiAssetDetailService } from "@/infrastructure/services/brapi-asset-detail-service";
import type { MacroDataService } from "@/domain/interfaces/market-data-service";
import { agregarDadosDoAtivo } from "@/lib/agregar-dados-ativo";

// ============================================================
// Use case: Analise de desempenho de ativo individual.
// Orquestra coleta de dados (relatorios + brapi + macro) e
// dispara analise via IA.
// ============================================================

export interface AnalyzeAssetPerformanceInput {
  readonly codigoAtivo: string;
}

export class AnalyzeAssetPerformanceUseCase {
  constructor(
    private readonly repositorio: ReportRepository,
    private readonly servicoAnalise: AssetAnalysisService,
    private readonly servicoBrapi: BrapiAssetDetailService,
    private readonly servicoMacro: MacroDataService,
  ) {}

  async executar(entrada: AnalyzeAssetPerformanceInput): Promise<AnaliseAtivoResponse> {
    // 1. Carregar todos os relatorios em paralelo com dados externos
    const [todosMetadados, detalhesBrapi, contextoMacro] = await Promise.all([
      this.repositorio.listarTodosMetadados(),
      this.buscarDetalhesBrapiSilencioso(entrada.codigoAtivo),
      this.buscarContextoMacroSilencioso(),
    ]);

    // 2. Carregar dados extraidos de cada relatorio
    const relatorios = await Promise.all(
      todosMetadados.map(async (metadado) => {
        const dados = await this.repositorio.obterDadosExtraidos(metadado.identificador);
        return dados;
      }),
    );
    const relatoriosValidos = relatorios.filter(
      (relatorio): relatorio is NonNullable<typeof relatorio> => relatorio !== null,
    );

    // 3. Agregar dados do ativo especifico dos relatorios
    const dadosAgregados = agregarDadosDoAtivo(relatoriosValidos, entrada.codigoAtivo);

    // 4. Obter benchmarks da carteira do relatorio mais recente
    const relatorioMaisRecente = relatoriosValidos.at(-1);
    const benchmarksCarteira: ComparacaoBenchmarks[] =
      relatorioMaisRecente?.comparacaoBenchmarks ?? [];

    // 5. Montar dados completos para o prompt
    const estaNaCarteira = dadosAgregados !== null;
    const nomeAtivo = dadosAgregados?.nomeAtivo ?? detalhesBrapi?.nomeAtivo ?? entrada.codigoAtivo;

    const dadosParaPrompt: DadosAtivoParaPrompt = {
      codigoAtivo: entrada.codigoAtivo,
      nomeAtivo,
      estrategia: dadosAgregados?.estrategia ?? null,
      estaNaCarteira,
      historicoNaCarteira: dadosAgregados?.historicoNaCarteira ?? [],
      movimentacoesDoAtivo: dadosAgregados?.movimentacoesDoAtivo ?? [],
      eventosFinanceirosDoAtivo: dadosAgregados?.eventosFinanceirosDoAtivo ?? [],
      cotacaoAtual: detalhesBrapi?.cotacaoAtual ?? null,
      dadosFundamentalistas: detalhesBrapi?.dadosFundamentalistas ?? null,
      historicoDividendosBrapi: detalhesBrapi?.historicoDividendos ?? [],
      benchmarksCarteira,
      contextoMacro,
    };

    // 6. Chamar IA para analise
    return this.servicoAnalise.analisarAtivo(dadosParaPrompt);
  }

  /** Busca detalhes no brapi — falha silenciosa retorna null */
  private async buscarDetalhesBrapiSilencioso(
    ticker: string,
  ): Promise<DetalhesAtivoBrapi | null> {
    try {
      return await this.servicoBrapi.obterDetalhesAtivo(ticker);
    } catch (erro) {
      console.warn(`[AnalyzeAssetPerformance] Falha ao buscar brapi para ${ticker}:`, erro);
      return null;
    }
  }

  /** Busca contexto macro — falha silenciosa retorna valores default */
  private async buscarContextoMacroSilencioso(): Promise<ContextoMacroCondensado> {
    try {
      const indicadores = await this.servicoMacro.obterIndicadores();

      const selic = indicadores.find((indicador) => indicador.nome === "SELIC Meta");
      const ipca = indicadores.find((indicador) => indicador.nome === "IPCA");
      const cdi = indicadores.find((indicador) => indicador.nome === "CDI");

      return {
        selicAtual: selic?.valorAtual ?? 0,
        ipcaAtual: ipca?.valorAtual ?? 0,
        cdiAtual: cdi?.valorAtual ?? 0,
      };
    } catch (erro) {
      console.warn("[AnalyzeAssetPerformance] Falha ao buscar macro:", erro);
      return { selicAtual: 0, ipcaAtual: 0, cdiAtual: 0 };
    }
  }
}
