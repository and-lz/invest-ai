import type { MarketDataService } from "@/domain/interfaces/market-data-service";
import { RespostaListaBrapiSchema, RespostaCotacaoBrapiSchema } from "@/schemas/trends.schema";
import type {
  AtivoRanking,
  IndiceMercado,
  SetorPerformance,
  AtivoListaBrapi,
} from "@/schemas/trends.schema";

const BASE_URL_BRAPI = "https://brapi.dev/api";

const SETORES_PRINCIPAIS = [
  "Finance",
  "Energy Minerals",
  "Utilities",
  "Retail Trade",
  "Non-Energy Minerals",
] as const;

const TRADUCAO_SETORES: Record<string, string> = {
  Finance: "Financeiro",
  "Energy Minerals": "Energia",
  Utilities: "Utilidades",
  "Retail Trade": "Varejo",
  "Non-Energy Minerals": "Mineracao",
  "Technology Services": "Tecnologia",
  "Health Services": "Saude",
  "Consumer Non-Durables": "Consumo",
  "Consumer Services": "Servicos",
  Transportation: "Transporte",
  "Commercial Services": "Servicos Comerciais",
  "Distribution Services": "Distribuicao",
  "Process Industries": "Industria",
  Communications: "Comunicacao",
  "Producer Manufacturing": "Manufatura",
  Miscellaneous: "Diversos",
  "Electronic Technology": "Tecnologia Eletronica",
  "Industrial Services": "Servicos Industriais",
  "Health Technology": "Tecnologia em Saude",
  "Consumer Durables": "Bens Duraveis",
};

function mapearAtivoParaRanking(ativo: AtivoListaBrapi): AtivoRanking {
  return {
    ticker: ativo.stock,
    nome: ativo.name,
    preco: ativo.close,
    variacao: ativo.change,
    volume: ativo.volume,
    marketCap: ativo.market_cap,
    setor: ativo.sector,
    logo: ativo.logo,
  };
}

export class BrapiMarketDataService implements MarketDataService {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  async obterRankingAcoes(
    ordenarPor: string,
    ordem: "asc" | "desc",
    limite: number,
  ): Promise<AtivoRanking[]> {
    return this.buscarListaAtivos("stock", ordenarPor, ordem, limite);
  }

  async obterRankingFundos(
    ordenarPor: string,
    ordem: "asc" | "desc",
    limite: number,
  ): Promise<AtivoRanking[]> {
    return this.buscarListaAtivos("fund", ordenarPor, ordem, limite);
  }

  async obterCotacaoIndice(simbolo: string): Promise<IndiceMercado> {
    const url = `${BASE_URL_BRAPI}/quote/${encodeURIComponent(simbolo)}?token=${this.token}`;

    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`brapi API erro para indice ${simbolo}: ${resposta.status}`);
    }

    const dadosBrutos: unknown = await resposta.json();
    const parseResult = RespostaCotacaoBrapiSchema.safeParse(dadosBrutos);

    if (!parseResult.success) {
      throw new Error(`brapi API: resposta invalida para indice ${simbolo}`);
    }

    const resultado = parseResult.data.results[0];
    if (!resultado) {
      throw new Error(`brapi API: nenhum resultado para indice ${simbolo}`);
    }

    return {
      nome: resultado.shortName,
      simbolo: resultado.symbol,
      valor: resultado.regularMarketPrice,
      variacao: resultado.regularMarketChangePercent,
      atualizadoEm: resultado.regularMarketTime,
    };
  }

  async obterSetoresPerformance(): Promise<SetorPerformance[]> {
    const resultados = await Promise.allSettled(
      SETORES_PRINCIPAIS.map((setor) => this.calcularPerformanceSetor(setor)),
    );

    const setores: SetorPerformance[] = [];

    for (const resultado of resultados) {
      if (resultado.status === "fulfilled" && resultado.value) {
        setores.push(resultado.value);
      }
    }

    return setores.sort((a, b) => b.variacaoMedia - a.variacaoMedia);
  }

  private async buscarListaAtivos(
    tipo: "stock" | "fund",
    ordenarPor: string,
    ordem: "asc" | "desc",
    limite: number,
  ): Promise<AtivoRanking[]> {
    const parametros = new URLSearchParams({
      sortBy: ordenarPor,
      sortOrder: ordem,
      limit: String(limite),
      type: tipo,
      token: this.token,
    });

    const url = `${BASE_URL_BRAPI}/quote/list?${parametros.toString()}`;

    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`brapi API erro: ${resposta.status} ${resposta.statusText}`);
    }

    const dadosBrutos: unknown = await resposta.json();
    const parseResult = RespostaListaBrapiSchema.safeParse(dadosBrutos);

    if (!parseResult.success) {
      console.error("brapi API: resposta invalida:", parseResult.error);
      return [];
    }

    return parseResult.data.stocks.map(mapearAtivoParaRanking);
  }

  private async calcularPerformanceSetor(setor: string): Promise<SetorPerformance | null> {
    const parametros = new URLSearchParams({
      sortBy: "volume",
      sortOrder: "desc",
      limit: "5",
      type: "stock",
      sector: setor,
      token: this.token,
    });

    const url = `${BASE_URL_BRAPI}/quote/list?${parametros.toString()}`;

    const resposta = await fetch(url);
    if (!resposta.ok) return null;

    const dadosBrutos: unknown = await resposta.json();
    const parseResult = RespostaListaBrapiSchema.safeParse(dadosBrutos);

    if (!parseResult.success || parseResult.data.stocks.length === 0) return null;

    const ativos = parseResult.data.stocks;
    const somaVariacao = ativos.reduce((soma, ativo) => soma + ativo.change, 0);
    const variacaoMedia = somaVariacao / ativos.length;

    return {
      setor,
      setorTraduzido: TRADUCAO_SETORES[setor] ?? setor,
      variacaoMedia: Math.round(variacaoMedia * 100) / 100,
      quantidadeAtivos: parseResult.data.totalCount,
    };
  }
}
