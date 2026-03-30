import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import type { Conclusao } from "@/components/ui/takeaway-box";
import type { PosicaoAtivo } from "@/schemas/report-extraction.schema";

export type ColunaPosicoes =
  | "ativo"
  | "estrategia"
  | "saldo"
  | "rentabilidadeMes"
  | "rentabilidade12m"
  | "rentabilidadeDesdeInicio"
  | "participacao";

export function obterValorColuna(posicao: PosicaoAtivo, coluna: ColunaPosicoes): string | number {
  switch (coluna) {
    case "ativo":
      return posicao.codigoAtivo ?? posicao.nomeAtivo;
    case "estrategia":
      return posicao.estrategia;
    case "saldo":
      return posicao.saldoBruto.valorEmCentavos;
    case "rentabilidadeMes":
      return posicao.rentabilidadeMes.valor;
    case "rentabilidade12m":
      return posicao.rentabilidade12Meses?.valor ?? -Infinity;
    case "rentabilidadeDesdeInicio":
      return posicao.rentabilidadeDesdeInicio?.valor ?? -Infinity;
    case "participacao":
      return posicao.participacaoNaCarteira.valor;
  }
}

export function gerarConclusaoTodasPosicoes(posicoes: PosicaoAtivo[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (posicoes.length === 0) return conclusoes;

  const positivasNoMes = posicoes.filter((posicao) => posicao.rentabilidadeMes.valor > 0);
  const negativasNoMes = posicoes.filter((posicao) => posicao.rentabilidadeMes.valor < 0);

  conclusoes.push({
    texto: `Você tem ${posicoes.length} posições. ${positivasNoMes.length} estão positivas no mês e ${negativasNoMes.length} negativas.`,
    tipo:
      positivasNoMes.length > negativasNoMes.length
        ? "positivo"
        : positivasNoMes.length === negativasNoMes.length
          ? "neutro"
          : "atencao",
  });

  const maisConcentrada = [...posicoes].sort(
    (posicaoA, posicaoB) =>
      posicaoB.participacaoNaCarteira.valor - posicaoA.participacaoNaCarteira.valor,
  )[0];

  if (maisConcentrada && maisConcentrada.participacaoNaCarteira.valor > 10) {
    conclusoes.push({
      texto: `Maior posição: ${maisConcentrada.codigoAtivo ?? maisConcentrada.nomeAtivo} com ${formatSimplePercentage(maisConcentrada.participacaoNaCarteira.valor)} da carteira.`,
      tipo: maisConcentrada.participacaoNaCarteira.valor > 25 ? "atencao" : "neutro",
      acionavel: maisConcentrada.participacaoNaCarteira.valor > 25,
    });
  }

  return conclusoes;
}
