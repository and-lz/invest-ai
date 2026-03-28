import { describe, it, expect } from "vitest";
import { resolveClaudeModelId, DEFAULT_CLAUDE_MODEL_TIER } from "@/lib/model-tiers";

describe("model-tiers", () => {
  describe("resolveClaudeModelId", () => {
    describe("known tiers", () => {
      it("Given tier = haiku → returns claude-haiku-4-5", () => {
        expect(resolveClaudeModelId("haiku")).toBe("claude-haiku-4-5");
      });

      it("Given tier = sonnet → returns claude-sonnet-4-5", () => {
        expect(resolveClaudeModelId("sonnet")).toBe("claude-sonnet-4-5");
      });

      it("Given tier = opus → returns claude-opus-4-6", () => {
        expect(resolveClaudeModelId("opus")).toBe("claude-opus-4-6");
      });
    });

    describe("fallback to default (sonnet)", () => {
      it("Given tier = null → returns claude-sonnet-4-5", () => {
        expect(resolveClaudeModelId(null)).toBe("claude-sonnet-4-5");
      });

      it("Given tier = undefined → returns claude-sonnet-4-5", () => {
        expect(resolveClaudeModelId(undefined)).toBe("claude-sonnet-4-5");
      });

      it("Given tier = unknown string → returns claude-sonnet-4-5", () => {
        expect(resolveClaudeModelId("gpt-4")).toBe("claude-sonnet-4-5");
      });

      it("Given tier = empty string → returns claude-sonnet-4-5", () => {
        expect(resolveClaudeModelId("")).toBe("claude-sonnet-4-5");
      });
    });

    describe("DEFAULT_CLAUDE_MODEL_TIER", () => {
      it("default tier resolves to claude-sonnet-4-5", () => {
        expect(resolveClaudeModelId(DEFAULT_CLAUDE_MODEL_TIER)).toBe("claude-sonnet-4-5");
      });
    });
  });
});
