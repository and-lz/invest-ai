import { describe, it, expect } from "vitest";
import {
  formatarMoeda,
  formatarMoedaCompacta,
  somarMoney,
  subtrairMoney,
  centavosParaReais,
  reaisParaCentavos,
} from "@/domain/value-objects/money";

describe("Money value object", () => {
  describe("formatarMoeda", () => {
    it("deve formatar valor positivo em BRL", () => {
      expect(formatarMoeda(41533291)).toBe("R$\u00A0415.332,91");
    });

    it("deve formatar zero", () => {
      expect(formatarMoeda(0)).toBe("R$\u00A00,00");
    });

    it("deve formatar valor pequeno", () => {
      expect(formatarMoeda(100)).toBe("R$\u00A01,00");
    });

    it("deve formatar valor negativo", () => {
      expect(formatarMoeda(-551406)).toBe("-R$\u00A05.514,06");
    });
  });

  describe("formatarMoedaCompacta", () => {
    it("deve formatar valor acima de 1 milhao com M", () => {
      expect(formatarMoedaCompacta(150000000)).toBe("R$ 1.5M");
    });

    it("deve formatar valor acima de 1000 com k", () => {
      expect(formatarMoedaCompacta(41533291)).toBe("R$ 415.3k");
    });

    it("deve formatar valor pequeno normalmente", () => {
      expect(formatarMoedaCompacta(5000)).toBe("R$\u00A050,00");
    });
  });

  describe("somarMoney", () => {
    it("deve somar dois valores em centavos", () => {
      expect(somarMoney(1000, 2000)).toBe(3000);
    });
  });

  describe("subtrairMoney", () => {
    it("deve subtrair dois valores em centavos", () => {
      expect(subtrairMoney(3000, 1000)).toBe(2000);
    });
  });

  describe("centavosParaReais", () => {
    it("deve converter centavos para reais", () => {
      expect(centavosParaReais(41533291)).toBe(415332.91);
    });
  });

  describe("reaisParaCentavos", () => {
    it("deve converter reais para centavos", () => {
      expect(reaisParaCentavos(415332.91)).toBe(41533291);
    });

    it("deve arredondar corretamente", () => {
      expect(reaisParaCentavos(0.1 + 0.2)).toBe(30);
    });
  });
});
