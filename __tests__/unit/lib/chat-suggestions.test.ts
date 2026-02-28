import { describe, it, expect } from "vitest";
import {
  INITIAL_SUGGESTIONS,
  parseSuggestionsFromResponse,
  stripPartialSuggestionMarker,
} from "@/lib/chat-suggestions";
import { IdentificadorPaginaEnum } from "@/schemas/chat.schema";

describe("INITIAL_SUGGESTIONS", () => {
  const allPageIds = IdentificadorPaginaEnum.options;

  it("Given the suggestions registry, When checking all page identifiers, Then every IdentificadorPagina should have at least 1 suggestion", () => {
    for (const pageId of allPageIds) {
      const suggestions = INITIAL_SUGGESTIONS[pageId];
      expect(suggestions, `Missing suggestions for page "${pageId}"`).toBeDefined();
      expect(suggestions.length, `Empty suggestions for page "${pageId}"`).toBeGreaterThanOrEqual(1);
    }
  });

  it("Given all suggestion entries, When checking structure, Then each should have non-empty label and text", () => {
    for (const pageId of allPageIds) {
      for (const suggestion of INITIAL_SUGGESTIONS[pageId]) {
        expect(suggestion.label.length).toBeGreaterThan(0);
        expect(suggestion.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("Given all suggestion labels, When checking length, Then each should be at most 60 characters", () => {
    for (const pageId of allPageIds) {
      for (const suggestion of INITIAL_SUGGESTIONS[pageId]) {
        expect(
          suggestion.label.length,
          `Label too long for page "${pageId}": "${suggestion.label}"`,
        ).toBeLessThanOrEqual(60);
      }
    }
  });
});

describe("parseSuggestionsFromResponse", () => {
  it("Given a response with a SUGGESTIONS marker, When parsing, Then it should extract suggestions and clean the text", () => {
    const input =
      "Sua carteira esta boa.\n\n[SUGGESTIONS:Como diversificar?|Devo vender algo?|Compare com CDI]";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions[0]!.label).toBe("Como diversificar?");
    expect(result.suggestions[0]!.text).toBe("Como diversificar?");
    expect(result.suggestions[1]!.label).toBe("Devo vender algo?");
    expect(result.suggestions[2]!.label).toBe("Compare com CDI");
    expect(result.cleanText).toBe("Sua carteira esta boa.");
    expect(result.cleanText).not.toContain("[SUGGESTIONS:");
  });

  it("Given a response without SUGGESTIONS marker, When parsing, Then it should return empty suggestions and unchanged text", () => {
    const input = "Resposta normal sem sugestoes.";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(0);
    expect(result.cleanText).toBe(input);
  });

  it("Given a response with accented text in suggestions, When parsing, Then it should preserve accents and punctuation", () => {
    const input =
      "Analise completa.\n[SUGGESTIONS:Posicao em acoes?|Comparar com IPCA|Risco da carteira?]";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions[0]!.label).toBe("Posicao em acoes?");
    expect(result.suggestions[2]!.label).toBe("Risco da carteira?");
  });

  it("Given a response with empty pipe segments, When parsing, Then it should filter out empty strings", () => {
    const input = "Texto.\n[SUGGESTIONS:Sugestao 1||Sugestao 2|]";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(2);
    expect(result.suggestions[0]!.label).toBe("Sugestao 1");
    expect(result.suggestions[1]!.label).toBe("Sugestao 2");
  });

  it("Given a response with multiple SUGGESTIONS markers, When parsing, Then it should collect all suggestions", () => {
    const input = "Parte 1.\n[SUGGESTIONS:A|B]\nParte 2.\n[SUGGESTIONS:C|D]";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(4);
    expect(result.suggestions.map((s) => s.label)).toEqual(["A", "B", "C", "D"]);
  });

  it("Given an incomplete SUGGESTIONS marker (streaming), When parsing, Then it should not match and leave text unchanged", () => {
    const input = "Resposta parcial.\n[SUGGESTIONS:Como melho";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(0);
    expect(result.cleanText).toBe(input);
  });

  it("Given a response with whitespace around pipe segments, When parsing, Then it should trim each suggestion", () => {
    const input = "Texto.\n[SUGGESTIONS: Sugestao 1 | Sugestao 2 | Sugestao 3 ]";
    const result = parseSuggestionsFromResponse(input);

    expect(result.suggestions).toHaveLength(3);
    expect(result.suggestions[0]?.label).toBe("Sugestao 1");
    expect(result.suggestions[1]?.label).toBe("Sugestao 2");
    expect(result.suggestions[2]?.label).toBe("Sugestao 3");
  });
});

describe("stripPartialSuggestionMarker", () => {
  it("Given text with an incomplete marker at the end, When stripping, Then it should remove the partial marker", () => {
    const input = "Resposta parcial.\n[SUGGESTIONS:Como melho";
    const result = stripPartialSuggestionMarker(input);

    expect(result).toBe("Resposta parcial.");
  });

  it("Given text with a complete marker, When stripping, Then it should leave the text unchanged", () => {
    const input = "Texto.\n[SUGGESTIONS:A|B|C]";
    const result = stripPartialSuggestionMarker(input);

    expect(result).toBe(input);
  });

  it("Given text without any marker, When stripping, Then it should leave the text unchanged", () => {
    const input = "Texto normal sem marcadores.";
    const result = stripPartialSuggestionMarker(input);

    expect(result).toBe(input);
  });

  it("Given text with only a partial opening bracket, When stripping, Then it should remove it", () => {
    const input = "Texto.\n[SUGGESTIONS:";
    const result = stripPartialSuggestionMarker(input);

    expect(result).toBe("Texto.");
  });
});
