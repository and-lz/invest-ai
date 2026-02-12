import { describe, it, expect } from "vitest";
import {
  formatarMesAno,
  formatarDataBrasileira,
  formatarTimestampBrasileiro,
  converterParaISO,
  obterMesAnterior,
  validarMesAno,
} from "@/lib/format-date";

describe("format-date utilities", () => {
  describe("formatarMesAno", () => {
    describe("formato extenso", () => {
      it("deve formatar dezembro de 2024", () => {
        expect(formatarMesAno("2024-12", "extenso")).toBe("dezembro de 2024");
      });

      it("deve formatar janeiro de 2024", () => {
        expect(formatarMesAno("2024-01", "extenso")).toBe("janeiro de 2024");
      });

      it("deve formatar junho de 2023", () => {
        expect(formatarMesAno("2023-06", "extenso")).toBe("junho de 2023");
      });

      it("deve usar extenso como padrão", () => {
        expect(formatarMesAno("2024-12")).toBe("dezembro de 2024");
      });
    });

    describe("formato abreviado", () => {
      it("deve formatar dezembro de 2024", () => {
        expect(formatarMesAno("2024-12", "abreviado")).toBe("dez/2024");
      });

      it("deve formatar janeiro de 2024", () => {
        expect(formatarMesAno("2024-01", "abreviado")).toBe("jan/2024");
      });

      it("deve formatar maio de 2023", () => {
        expect(formatarMesAno("2023-05", "abreviado")).toBe("mai/2023");
      });
    });

    describe("formato compacto", () => {
      it("deve formatar dezembro de 2024", () => {
        expect(formatarMesAno("2024-12", "compacto")).toBe("12/2024");
      });

      it("deve formatar janeiro de 2024", () => {
        expect(formatarMesAno("2024-01", "compacto")).toBe("01/2024");
      });

      it("deve preservar zero à esquerda", () => {
        expect(formatarMesAno("2023-03", "compacto")).toBe("03/2023");
      });
    });

    describe("validações", () => {
      it("deve lançar erro para mês 00", () => {
        expect(() => formatarMesAno("2024-00")).toThrow(
          "Mês inválido: 00"
        );
      });

      it("deve lançar erro para mês 13", () => {
        expect(() => formatarMesAno("2024-13")).toThrow(
          "Mês inválido: 13"
        );
      });

      it("deve lançar erro para formato inválido (sem hífen)", () => {
        expect(() => formatarMesAno("202412")).toThrow(
          "Formato inválido: 202412"
        );
      });

      it("deve lançar erro para formato inválido (mes ausente)", () => {
        expect(() => formatarMesAno("2024-")).toThrow("Formato inválido");
      });
    });
  });

  describe("formatarDataBrasileira", () => {
    it("deve formatar data no último dia do ano", () => {
      expect(formatarDataBrasileira("2024-12-31")).toBe("31/12/2024");
    });

    it("deve formatar data no primeiro dia do ano", () => {
      expect(formatarDataBrasileira("2024-01-01")).toBe("01/01/2024");
    });

    it("deve formatar data no meio do ano", () => {
      expect(formatarDataBrasileira("2023-06-15")).toBe("15/06/2023");
    });

    it("deve preservar zeros à esquerda", () => {
      expect(formatarDataBrasileira("2024-03-05")).toBe("05/03/2024");
    });
  });

  describe("formatarTimestampBrasileiro", () => {
    it("deve formatar timestamp com hora e minutos", () => {
      // UTC-3: 17:30 UTC → 14:30 local
      expect(formatarTimestampBrasileiro("2024-12-31T17:30:00Z")).toBe(
        "31/12/2024 às 14:30"
      );
    });

    it("deve formatar timestamp no início do dia", () => {
      // UTC-3: 03:00 UTC → 00:00 local
      expect(formatarTimestampBrasileiro("2024-12-31T03:00:00Z")).toBe(
        "31/12/2024 às 00:00"
      );
    });

    it("deve formatar timestamp no final do dia", () => {
      // UTC-3: 02:59 UTC → 23:59 local (previous day)
      expect(formatarTimestampBrasileiro("2025-01-01T02:59:00Z")).toBe(
        "31/12/2024 às 23:59"
      );
    });

    it("deve formatar primeiro dia do ano", () => {
      // UTC-3: 15:00 UTC → 12:00 local
      expect(formatarTimestampBrasileiro("2024-01-01T15:00:00Z")).toBe(
        "01/01/2024 às 12:00"
      );
    });

    it("deve preservar zeros à esquerda em hora e minuto", () => {
      // UTC-3: 08:03 UTC → 05:03 local
      expect(formatarTimestampBrasileiro("2024-06-05T08:03:00Z")).toBe(
        "05/06/2024 às 05:03"
      );
    });
  });

  describe("converterParaISO", () => {
    it("deve converter data brasileira para ISO", () => {
      expect(converterParaISO("31/12/2024")).toBe("2024-12-31");
    });

    it("deve converter primeira data do ano", () => {
      expect(converterParaISO("01/01/2024")).toBe("2024-01-01");
    });

    it("deve converter data no meio do ano", () => {
      expect(converterParaISO("15/06/2023")).toBe("2023-06-15");
    });

    it("deve preservar zeros à esquerda", () => {
      expect(converterParaISO("05/03/2024")).toBe("2024-03-05");
    });
  });

  describe("obterMesAnterior", () => {
    it("deve obter mês anterior em dezembro", () => {
      expect(obterMesAnterior("2024-12")).toBe("2024-11");
    });

    it("deve obter mês anterior em junho", () => {
      expect(obterMesAnterior("2024-06")).toBe("2024-05");
    });

    it("deve voltar para dezembro do ano anterior quando janeiro", () => {
      expect(obterMesAnterior("2024-01")).toBe("2023-12");
    });

    it("deve voltar para dezembro de 2022 quando janeiro de 2023", () => {
      expect(obterMesAnterior("2023-01")).toBe("2022-12");
    });

    it("deve preservar zero à esquerda", () => {
      expect(obterMesAnterior("2024-03")).toBe("2024-02");
    });

    it("deve preservar zero à esquerda para mês único", () => {
      expect(obterMesAnterior("2024-02")).toBe("2024-01");
    });
  });

  describe("validarMesAno", () => {
    it("deve validar formato correto YYYY-MM", () => {
      expect(validarMesAno("2024-12")).toBe(true);
    });

    it("deve validar janeiro", () => {
      expect(validarMesAno("2024-01")).toBe(true);
    });

    it("deve validar dezembro", () => {
      expect(validarMesAno("2024-12")).toBe(true);
    });

    it("deve validar ano futuro", () => {
      expect(validarMesAno("2025-06")).toBe(true);
    });

    it("deve validar ano passado", () => {
      expect(validarMesAno("2020-03")).toBe(true);
    });

    it("deve rejeitar mês 00", () => {
      expect(validarMesAno("2024-00")).toBe(false);
    });

    it("deve rejeitar mês 13", () => {
      expect(validarMesAno("2024-13")).toBe(false);
    });

    it("deve rejeitar formato sem hífen", () => {
      expect(validarMesAno("202412")).toBe(false);
    });

    it("deve rejeitar formato DD/MM/YYYY", () => {
      expect(validarMesAno("31/12/2024")).toBe(false);
    });

    it("deve rejeitar string vazia", () => {
      expect(validarMesAno("")).toBe(false);
    });

    it("deve rejeitar ano de dois dígitos", () => {
      expect(validarMesAno("24-12")).toBe(false);
    });

    it("deve rejeitar mês sem zero à esquerda", () => {
      expect(validarMesAno("2024-5")).toBe(false);
    });
  });

  describe("round-trip conversions", () => {
    it("deve converter de brasileiro para ISO e voltar", () => {
      const dataBrasileira = "15/06/2024";
      const iso = converterParaISO(dataBrasileira);
      const resultado = formatarDataBrasileira(iso);
      expect(resultado).toBe(dataBrasileira);
    });

    it("deve navegar vários meses para trás e validar", () => {
      let mesAno = "2024-06";
      expect(validarMesAno(mesAno)).toBe(true);

      mesAno = obterMesAnterior(mesAno); // 2024-05
      expect(mesAno).toBe("2024-05");
      expect(validarMesAno(mesAno)).toBe(true);

      mesAno = obterMesAnterior(mesAno); // 2024-04
      expect(mesAno).toBe("2024-04");
      expect(validarMesAno(mesAno)).toBe(true);
    });

    it("deve navegar através do ano bissexto", () => {
      let mesAno = "2024-01";
      const meses = [];

      for (let i = 0; i < 12; i++) {
        meses.push(mesAno);
        mesAno = obterMesAnterior(mesAno);
      }

      expect(meses[0]).toBe("2024-01");
      expect(meses[11]).toBe("2023-02");
      expect(meses.every((m) => validarMesAno(m))).toBe(true);
    });
  });
});
