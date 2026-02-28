import { describe, it, expect } from "vitest";
import {
  descreverTarefa,
  LABELS_TIPO_TAREFA,
  TipoTarefaEnum,
  type TarefaBackground,
} from "@/lib/task-description";

function criarTarefa(overrides: Partial<TarefaBackground> = {}): TarefaBackground {
  return {
    identificador: "550e8400-e29b-41d4-a716-446655440000",
    tipo: "upload-pdf",
    status: "processando",
    iniciadoEm: new Date().toISOString(),
    ...overrides,
  };
}

describe("task-description utilities", () => {
  describe("LABELS_TIPO_TAREFA", () => {
    describe("Given the task type labels mapping", () => {
      it("When checking all enum values, Then every task type has a corresponding label", () => {
        const allTypes = TipoTarefaEnum.options;

        for (const tipo of allTypes) {
          expect(LABELS_TIPO_TAREFA).toHaveProperty(tipo);
          expect(typeof LABELS_TIPO_TAREFA[tipo]).toBe("string");
          expect(LABELS_TIPO_TAREFA[tipo].length).toBeGreaterThan(0);
        }
      });

      it("When inspecting known labels, Then they match expected Portuguese descriptions", () => {
        expect(LABELS_TIPO_TAREFA["upload-pdf"]).toBe("Processando PDF");
        expect(LABELS_TIPO_TAREFA["gerar-insights"]).toBe("Gerando insights");
        expect(LABELS_TIPO_TAREFA["gerar-insights-consolidados"]).toBe(
          "Gerando insights consolidados",
        );
        expect(LABELS_TIPO_TAREFA["analisar-ativo"]).toBe("Analisando ativo");
        expect(LABELS_TIPO_TAREFA["enriquecer-item-plano"]).toBe(
          "Enriquecendo item do plano",
        );
        expect(LABELS_TIPO_TAREFA["explicar-conclusoes"]).toBe(
          "Explicando conclusões",
        );
      });
    });
  });

  describe("descreverTarefa", () => {
    describe("Given a task of type upload-pdf", () => {
      it("When describing the task, Then returns base label without extra context", () => {
        const tarefa = criarTarefa({ tipo: "upload-pdf" });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Processando PDF");
      });

      it("When the task has parametros, Then still returns only the base label", () => {
        const tarefa = criarTarefa({
          tipo: "upload-pdf",
          parametros: { identificadorRelatorio: "2025-01" },
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Processando PDF");
      });
    });

    describe("Given a task of type gerar-insights", () => {
      it("When parametros has identificadorRelatorio, Then appends the report identifier", () => {
        const tarefa = criarTarefa({
          tipo: "gerar-insights",
          parametros: { identificadorRelatorio: "2025-01" },
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Gerando insights — 2025-01");
      });

      it("When parametros is absent, Then returns base label only", () => {
        const tarefa = criarTarefa({ tipo: "gerar-insights" });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Gerando insights");
      });

      it("When parametros exists but identificadorRelatorio is missing, Then returns base label only", () => {
        const tarefa = criarTarefa({
          tipo: "gerar-insights",
          parametros: { someOtherKey: "value" },
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Gerando insights");
      });
    });

    describe("Given a task of type gerar-insights-consolidados", () => {
      it("When describing the task, Then returns base label without extra context", () => {
        const tarefa = criarTarefa({ tipo: "gerar-insights-consolidados" });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Gerando insights consolidados");
      });
    });

    describe("Given a task of type analisar-ativo", () => {
      it("When parametros has codigoAtivo, Then appends the ticker symbol", () => {
        const tarefa = criarTarefa({
          tipo: "analisar-ativo",
          parametros: { codigoAtivo: "PETR4" },
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Analisando ativo — PETR4");
      });

      it("When parametros is absent, Then returns base label only", () => {
        const tarefa = criarTarefa({ tipo: "analisar-ativo" });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Analisando ativo");
      });

      it("When parametros exists but codigoAtivo is missing, Then returns base label only", () => {
        const tarefa = criarTarefa({
          tipo: "analisar-ativo",
          parametros: { identificadorRelatorio: "2025-01" },
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Analisando ativo");
      });
    });

    describe("Given a task of type enriquecer-item-plano", () => {
      it("When describing the task, Then returns base label without extra context", () => {
        const tarefa = criarTarefa({ tipo: "enriquecer-item-plano" });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Enriquecendo item do plano");
      });
    });

    describe("Given a task of type explicar-conclusoes", () => {
      it("When describing the task, Then returns base label without extra context", () => {
        const tarefa = criarTarefa({ tipo: "explicar-conclusoes" });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Explicando conclusões");
      });
    });

    describe("Given tasks with different statuses", () => {
      it("When the task status is concluido, Then description still uses the base label", () => {
        const tarefa = criarTarefa({
          tipo: "upload-pdf",
          status: "concluido",
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Processando PDF");
      });

      it("When the task status is erro, Then description still uses the base label", () => {
        const tarefa = criarTarefa({
          tipo: "gerar-insights",
          status: "erro",
          parametros: { identificadorRelatorio: "2025-03" },
        });

        const result = descreverTarefa(tarefa);

        expect(result).toBe("Gerando insights — 2025-03");
      });
    });
  });
});
