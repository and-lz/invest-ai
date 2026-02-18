import { describe, it, expect } from "vitest";
import {
  GLOSSARY_PATRIMONIO_TOTAL,
  GLOSSARY_VARIACAO_PATRIMONIAL,
  GLOSSARY_GANHOS_NO_MES,
  GLOSSARY_RENTABILIDADE_MENSAL,
  GLOSSARY_RENTABILIDADE_ANUAL,
  GLOSSARY_DESDE_INICIO,
  GLOSSARY_EVOLUCAO_PATRIMONIAL,
  GLOSSARY_TOTAL_APORTADO,
  GLOSSARY_RENDIMENTOS,
  GLOSSARY_ALOCACAO_POR_ESTRATEGIA,
  GLOSSARY_ESTRATEGIAS,
  GLOSSARY_CARTEIRA_VS_BENCHMARKS,
  GLOSSARY_CDI,
  GLOSSARY_IBOVESPA,
  GLOSSARY_IPCA,
  GLOSSARY_MELHORES_PERFORMERS,
  GLOSSARY_PIORES_PERFORMERS,
  GLOSSARY_ATIVO,
  GLOSSARY_SALDO,
  GLOSSARY_RENTABILIDADE_MES,
  GLOSSARY_PARTICIPACAO,
  GLOSSARY_GANHOS_POR_ESTRATEGIA,
  GLOSSARY_PERIODO_NO_MES,
  GLOSSARY_PERIODO_NO_ANO,
  GLOSSARY_PERIODO_12_MESES,
  GLOSSARY_PERIODO_DESDE_INICIO,
  GLOSSARY_EVENTO_FINANCEIRO,
  GLOSSARY_TIPOS_EVENTO,
  type EntradaGlossario,
} from "@/lib/financial-glossary";
import { CategoriaAlocacaoEnum, TipoEventoFinanceiroEnum } from "@/schemas/report-extraction.schema";

const todasEntradasIndividuais: Record<string, EntradaGlossario> = {
  GLOSSARY_PATRIMONIO_TOTAL,
  GLOSSARY_VARIACAO_PATRIMONIAL,
  GLOSSARY_GANHOS_NO_MES,
  GLOSSARY_RENTABILIDADE_MENSAL,
  GLOSSARY_RENTABILIDADE_ANUAL,
  GLOSSARY_DESDE_INICIO,
  GLOSSARY_EVOLUCAO_PATRIMONIAL,
  GLOSSARY_TOTAL_APORTADO,
  GLOSSARY_RENDIMENTOS,
  GLOSSARY_ALOCACAO_POR_ESTRATEGIA,
  GLOSSARY_CARTEIRA_VS_BENCHMARKS,
  GLOSSARY_CDI,
  GLOSSARY_IBOVESPA,
  GLOSSARY_IPCA,
  GLOSSARY_MELHORES_PERFORMERS,
  GLOSSARY_PIORES_PERFORMERS,
  GLOSSARY_ATIVO,
  GLOSSARY_SALDO,
  GLOSSARY_RENTABILIDADE_MES,
  GLOSSARY_PARTICIPACAO,
  GLOSSARY_GANHOS_POR_ESTRATEGIA,
  GLOSSARY_PERIODO_NO_MES,
  GLOSSARY_PERIODO_NO_ANO,
  GLOSSARY_PERIODO_12_MESES,
  GLOSSARY_PERIODO_DESDE_INICIO,
  GLOSSARY_EVENTO_FINANCEIRO,
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

  describe("GLOSSARY_ESTRATEGIAS", () => {
    const categoriasDoSchema = CategoriaAlocacaoEnum.options;

    it("deve ter uma entrada para cada categoria de alocação do schema", () => {
      for (const categoria of categoriasDoSchema) {
        expect(
          GLOSSARY_ESTRATEGIAS[categoria],
          `Categoria "${categoria}" não encontrada no glossário de estratégias`,
        ).toBeDefined();
      }
    });

    it.each(Object.entries(GLOSSARY_ESTRATEGIAS))(
      "estratégia '%s' deve ter termo e explicação não-vazios",
      (_chave, entrada) => {
        expect(entrada.termo.trim().length).toBeGreaterThan(0);
        expect(entrada.explicacao.trim().length).toBeGreaterThan(0);
      },
    );

    it.each(Object.entries(GLOSSARY_ESTRATEGIAS))(
      "estratégia '%s' deve ter explicação com no máximo 500 caracteres",
      (_chave, entrada) => {
        expect(entrada.explicacao.length).toBeLessThanOrEqual(500);
      },
    );
  });

  describe("GLOSSARY_TIPOS_EVENTO", () => {
    const tiposDoSchema = TipoEventoFinanceiroEnum.options;

    it("deve ter uma entrada para cada tipo de evento do schema", () => {
      for (const tipo of tiposDoSchema) {
        expect(
          GLOSSARY_TIPOS_EVENTO[tipo],
          `Tipo de evento "${tipo}" não encontrado no glossário de eventos`,
        ).toBeDefined();
      }
    });

    it.each(Object.entries(GLOSSARY_TIPOS_EVENTO))(
      "tipo de evento '%s' deve ter termo e explicação não-vazios",
      (_chave, entrada) => {
        expect(entrada.termo.trim().length).toBeGreaterThan(0);
        expect(entrada.explicacao.trim().length).toBeGreaterThan(0);
      },
    );

    it.each(Object.entries(GLOSSARY_TIPOS_EVENTO))(
      "tipo de evento '%s' deve ter explicação com no máximo 500 caracteres",
      (_chave, entrada) => {
        expect(entrada.explicacao.length).toBeLessThanOrEqual(500);
      },
    );
  });
});
