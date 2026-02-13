import type { MacroDataService } from "@/domain/interfaces/market-data-service";
import { RespostaBcbSchema } from "@/schemas/trends.schema";
import type { IndicadorMacro, PontoHistoricoMacro } from "@/schemas/trends.schema";

const BASE_URL_BCB = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

interface DefinicaoIndicador {
  nome: string;
  codigo: number;
  unidade: string;
  quantidadeUltimos: number;
}

const INDICADORES_BCB: DefinicaoIndicador[] = [
  { nome: "SELIC Meta", codigo: 432, unidade: "% a.a.", quantidadeUltimos: 12 },
  { nome: "IPCA", codigo: 433, unidade: "% a.m.", quantidadeUltimos: 12 },
  { nome: "CDI", codigo: 12, unidade: "% a.a.", quantidadeUltimos: 1 },
  { nome: "IGPM", codigo: 189, unidade: "% a.m.", quantidadeUltimos: 12 },
  { nome: "USD/BRL (PTAX)", codigo: 1, unidade: "BRL", quantidadeUltimos: 30 },
];

function converterDataBcbParaIso(dataBcb: string): string {
  const partes = dataBcb.split("/");
  if (partes.length !== 3) return dataBcb;
  const [dia, mes, ano] = partes;
  return `${ano}-${mes}-${dia}`;
}

export class BcbMacroDataService implements MacroDataService {
  async obterIndicadores(): Promise<IndicadorMacro[]> {
    const resultados = await Promise.allSettled(
      INDICADORES_BCB.map((definicao) => this.buscarSerie(definicao)),
    );

    const indicadores: IndicadorMacro[] = [];

    for (const resultado of resultados) {
      if (resultado.status === "fulfilled" && resultado.value) {
        indicadores.push(resultado.value);
      }
    }

    return indicadores;
  }

  private async buscarSerie(definicao: DefinicaoIndicador): Promise<IndicadorMacro | null> {
    const url = `${BASE_URL_BCB}.${definicao.codigo}/dados/ultimos/${definicao.quantidadeUltimos}?formato=json`;

    const resposta = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!resposta.ok) {
      console.error(
        `BCB API erro para serie ${definicao.codigo}: ${resposta.status} ${resposta.statusText}`,
      );
      return null;
    }

    const dadosBrutos: unknown = await resposta.json();
    const parseResult = RespostaBcbSchema.safeParse(dadosBrutos);

    if (!parseResult.success) {
      console.error(
        `BCB API: resposta invalida para serie ${definicao.codigo}:`,
        parseResult.error,
      );
      return null;
    }

    const pontos = parseResult.data;
    if (pontos.length === 0) return null;

    const historico: PontoHistoricoMacro[] = pontos.map((ponto) => ({
      data: converterDataBcbParaIso(ponto.data),
      valor: parseFloat(ponto.valor),
    }));

    const ultimoPonto = historico[historico.length - 1];
    if (!ultimoPonto) return null;

    return {
      nome: definicao.nome,
      codigo: definicao.codigo,
      valorAtual: ultimoPonto.valor,
      unidade: definicao.unidade,
      historico,
    };
  }
}
