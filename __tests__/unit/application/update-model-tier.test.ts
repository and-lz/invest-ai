import { describe, it, expect, vi } from "vitest";
import { UpdateModelTierUseCase } from "@/application/use-cases/update-model-tier";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";

function criarRepositorioMock(): UserSettingsRepository {
  return {
    getUserSettings: vi.fn(),
    updateGeminiApiKey: vi.fn(),
    updateModelTier: vi.fn(),
    deleteGeminiApiKey: vi.fn(),
  };
}

describe("UpdateModelTierUseCase", () => {
  describe("Given a valid tier 'economic'", () => {
    it("Then it calls updateModelTier on the repository", async () => {
      const repo = criarRepositorioMock();
      const useCase = new UpdateModelTierUseCase(repo);

      await useCase.executar("user-1", "economic");

      expect(repo.updateModelTier).toHaveBeenCalledWith("user-1", "economic");
    });
  });

  describe("Given a valid tier 'capable'", () => {
    it("Then it calls updateModelTier on the repository", async () => {
      const repo = criarRepositorioMock();
      const useCase = new UpdateModelTierUseCase(repo);

      await useCase.executar("user-1", "capable");

      expect(repo.updateModelTier).toHaveBeenCalledWith("user-1", "capable");
    });
  });

  describe("Given an invalid tier", () => {
    it("Then it throws a Zod validation error", async () => {
      const repo = criarRepositorioMock();
      const useCase = new UpdateModelTierUseCase(repo);

      await expect(useCase.executar("user-1", "invalid-tier")).rejects.toThrow();
      expect(repo.updateModelTier).not.toHaveBeenCalled();
    });
  });

  describe("Given an empty string tier", () => {
    it("Then it throws a Zod validation error", async () => {
      const repo = criarRepositorioMock();
      const useCase = new UpdateModelTierUseCase(repo);

      await expect(useCase.executar("user-1", "")).rejects.toThrow();
      expect(repo.updateModelTier).not.toHaveBeenCalled();
    });
  });
});
