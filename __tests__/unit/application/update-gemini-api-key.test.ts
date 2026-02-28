import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateGeminiApiKeyUseCase } from "@/application/use-cases/update-gemini-api-key";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { ZodError } from "zod";

// ========== Mock Repository ==========

function createMockRepository(): UserSettingsRepository {
  return {
    getUserSettings: vi.fn(),
    updateGeminiApiKey: vi.fn().mockResolvedValue(undefined),
    updateModelTier: vi.fn(),
    deleteGeminiApiKey: vi.fn(),
  };
}

// ========== Tests ==========

describe("UpdateGeminiApiKeyUseCase", () => {
  let repository: UserSettingsRepository;
  let useCase: UpdateGeminiApiKeyUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockRepository();
    useCase = new UpdateGeminiApiKeyUseCase(repository);
  });

  describe("Given a valid API key", () => {
    it("When executar is called, Then it delegates to the repository with correct args", async () => {
      // Given
      const userId = "google_123";
      const apiKey = "AIzaSyA-valid-key-1234567890";

      // When
      await useCase.executar(userId, apiKey);

      // Then
      expect(repository.updateGeminiApiKey).toHaveBeenCalledOnce();
      expect(repository.updateGeminiApiKey).toHaveBeenCalledWith(userId, apiKey);
    });

    it("When executar completes, Then it resolves without returning a value", async () => {
      // Given
      const userId = "google_456";
      const apiKey = "AIzaSyB-another-valid-key";

      // When
      const result = await useCase.executar(userId, apiKey);

      // Then
      expect(result).toBeUndefined();
    });
  });

  describe("Given an empty API key", () => {
    it("When executar is called, Then Zod throws a validation error", async () => {
      // Given
      const userId = "google_789";
      const emptyKey = "";

      // When / Then
      await expect(useCase.executar(userId, emptyKey)).rejects.toThrow(ZodError);
    });

    it("When validation fails, Then the repository is never called", async () => {
      // Given
      const userId = "google_789";
      const emptyKey = "";

      // When
      try {
        await useCase.executar(userId, emptyKey);
      } catch {
        // expected
      }

      // Then
      expect(repository.updateGeminiApiKey).not.toHaveBeenCalled();
    });
  });

  describe("Given the repository throws an error", () => {
    it("When executar is called, Then the error propagates to the caller", async () => {
      // Given
      const userId = "google_000";
      const apiKey = "AIzaSyC-some-key";
      vi.mocked(repository.updateGeminiApiKey).mockRejectedValue(
        new Error("Database connection failed"),
      );

      // When / Then
      await expect(useCase.executar(userId, apiKey)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
