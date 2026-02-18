import { describe, it, expect } from "vitest";
import { stripMarkdown } from "@/lib/strip-markdown";

describe("stripMarkdown", () => {
  describe("Given bold and italic formatting", () => {
    it("When stripping **bold**, Then returns plain text", () => {
      expect(stripMarkdown("This is **bold** text")).toBe("This is bold text");
    });

    it("When stripping *italic*, Then returns plain text", () => {
      expect(stripMarkdown("This is *italic* text")).toBe("This is italic text");
    });

    it("When stripping __bold__ underscores, Then returns plain text", () => {
      expect(stripMarkdown("This is __bold__ text")).toBe("This is bold text");
    });

    it("When stripping ~~strikethrough~~, Then returns plain text", () => {
      expect(stripMarkdown("This is ~~removed~~ text")).toBe("This is removed text");
    });
  });

  describe("Given markdown links and images", () => {
    it("When stripping [text](url), Then keeps text only", () => {
      expect(stripMarkdown("[click here](https://example.com)")).toBe("click here");
    });

    it("When stripping ![alt](url), Then keeps alt text only", () => {
      expect(stripMarkdown("![chart screenshot](https://img.com/a.png)")).toBe("chart screenshot");
    });
  });

  describe("Given code blocks", () => {
    it("When stripping fenced code blocks, Then removes entirely", () => {
      const input = "Before\n```js\nconsole.log('hello')\n```\nAfter";
      expect(stripMarkdown(input)).toBe("Before\n\nAfter");
    });

    it("When stripping inline code, Then keeps the text", () => {
      expect(stripMarkdown("Use `PETR4` para consultar")).toBe("Use PETR4 para consultar");
    });
  });

  describe("Given heading markers", () => {
    it("When stripping ## heading, Then removes markers", () => {
      expect(stripMarkdown("## Section Title")).toBe("Section Title");
    });

    it("When stripping multiple heading levels, Then removes all markers", () => {
      const input = "# H1\n## H2\n### H3";
      expect(stripMarkdown(input)).toBe("H1\nH2\nH3");
    });
  });

  describe("Given list markers", () => {
    it("When stripping unordered list, Then removes bullets", () => {
      expect(stripMarkdown("- item 1\n- item 2")).toBe("item 1\nitem 2");
    });

    it("When stripping ordered list, Then removes numbers", () => {
      expect(stripMarkdown("1. first\n2. second")).toBe("first\nsecond");
    });
  });

  describe("Given blockquotes", () => {
    it("When stripping > markers, Then removes them", () => {
      expect(stripMarkdown("> This is a quote")).toBe("This is a quote");
    });
  });

  describe("Given horizontal rules", () => {
    it("When stripping ---, Then removes the line", () => {
      expect(stripMarkdown("Above\n---\nBelow")).toBe("Above\n\nBelow");
    });
  });

  describe("Given edge cases", () => {
    it("When stripping empty string, Then returns empty string", () => {
      expect(stripMarkdown("")).toBe("");
    });

    it("When stripping plain text, Then returns unchanged", () => {
      expect(stripMarkdown("plain text with no formatting")).toBe("plain text with no formatting");
    });

    it("When stripping mixed markdown, Then handles all formats together", () => {
      const input = "## Title\n\n**Bold** and [link](http://x.com)\n\n- item";
      const expected = "Title\n\nBold and link\nitem";
      expect(stripMarkdown(input)).toBe(expected);
    });
  });
});
