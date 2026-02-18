import { describe, it, expect } from "vitest";
import {
  formatarPercentual,
  formatSimplePercentage,
  calculatePercentageChange,
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

  describe("formatSimplePercentage", () => {
    it("deve formatar com virgula e simbolo", () => {
      expect(formatSimplePercentage(14.56)).toBe("14,56%");
    });

    it("deve formatar zero", () => {
      expect(formatSimplePercentage(0)).toBe("0,00%");
    });

    it("deve formatar negativo", () => {
      expect(formatSimplePercentage(-6.14)).toBe("-6,14%");
    });
  });

  describe("calculatePercentageChange", () => {
    it("deve calcular variacao positiva", () => {
      const variacao = calculatePercentageChange(40445733, 41533291);
      expect(variacao).toBeCloseTo(2.69, 1);
    });

    it("deve calcular variacao negativa", () => {
      const variacao = calculatePercentageChange(41533291, 40445733);
      expect(variacao).toBeCloseTo(-2.62, 1);
    });

    it("deve retornar 0 quando valor anterior e zero", () => {
      expect(calculatePercentageChange(0, 100)).toBe(0);
    });
  });
});
