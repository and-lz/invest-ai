import { describe, it, expect } from "vitest";
import { formatarFontesGrounding } from "@/lib/format-grounding-sources";
import type { GroundingMetadata } from "@google/generative-ai";

describe("formatarFontesGrounding", () => {
  describe("Given undefined or empty metadata", () => {
    it("When metadata is undefined, Then returns null", () => {
      expect(formatarFontesGrounding(undefined)).toBeNull();
    });

    it("When groundingChunks is empty, Then returns null", () => {
      const metadata: GroundingMetadata = {
        groundingChunks: [],
        webSearchQueries: [],
      };
      expect(formatarFontesGrounding(metadata)).toBeNull();
    });

    it("When groundingChunks is undefined, Then returns null", () => {
      const metadata: GroundingMetadata = {
        webSearchQueries: ["test"],
      };
      expect(formatarFontesGrounding(metadata)).toBeNull();
    });
  });

  describe("Given valid grounding chunks", () => {
    it("When chunks have uri and title, Then formats as markdown links", () => {
      const metadata: GroundingMetadata = {
        groundingChunks: [
          { web: { uri: "https://example.com/article", title: "Market News" } },
          { web: { uri: "https://finance.com/stocks", title: "Stock Prices" } },
        ],
        webSearchQueries: ["market news today"],
      };

      const result = formatarFontesGrounding(metadata);

      expect(result).toContain("**Fontes:**");
      expect(result).toContain("- [Market News](https://example.com/article)");
      expect(result).toContain("- [Stock Prices](https://finance.com/stocks)");
      expect(result).toMatch(/^\n\n---\n/);
    });

    it("When a single chunk is valid, Then formats single source", () => {
      const metadata: GroundingMetadata = {
        groundingChunks: [
          { web: { uri: "https://example.com", title: "Example" } },
        ],
        webSearchQueries: [],
      };

      const result = formatarFontesGrounding(metadata);

      expect(result).toContain("- [Example](https://example.com)");
      expect(result).toContain("**Fontes:**");
    });
  });

  describe("Given partially valid chunks", () => {
    it("When some chunks are missing uri, Then filters them out", () => {
      const metadata: GroundingMetadata = {
        groundingChunks: [
          { web: { uri: "https://valid.com", title: "Valid Source" } },
          { web: { title: "Missing URI" } },
          { web: { uri: "https://also-valid.com", title: "Also Valid" } },
        ],
        webSearchQueries: [],
      };

      const result = formatarFontesGrounding(metadata);

      expect(result).toContain("- [Valid Source](https://valid.com)");
      expect(result).toContain("- [Also Valid](https://also-valid.com)");
      expect(result).not.toContain("Missing URI");
    });

    it("When some chunks are missing title, Then filters them out", () => {
      const metadata: GroundingMetadata = {
        groundingChunks: [
          { web: { uri: "https://no-title.com" } },
          { web: { uri: "https://valid.com", title: "Has Title" } },
        ],
        webSearchQueries: [],
      };

      const result = formatarFontesGrounding(metadata);

      expect(result).toContain("- [Has Title](https://valid.com)");
      expect(result).not.toContain("no-title.com");
    });

    it("When all chunks are invalid, Then returns null", () => {
      const metadata: GroundingMetadata = {
        groundingChunks: [
          { web: { title: "No URI" } },
          { web: { uri: "https://no-title.com" } },
          {},
        ],
        webSearchQueries: [],
      };

      expect(formatarFontesGrounding(metadata)).toBeNull();
    });
  });
});
