import { describe, it, expect } from "vitest";
import {
  formatarPercentual,
  formatarPercentualSimples,
  calcularVariacaoPercentual,
} from "@/domain/value-objects/percentage";

describe("Percentage value object", () => {
  describe("formatarPercentual", () => {
    it("deve formatar percentual positivo", () => {
      expect(formatarPercentual(14.56)).toBe("14,56%");
    });

    it("deve formatar zero", () => {
      expect(formatarPercentual(0)).toBe("0,00%");
    });

    it("deve formatar percentual negativo", () => {
      expect(formatarPercentual(-3.21)).toBe("-3,21%");
    });
  });

  describe("formatarPercentualSimples", () => {
    it("deve formatar com virgula e simbolo", () => {
      expect(formatarPercentualSimples(14.56)).toBe("14,56%");
    });

    it("deve formatar zero", () => {
      expect(formatarPercentualSimples(0)).toBe("0,00%");
    });

    it("deve formatar negativo", () => {
      expect(formatarPercentualSimples(-6.14)).toBe("-6,14%");
    });
  });

  describe("calcularVariacaoPercentual", () => {
    it("deve calcular variacao positiva", () => {
      const variacao = calcularVariacaoPercentual(40445733, 41533291);
      expect(variacao).toBeCloseTo(2.69, 1);
    });

    it("deve calcular variacao negativa", () => {
      const variacao = calcularVariacaoPercentual(41533291, 40445733);
      expect(variacao).toBeCloseTo(-2.62, 1);
    });

    it("deve retornar 0 quando valor anterior e zero", () => {
      expect(calcularVariacaoPercentual(0, 100)).toBe(0);
    });
  });
});
