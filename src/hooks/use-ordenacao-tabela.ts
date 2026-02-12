import { useState, useMemo, useCallback } from "react";

type DirecaoOrdenacao = "asc" | "desc";

interface EstadoOrdenacao<TChave extends string> {
  coluna: TChave | null;
  direcao: DirecaoOrdenacao;
}

interface ResultadoOrdenacao<TItem, TChave extends string> {
  itensOrdenados: TItem[];
  colunaOrdenacao: TChave | null;
  direcaoOrdenacao: DirecaoOrdenacao;
  alternarOrdenacao: (coluna: TChave) => void;
}

export function useOrdenacaoTabela<TItem, TChave extends string>(
  itens: TItem[],
  obterValor: (item: TItem, coluna: TChave) => string | number,
): ResultadoOrdenacao<TItem, TChave> {
  const [estadoOrdenacao, setEstadoOrdenacao] = useState<EstadoOrdenacao<TChave>>({
    coluna: null,
    direcao: "asc",
  });

  const alternarOrdenacao = useCallback((coluna: TChave) => {
    setEstadoOrdenacao((estadoAnterior) => {
      if (estadoAnterior.coluna === coluna) {
        return estadoAnterior.direcao === "asc"
          ? { coluna, direcao: "desc" as const }
          : { coluna: null, direcao: "asc" as const };
      }
      return { coluna, direcao: "asc" as const };
    });
  }, []);

  const itensOrdenados = useMemo(() => {
    if (!estadoOrdenacao.coluna) return itens;

    const colunaAtiva = estadoOrdenacao.coluna;
    const multiplicador = estadoOrdenacao.direcao === "asc" ? 1 : -1;

    return [...itens].sort((itemA, itemB) => {
      const valorA = obterValor(itemA, colunaAtiva);
      const valorB = obterValor(itemB, colunaAtiva);

      if (typeof valorA === "string" && typeof valorB === "string") {
        return valorA.localeCompare(valorB, "pt-BR") * multiplicador;
      }

      return ((valorA as number) - (valorB as number)) * multiplicador;
    });
  }, [itens, estadoOrdenacao, obterValor]);

  return {
    itensOrdenados,
    colunaOrdenacao: estadoOrdenacao.coluna,
    direcaoOrdenacao: estadoOrdenacao.direcao,
    alternarOrdenacao,
  };
}
