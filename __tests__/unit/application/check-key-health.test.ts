import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckKeyHealthUseCase } from "@/application/use-cases/check-key-health";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";

const { mockGenerateContent, mockGetGenerativeModel } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockGetGenerativeModel: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class MockGoogleGenerativeAI {
    getGenerativeModel(opts: { model: string }) {
      mockGetGenerativeModel(opts);
      return { generateContent: mockGenerateContent };
    }
  },
}));

function createMockRepository(settings: {
  geminiApiKey?: string;
  modelTier?: string;
} | null): UserSettingsRepository {
  return {
    getUserSettings: vi.fn().mockResolvedValue(
      settings
        ? {
            identificador: "test-id",
            usuarioId: "user-1",
            criadaEm: new Date(),
            atualizadaEm: new Date(),
            ...settings,
          }
        : null,
    ),
    updateGeminiApiKey: vi.fn(),
    updateModelTier: vi.fn(),
    deleteGeminiApiKey: vi.fn(),
  };
}

describe("CheckKeyHealthUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Given no API key is configured", () => {
    it("When health check runs, Then returns not_configured status", async () => {
      const repo = createMockRepository(null);
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("not_configured");
    });
  });

  describe("Given a key is configured but has no value", () => {
    it("When health check runs, Then returns not_configured status", async () => {
      const repo = createMockRepository({ modelTier: "economic" });
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("not_configured");
    });
  });

  describe("Given a valid API key", () => {
    it("When health check runs, Then returns healthy status", async () => {
      mockGenerateContent.mockResolvedValue({ response: { text: () => "ok" } });

      const repo = createMockRepository({ geminiApiKey: "valid-key-123" });
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("healthy");
      expect(result.message).toContain("funcionando");
    });
  });

  describe("Given an invalid API key (401)", () => {
    it("When health check runs, Then returns invalid status", async () => {
      mockGenerateContent.mockRejectedValue(new Error("401 Unauthorized - Invalid API Key"));

      const repo = createMockRepository({ geminiApiKey: "invalid-key" });
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("invalid");
      expect(result.message).toContain("inválida");
    });
  });

  describe("Given a key with exhausted quota", () => {
    it("When error contains 'Resource has been exhausted', Then returns generic error (ambiguous — could be rate limit)", async () => {
      mockGenerateContent.mockRejectedValue(new Error("Resource has been exhausted (e.g. check quota)."));

      const repo = createMockRepository({ geminiApiKey: "quota-exhausted-key" });
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("error");
    });

    it("When error contains 'quota exceeded', Then returns quota_exhausted", async () => {
      mockGenerateContent.mockRejectedValue(new Error("Quota exceeded for aiplatform.googleapis.com"));

      const repo = createMockRepository({ geminiApiKey: "quota-exceeded-key" });
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("quota_exhausted");
    });
  });

  describe("Given a key with 'capable' model tier", () => {
    it("When health check runs, Then uses the capable model ID", async () => {
      mockGenerateContent.mockResolvedValue({ response: { text: () => "ok" } });

      const repo = createMockRepository({ geminiApiKey: "valid-key", modelTier: "capable" });
      const useCase = new CheckKeyHealthUseCase(repo);

      await useCase.execute("user-1");

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({ model: "models/gemini-2.5-pro" }),
      );
    });
  });

  describe("Given a key with 'economic' model tier", () => {
    it("When health check runs, Then uses the economic model ID", async () => {
      mockGenerateContent.mockResolvedValue({ response: { text: () => "ok" } });

      const repo = createMockRepository({ geminiApiKey: "valid-key", modelTier: "economic" });
      const useCase = new CheckKeyHealthUseCase(repo);

      await useCase.execute("user-1");

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({ model: "models/gemini-2.5-flash" }),
      );
    });
  });

  describe("Given a key with no model tier set", () => {
    it("When health check runs, Then defaults to economic model", async () => {
      mockGenerateContent.mockResolvedValue({ response: { text: () => "ok" } });

      const repo = createMockRepository({ geminiApiKey: "valid-key" });
      const useCase = new CheckKeyHealthUseCase(repo);

      await useCase.execute("user-1");

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({ model: "models/gemini-2.5-flash" }),
      );
    });
  });

  describe("Given an unexpected error", () => {
    it("When health check fails with unknown error, Then returns error status", async () => {
      mockGenerateContent.mockRejectedValue(new Error("503 Service Unavailable"));

      const repo = createMockRepository({ geminiApiKey: "some-key" });
      const useCase = new CheckKeyHealthUseCase(repo);

      const result = await useCase.execute("user-1");

      expect(result.status).toBe("error");
      expect(result.message).toContain("503");
    });
  });
});
