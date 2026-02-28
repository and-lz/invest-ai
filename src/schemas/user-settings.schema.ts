import { z } from "zod";

// ============================================================
// User Settings Schemas
// ============================================================

export const UpdateGeminiApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "API key is required"),
});

export type UpdateGeminiApiKey = z.infer<typeof UpdateGeminiApiKeySchema>;

export const TestGeminiApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "API key is required"),
});

export type TestGeminiApiKey = z.infer<typeof TestGeminiApiKeySchema>;

export const UserSettingsResponseSchema = z.object({
  identificador: z.string(),
  usuarioId: z.string(),
  geminiApiKeyConfigured: z.boolean().describe("Whether user has set a Gemini API key"),
  criadaEm: z.date(),
  atualizadaEm: z.date(),
});

export type UserSettingsResponse = z.infer<typeof UserSettingsResponseSchema>;

export const TestGeminiKeyResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string(),
});

export type TestGeminiKeyResponse = z.infer<typeof TestGeminiKeyResponseSchema>;
