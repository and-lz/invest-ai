import { describe, it, expect } from "vitest";
import {
  CriarItemPlanoSchema,
  AtualizarItemPlanoSchema,
  ItemPlanoAcaoSchema,
  EnriquecimentoAiSchema,
} from "@/schemas/plano-acao.schema";

describe("Action Plan Schemas", () => {
  describe("CriarItemPlanoSchema", () => {
    it("Given valid data / When parsed / Then should succeed", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "Carteira acima do CDI no periodo",
        tipoConclusao: "positivo",
        origem: "takeaway-dashboard",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.textoOriginal).toBe("Carteira acima do CDI no periodo");
        expect(result.data.tipoConclusao).toBe("positivo");
        expect(result.data.origem).toBe("takeaway-dashboard");
        expect(result.data.ativosRelacionados).toEqual([]);
      }
    });

    it("Given valid data with ativosRelacionados / When parsed / Then should include assets", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "PETR4 caiu 15% no mes",
        tipoConclusao: "atencao",
        origem: "takeaway-dashboard",
        ativosRelacionados: ["PETR4"],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ativosRelacionados).toEqual(["PETR4"]);
      }
    });

    it("Given insight origin / When parsed / Then should accept insight-acao-sugerida", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "Considere diversificar sua carteira",
        tipoConclusao: "neutro",
        origem: "insight-acao-sugerida",
      });

      expect(result.success).toBe(true);
    });

    it("Given empty textoOriginal / When parsed / Then should fail", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "",
        tipoConclusao: "positivo",
        origem: "takeaway-dashboard",
      });

      expect(result.success).toBe(false);
    });

    it("Given missing tipoConclusao / When parsed / Then should fail", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "Some conclusion",
        origem: "takeaway-dashboard",
      });

      expect(result.success).toBe(false);
    });

    it("Given invalid origem / When parsed / Then should fail", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "Some conclusion",
        tipoConclusao: "positivo",
        origem: "invalid-source",
      });

      expect(result.success).toBe(false);
    });

    it("Given textoOriginal exceeding 500 chars / When parsed / Then should fail", () => {
      const result = CriarItemPlanoSchema.safeParse({
        textoOriginal: "x".repeat(501),
        tipoConclusao: "positivo",
        origem: "takeaway-dashboard",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("AtualizarItemPlanoSchema", () => {
    it("Given valid status 'concluida' / When parsed / Then should succeed", () => {
      const result = AtualizarItemPlanoSchema.safeParse({ status: "concluida" });
      expect(result.success).toBe(true);
    });

    it("Given valid status 'ignorada' / When parsed / Then should succeed", () => {
      const result = AtualizarItemPlanoSchema.safeParse({ status: "ignorada" });
      expect(result.success).toBe(true);
    });

    it("Given valid status 'pendente' / When parsed / Then should succeed", () => {
      const result = AtualizarItemPlanoSchema.safeParse({ status: "pendente" });
      expect(result.success).toBe(true);
    });

    it("Given invalid status / When parsed / Then should fail", () => {
      const result = AtualizarItemPlanoSchema.safeParse({ status: "in_progress" });
      expect(result.success).toBe(false);
    });

    it("Given missing status / When parsed / Then should fail", () => {
      const result = AtualizarItemPlanoSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("EnriquecimentoAiSchema", () => {
    it("Given valid AI enrichment / When parsed / Then should succeed", () => {
      const result = EnriquecimentoAiSchema.safeParse({
        recomendacaoEnriquecida: "Considere manter a estrategia atual.",
        fundamentacao: "Rendimento acima do CDI indica boa diversificacao.",
      });

      expect(result.success).toBe(true);
    });

    it("Given empty recomendacaoEnriquecida / When parsed / Then should fail", () => {
      const result = EnriquecimentoAiSchema.safeParse({
        recomendacaoEnriquecida: "",
        fundamentacao: "Some reasoning.",
      });

      expect(result.success).toBe(false);
    });

    it("Given recomendacao exceeding 1000 chars / When parsed / Then should fail", () => {
      const result = EnriquecimentoAiSchema.safeParse({
        recomendacaoEnriquecida: "x".repeat(1001),
        fundamentacao: "Some reasoning.",
      });

      expect(result.success).toBe(false);
    });

    it("Given fundamentacao exceeding 500 chars / When parsed / Then should fail", () => {
      const result = EnriquecimentoAiSchema.safeParse({
        recomendacaoEnriquecida: "Some recommendation.",
        fundamentacao: "x".repeat(501),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("ItemPlanoAcaoSchema", () => {
    const validItem = {
      identificador: "550e8400-e29b-41d4-a716-446655440000",
      usuarioId: "google_123456",
      textoOriginal: "Carteira acima do CDI",
      tipoConclusao: "positivo" as const,
      origem: "takeaway-dashboard" as const,
      recomendacaoEnriquecida: "Considere manter a estrategia atual.",
      fundamentacao: "Bom rendimento relativo.",
      ativosRelacionados: ["PETR4", "VALE3"],
      status: "pendente" as const,
      criadoEm: "2026-02-17T10:00:00.000Z",
      atualizadoEm: "2026-02-17T10:00:00.000Z",
      concluidoEm: null,
    };

    it("Given a complete valid item / When parsed / Then should succeed", () => {
      const result = ItemPlanoAcaoSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it("Given item with concluidoEm set / When parsed / Then should succeed", () => {
      const result = ItemPlanoAcaoSchema.safeParse({
        ...validItem,
        status: "concluida",
        concluidoEm: "2026-02-18T10:00:00.000Z",
      });

      expect(result.success).toBe(true);
    });

    it("Given item with empty ativosRelacionados / When parsed / Then should succeed", () => {
      const result = ItemPlanoAcaoSchema.safeParse({
        ...validItem,
        ativosRelacionados: [],
      });

      expect(result.success).toBe(true);
    });

    it("Given item with null enrichment / When parsed / Then should succeed (graceful fallback)", () => {
      const result = ItemPlanoAcaoSchema.safeParse({
        ...validItem,
        recomendacaoEnriquecida: null,
        fundamentacao: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recomendacaoEnriquecida).toBeNull();
        expect(result.data.fundamentacao).toBeNull();
      }
    });

    it("Given item without enrichment fields / When parsed / Then should default to null", () => {
      const itemSemEnriquecimento = {
        identificador: validItem.identificador,
        usuarioId: validItem.usuarioId,
        textoOriginal: validItem.textoOriginal,
        tipoConclusao: validItem.tipoConclusao,
        origem: validItem.origem,
        ativosRelacionados: validItem.ativosRelacionados,
        status: validItem.status,
        criadoEm: validItem.criadoEm,
        atualizadoEm: validItem.atualizadoEm,
        concluidoEm: validItem.concluidoEm,
      };
      const result = ItemPlanoAcaoSchema.safeParse(itemSemEnriquecimento);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.recomendacaoEnriquecida).toBeNull();
        expect(result.data.fundamentacao).toBeNull();
      }
    });

    it("Given invalid UUID / When parsed / Then should fail", () => {
      const result = ItemPlanoAcaoSchema.safeParse({
        ...validItem,
        identificador: "not-a-uuid",
      });

      expect(result.success).toBe(false);
    });
  });
});
