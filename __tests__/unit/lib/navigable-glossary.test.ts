import { describe, it, expect } from "vitest";
import {
  TODOS_TERMOS,
  buscarTermos,
  agruparPorLetra,
  agruparPorCategoria,
  buscarTermoPorSlug,
  ESTATISTICAS_GLOSSARIO,
  NOMES_CATEGORIAS,
} from "@/lib/navigable-glossary";

describe("navigable-glossary utilities", () => {
  describe("TODOS_TERMOS", () => {
    describe("Given the parsed glossary terms", () => {
      it("When checking the array, Then it is non-empty", () => {
        expect(TODOS_TERMOS.length).toBeGreaterThan(0);
      });

      it("When inspecting each term, Then every term has slug, categoria, termo, and explicacao", () => {
        for (const term of TODOS_TERMOS) {
          expect(typeof term.slug).toBe("string");
          expect(term.slug.length).toBeGreaterThan(0);

          expect(typeof term.categoria).toBe("string");
          expect(term.categoria.length).toBeGreaterThan(0);

          expect(typeof term.termo).toBe("string");
          expect(term.termo.length).toBeGreaterThan(0);

          expect(typeof term.explicacao).toBe("string");
          expect(term.explicacao.length).toBeGreaterThan(0);
        }
      });

      it("When checking slugs, Then all slugs are lowercase without accents", () => {
        for (const term of TODOS_TERMOS) {
          // Slugs are derived from glossary keys and may contain spaces from record sub-keys
          expect(term.slug).toBe(term.slug.toLowerCase());
          // No accented characters
          expect(term.slug).toBe(
            term.slug.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          );
        }
      });

      it("When checking sort order, Then terms are sorted alphabetically by termo", () => {
        for (let i = 1; i < TODOS_TERMOS.length; i++) {
          const comparison = TODOS_TERMOS[i - 1]!.termo.localeCompare(
            TODOS_TERMOS[i]!.termo,
            "pt-BR",
          );
          expect(comparison).toBeLessThanOrEqual(0);
        }
      });
    });
  });

  describe("buscarTermos", () => {
    describe("Given an empty search query", () => {
      it("When searching with empty string, Then returns all terms", () => {
        const result = buscarTermos("");

        expect(result).toBe(TODOS_TERMOS);
      });

      it("When searching with whitespace-only string, Then returns all terms", () => {
        const result = buscarTermos("   ");

        expect(result).toBe(TODOS_TERMOS);
      });
    });

    describe("Given a query that matches known terms", () => {
      it("When searching for 'CDI', Then returns a non-empty subset", () => {
        const result = buscarTermos("CDI");

        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThan(TODOS_TERMOS.length);
      });

      it("When searching for a term, Then every result contains the query in termo or explicacao", () => {
        const query = "patrimonio";
        const result = buscarTermos(query);

        for (const term of result) {
          const termoLower = term.termo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const explicacaoLower = term.explicacao.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          expect(
            termoLower.includes(query) || explicacaoLower.includes(query),
          ).toBe(true);
        }
      });
    });

    describe("Given a query with accents", () => {
      it("When searching with accented characters, Then matches accent-insensitively", () => {
        const withAccent = buscarTermos("patrimônio");
        const withoutAccent = buscarTermos("patrimonio");

        expect(withAccent.length).toBe(withoutAccent.length);
      });
    });

    describe("Given a query that matches nothing", () => {
      it("When searching for a nonsense string, Then returns an empty array", () => {
        const result = buscarTermos("xyzzyplughfoo123");

        expect(result).toEqual([]);
      });
    });

    describe("Given a case-insensitive search", () => {
      it("When searching with different casing, Then returns the same results", () => {
        const upper = buscarTermos("CDI");
        const lower = buscarTermos("cdi");

        expect(upper.length).toBe(lower.length);
      });
    });
  });

  describe("agruparPorLetra", () => {
    describe("Given the alphabetical grouping function", () => {
      it("When called, Then returns a Map", () => {
        const result = agruparPorLetra();

        expect(result).toBeInstanceOf(Map);
      });

      it("When inspecting keys, Then all keys are single uppercase characters", () => {
        const result = agruparPorLetra();

        for (const key of result.keys()) {
          expect(key.length).toBe(1);
          expect(key).toBe(key.toUpperCase());
        }
      });

      it("When summing all groups, Then the total equals the number of terms", () => {
        const result = agruparPorLetra();

        let total = 0;
        for (const terms of result.values()) {
          total += terms.length;
        }

        expect(total).toBe(TODOS_TERMOS.length);
      });

      it("When checking each group, Then every term in the group starts with that letter", () => {
        const result = agruparPorLetra();

        for (const [letter, terms] of result) {
          for (const term of terms) {
            expect(term.termo[0]?.toUpperCase()).toBe(letter);
          }
        }
      });
    });
  });

  describe("agruparPorCategoria", () => {
    describe("Given the category grouping function", () => {
      it("When called, Then returns a Map", () => {
        const result = agruparPorCategoria();

        expect(result).toBeInstanceOf(Map);
      });

      it("When inspecting the result, Then it has at least one category", () => {
        const result = agruparPorCategoria();

        expect(result.size).toBeGreaterThan(0);
      });

      it("When summing all groups, Then the total equals the number of terms", () => {
        const result = agruparPorCategoria();

        let total = 0;
        for (const terms of result.values()) {
          total += terms.length;
        }

        expect(total).toBe(TODOS_TERMOS.length);
      });

      it("When checking each group, Then every term in the group has the correct categoria", () => {
        const result = agruparPorCategoria();

        for (const [category, terms] of result) {
          for (const term of terms) {
            expect(term.categoria).toBe(category);
          }
        }
      });

      it("When inspecting category keys, Then known categories are present", () => {
        const result = agruparPorCategoria();
        const keys = Array.from(result.keys());

        // At least some well-known categories should be present
        const knownCategories = ["benchmarks", "estrategias", "eventos-financeiros"];
        for (const known of knownCategories) {
          expect(keys).toContain(known);
        }
      });
    });
  });

  describe("buscarTermoPorSlug", () => {
    describe("Given a known slug from the glossary", () => {
      it("When searching with a valid slug, Then returns the matching term", () => {
        const firstTerm = TODOS_TERMOS[0]!;
        const result = buscarTermoPorSlug(firstTerm.slug);

        expect(result).toBeDefined();
        expect(result?.slug).toBe(firstTerm.slug);
        expect(result?.termo).toBe(firstTerm.termo);
      });
    });

    describe("Given an unknown slug", () => {
      it("When searching with a nonexistent slug, Then returns undefined", () => {
        const result = buscarTermoPorSlug("this-slug-does-not-exist-at-all");

        expect(result).toBeUndefined();
      });
    });

    describe("Given an empty slug", () => {
      it("When searching with an empty string, Then returns undefined", () => {
        const result = buscarTermoPorSlug("");

        expect(result).toBeUndefined();
      });
    });
  });

  describe("ESTATISTICAS_GLOSSARIO", () => {
    describe("Given the glossary statistics", () => {
      it("When checking totalTermos, Then it is a positive number matching TODOS_TERMOS length", () => {
        expect(ESTATISTICAS_GLOSSARIO.totalTermos).toBeGreaterThan(0);
        expect(ESTATISTICAS_GLOSSARIO.totalTermos).toBe(TODOS_TERMOS.length);
      });

      it("When checking totalCategorias, Then it is a positive number", () => {
        expect(ESTATISTICAS_GLOSSARIO.totalCategorias).toBeGreaterThan(0);
      });

      it("When checking totalLetras, Then it is a positive number", () => {
        expect(ESTATISTICAS_GLOSSARIO.totalLetras).toBeGreaterThan(0);
      });

      it("When comparing totalCategorias with agruparPorCategoria, Then they match", () => {
        const categorias = agruparPorCategoria();

        expect(ESTATISTICAS_GLOSSARIO.totalCategorias).toBe(categorias.size);
      });

      it("When comparing totalLetras with agruparPorLetra, Then they match", () => {
        const letras = agruparPorLetra();

        expect(ESTATISTICAS_GLOSSARIO.totalLetras).toBe(letras.size);
      });
    });
  });

  describe("NOMES_CATEGORIAS", () => {
    describe("Given the category display names mapping", () => {
      it("When checking known categories, Then they have friendly Portuguese names", () => {
        const expectedCategories: Record<string, string> = {
          patrimonio: "Patrimônio e Saldo",
          rentabilidade: "Rentabilidade e Ganhos",
          alocacao: "Alocação de Ativos",
          benchmarks: "Benchmarks e Índices",
          estrategias: "Estratégias de Investimento",
          "eventos-financeiros": "Eventos Financeiros",
          risco: "Risco e Volatilidade",
          liquidez: "Liquidez",
          mercado: "Mercado e Tendências",
          periodos: "Períodos de Análise",
          geral: "Geral",
        };

        for (const [key, name] of Object.entries(expectedCategories)) {
          expect(NOMES_CATEGORIAS).toHaveProperty(key);
          expect(NOMES_CATEGORIAS[key]).toBe(name);
        }
      });

      it("When checking against agruparPorCategoria keys, Then every category has a friendly name", () => {
        const categorias = agruparPorCategoria();

        for (const category of categorias.keys()) {
          expect(NOMES_CATEGORIAS).toHaveProperty(category);
          expect(typeof NOMES_CATEGORIAS[category]).toBe("string");
        }
      });
    });
  });
});
