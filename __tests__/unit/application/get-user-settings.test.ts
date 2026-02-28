import { describe, it, expect, vi } from "vitest";
import { GetUserSettingsUseCase } from "@/application/use-cases/get-user-settings";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { DEFAULT_MODEL_TIER } from "@/lib/model-tiers";

function createMockRepository(
  settings: {
    identificador?: string;
    usuarioId?: string;
    geminiApiKey?: string;
    modelTier?: string;
    criadaEm?: Date;
    atualizadaEm?: Date;
  } | null,
): UserSettingsRepository {
  return {
    getUserSettings: vi.fn().mockResolvedValue(settings),
    updateGeminiApiKey: vi.fn(),
    updateModelTier: vi.fn(),
    deleteGeminiApiKey: vi.fn(),
  };
}

describe("GetUserSettingsUseCase", () => {
  describe("Given user has no settings", () => {
    it("When executar is called, Then returns defaults with geminiApiKeyConfigured=false", async () => {
      const repo = createMockRepository(null);
      const useCase = new GetUserSettingsUseCase(repo);

      const result = await useCase.executar("user-1");

      expect(result.usuarioId).toBe("user-1");
      expect(result.geminiApiKeyConfigured).toBe(false);
      expect(result.modelTier).toBe(DEFAULT_MODEL_TIER);
      expect(result.identificador).toBe("");
    });
  });

  describe("Given user has settings with an API key", () => {
    it("When executar is called, Then returns geminiApiKeyConfigured=true", async () => {
      const now = new Date();
      const repo = createMockRepository({
        identificador: "settings-1",
        usuarioId: "user-1",
        geminiApiKey: "encrypted-key-abc",
        modelTier: "capable",
        criadaEm: now,
        atualizadaEm: now,
      });
      const useCase = new GetUserSettingsUseCase(repo);

      const result = await useCase.executar("user-1");

      expect(result.geminiApiKeyConfigured).toBe(true);
      expect(result.modelTier).toBe("capable");
      expect(result.identificador).toBe("settings-1");
    });
  });

  describe("Given user has settings WITHOUT an API key", () => {
    it("When executar is called, Then returns geminiApiKeyConfigured=false", async () => {
      const now = new Date();
      const repo = createMockRepository({
        identificador: "settings-2",
        usuarioId: "user-2",
        criadaEm: now,
        atualizadaEm: now,
      });
      const useCase = new GetUserSettingsUseCase(repo);

      const result = await useCase.executar("user-2");

      expect(result.geminiApiKeyConfigured).toBe(false);
      expect(result.modelTier).toBe(DEFAULT_MODEL_TIER);
    });
  });

  describe("Given user has settings without modelTier", () => {
    it("When executar is called, Then defaults to DEFAULT_MODEL_TIER", async () => {
      const now = new Date();
      const repo = createMockRepository({
        identificador: "settings-3",
        usuarioId: "user-3",
        geminiApiKey: "some-key",
        modelTier: undefined,
        criadaEm: now,
        atualizadaEm: now,
      });
      const useCase = new GetUserSettingsUseCase(repo);

      const result = await useCase.executar("user-3");

      expect(result.modelTier).toBe(DEFAULT_MODEL_TIER);
    });
  });
});
