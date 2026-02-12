import { describe, it, expect } from "vitest";
import {
  GLOSSARIO_PATRIMONIO_TOTAL,
  GLOSSARIO_VARIACAO_PATRIMONIAL,
  GLOSSARIO_GANHOS_NO_MES,
  GLOSSARIO_RENTABILIDADE_MENSAL,
  GLOSSARIO_RENTABILIDADE_ANUAL,
  GLOSSARIO_DESDE_INICIO,
  GLOSSARIO_EVOLUCAO_PATRIMONIAL,
  GLOSSARIO_TOTAL_APORTADO,
  GLOSSARIO_RENDIMENTOS,
  GLOSSARIO_ALOCACAO_POR_ESTRATEGIA,
  GLOSSARIO_ESTRATEGIAS,
  GLOSSARIO_CARTEIRA_VS_BENCHMARKS,
  GLOSSARIO_CDI,
  GLOSSARIO_IBOVESPA,
  GLOSSARIO_IPCA,
  GLOSSARIO_MELHORES_PERFORMERS,
  GLOSSARIO_PIORES_PERFORMERS,
  GLOSSARIO_ATIVO,
  GLOSSARIO_SALDO,
  GLOSSARIO_RENTABILIDADE_MES,
  GLOSSARIO_PARTICIPACAO,
  GLOSSARIO_GANHOS_POR_ESTRATEGIA,
  GLOSSARIO_PERIODO_NO_MES,
  GLOSSARIO_PERIODO_NO_ANO,
  GLOSSARIO_PERIODO_12_MESES,
  GLOSSARIO_PERIODO_DESDE_INICIO,
  GLOSSARIO_EVENTO_FINANCEIRO,
  GLOSSARIO_TIPOS_EVENTO,
  type EntradaGlossario,
} from "@/lib/glossario-financeiro";
import { CategoriaAlocacaoEnum, TipoEventoFinanceiroEnum } from "@/schemas/report-extraction.schema";

const todasEntradasIndividuais: Record<string, EntradaGlossario> = {
  GLOSSARIO_PATRIMONIO_TOTAL,
  GLOSSARIO_VARIACAO_PATRIMONIAL,
  GLOSSARIO_GANHOS_NO_MES,
  GLOSSARIO_RENTABILIDADE_MENSAL,
  GLOSSARIO_RENTABILIDADE_ANUAL,
  GLOSSARIO_DESDE_INICIO,
  GLOSSARIO_EVOLUCAO_PATRIMONIAL,
  GLOSSARIO_TOTAL_APORTADO,
  GLOSSARIO_RENDIMENTOS,
  GLOSSARIO_ALOCACAO_POR_ESTRATEGIA,
  GLOSSARIO_CARTEIRA_VS_BENCHMARKS,
  GLOSSARIO_CDI,
  GLOSSARIO_IBOVESPA,
  GLOSSARIO_IPCA,
  GLOSSARIO_MELHORES_PERFORMERS,
  GLOSSARIO_PIORES_PERFORMERS,
  GLOSSARIO_ATIVO,
  GLOSSARIO_SALDO,
  GLOSSARIO_RENTABILIDADE_MES,
  GLOSSARIO_PARTICIPACAO,
  GLOSSARIO_GANHOS_POR_ESTRATEGIA,
  GLOSSARIO_PERIODO_NO_MES,
  GLOSSARIO_PERIODO_NO_ANO,
  GLOSSARIO_PERIODO_12_MESES,
  GLOSSARIO_PERIODO_DESDE_INICIO,
  GLOSSARIO_EVENTO_FINANCEIRO,
};

describe("Glossário financeiro", () => {
  describe("entradas individuais", () => {
    it.each(Object.entries(todasEntradasIndividuais))(
      "%s deve ter termo e explicação não-vazios",
      (_nome, entrada) => {
        expect(entrada.termo.trim().length).toBeGreaterThan(0);
        expect(entrada.explicacao.trim().length).toBeGreaterThan(0);
      },
    );

    it.each(Object.entries(todasEntradasIndividuais))(
      "%s deve ter explicação com no máximo 500 caracteres",
      (_nome, entrada) => {
        expect(entrada.explicacao.length).toBeLessThanOrEqual(500);
      },
    );
  });

  describe("GLOSSARIO_ESTRATEGIAS", () => {
    const categoriasDoSchema = CategoriaAlocacaoEnum.options;

    it("deve ter uma entrada para cada categoria de alocação do schema", () => {
      for (const categoria of categoriasDoSchema) {
        expect(
          GLOSSARIO_ESTRATEGIAS[categoria],
          `Categoria "${categoria}" não encontrada no glossário de estratégias`,
        ).toBeDefined();
      }
    });

    it.each(Object.entries(GLOSSARIO_ESTRATEGIAS))(
      "estratégia '%s' deve ter termo e explicação não-vazios",
      (_chave, entrada) => {
        expect(entrada.termo.trim().length).toBeGreaterThan(0);
        expect(entrada.explicacao.trim().length).toBeGreaterThan(0);
      },
    );

    it.each(Object.entries(GLOSSARIO_ESTRATEGIAS))(
      "estratégia '%s' deve ter explicação com no máximo 500 caracteres",
      (_chave, entrada) => {
        expect(entrada.explicacao.length).toBeLessThanOrEqual(500);
      },
    );
  });

  describe("GLOSSARIO_TIPOS_EVENTO", () => {
    const tiposDoSchema = TipoEventoFinanceiroEnum.options;

    it("deve ter uma entrada para cada tipo de evento do schema", () => {
      for (const tipo of tiposDoSchema) {
        expect(
          GLOSSARIO_TIPOS_EVENTO[tipo],
          `Tipo de evento "${tipo}" não encontrado no glossário de eventos`,
        ).toBeDefined();
      }
    });

    it.each(Object.entries(GLOSSARIO_TIPOS_EVENTO))(
      "tipo de evento '%s' deve ter termo e explicação não-vazios",
      (_chave, entrada) => {
        expect(entrada.termo.trim().length).toBeGreaterThan(0);
        expect(entrada.explicacao.trim().length).toBeGreaterThan(0);
      },
    );

    it.each(Object.entries(GLOSSARIO_TIPOS_EVENTO))(
      "tipo de evento '%s' deve ter explicação com no máximo 500 caracteres",
      (_chave, entrada) => {
        expect(entrada.explicacao.length).toBeLessThanOrEqual(500);
      },
    );
  });
});
