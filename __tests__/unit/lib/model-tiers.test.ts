import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveModelId, DEFAULT_MODEL_TIER, MODEL_TIER_OPTIONS } from "@/lib/model-tiers";

describe("model-tiers", () => {
  describe("Given the model tier options", () => {
    it("Then every option has a non-empty label and description", () => {
      for (const option of MODEL_TIER_OPTIONS) {
        expect(option.label.length).toBeGreaterThan(0);
        expect(option.description.length).toBeGreaterThan(0);
      }
    });

    it("Then it contains exactly 'economic' and 'capable' tiers", () => {
      const values = MODEL_TIER_OPTIONS.map((o) => o.value);
      expect(values).toEqual(["economic", "capable"]);
    });
  });

  describe("Given the DEFAULT_MODEL_TIER", () => {
    it("Then it is 'economic'", () => {
      expect(DEFAULT_MODEL_TIER).toBe("economic");
    });
  });

  describe("resolveModelId", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.stubEnv("GEMINI_MODEL_ECONOMIC", "");
      vi.stubEnv("GEMINI_MODEL_CAPABLE", "");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      process.env = originalEnv;
    });

    describe("Given 'economic' tier with no env override", () => {
      it("Then it returns the Flash fallback model", () => {
        const result = resolveModelId("economic");
        expect(result).toBe("models/gemini-2.5-flash");
      });
    });

    describe("Given 'capable' tier with no env override", () => {
      it("Then it returns the Pro fallback model", () => {
        const result = resolveModelId("capable");
        expect(result).toBe("models/gemini-2.5-pro");
      });
    });

    describe("Given null tier", () => {
      it("Then it falls back to the default (economic) model", () => {
        const result = resolveModelId(null);
        expect(result).toBe("models/gemini-2.5-flash");
      });
    });

    describe("Given undefined tier", () => {
      it("Then it falls back to the default (economic) model", () => {
        const result = resolveModelId(undefined);
        expect(result).toBe("models/gemini-2.5-flash");
      });
    });

    describe("Given an unknown tier string", () => {
      it("Then it falls back to the default (economic) model", () => {
        const result = resolveModelId("unknown-tier");
        expect(result).toBe("models/gemini-2.5-flash");
      });
    });

    describe("Given 'economic' tier with env override", () => {
      it("Then it uses the env var value", () => {
        vi.stubEnv("GEMINI_MODEL_ECONOMIC", "models/gemini-3.0-flash");
        const result = resolveModelId("economic");
        expect(result).toBe("models/gemini-3.0-flash");
      });
    });

    describe("Given 'capable' tier with env override", () => {
      it("Then it uses the env var value", () => {
        vi.stubEnv("GEMINI_MODEL_CAPABLE", "models/gemini-3.0-pro");
        const result = resolveModelId("capable");
        expect(result).toBe("models/gemini-3.0-pro");
      });
    });
  });
});
