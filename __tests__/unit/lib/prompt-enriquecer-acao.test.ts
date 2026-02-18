import { describe, it, expect } from "vitest";
import {
  buildEnrichUserPrompt,
  SYSTEM_PROMPT_ENRIQUECER_ACAO,
} from "@/lib/prompt-enriquecer-acao";

describe("Action Plan AI Enrichment Prompt", () => {
  describe("buildEnrichUserPrompt", () => {
    it("Given a positive conclusion / When building prompt / Then should format with tipo and texto", () => {
      const result = buildEnrichUserPrompt(
        "Carteira acima do CDI no periodo",
        "positivo",
      );

      expect(result).toBe(
        'Tipo: positivo\nTexto: "Carteira acima do CDI no periodo"',
      );
    });

    it("Given an atencao conclusion / When building prompt / Then should format correctly", () => {
      const result = buildEnrichUserPrompt(
        "Concentração alta: Renda Fixa representa 72%",
        "atencao",
      );

      expect(result).toBe(
        'Tipo: atencao\nTexto: "Concentração alta: Renda Fixa representa 72%"',
      );
    });

    it("Given a neutro conclusion / When building prompt / Then should format correctly", () => {
      const result = buildEnrichUserPrompt(
        "Patrimônio se manteve estável",
        "neutro",
      );

      expect(result).toBe(
        'Tipo: neutro\nTexto: "Patrimônio se manteve estável"',
      );
    });

    it("Given text with special characters / When building prompt / Then should preserve them", () => {
      const result = buildEnrichUserPrompt(
        'Ativo "PETR4" caiu -15.5% (R$ 1.234,56)',
        "atencao",
      );

      expect(result).toContain('Ativo "PETR4" caiu -15.5% (R$ 1.234,56)');
      expect(result).toContain("Tipo: atencao");
    });
  });

  describe("SYSTEM_PROMPT_ENRIQUECER_ACAO", () => {
    it("Given the system prompt / Then should contain key instructions", () => {
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("recomendacaoEnriquecida");
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("fundamentacao");
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("JSON");
    });

    it("Given the system prompt / Then should contain non-directive language instructions", () => {
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("considere");
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("NUNCA");
    });

    it("Given the system prompt / Then should include character limits", () => {
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("500");
      expect(SYSTEM_PROMPT_ENRIQUECER_ACAO).toContain("300");
    });
  });
});
