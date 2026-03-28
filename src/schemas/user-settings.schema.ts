import { z } from "zod";

// ============================================================
// Model Tier
// ============================================================

export const ModelTierSchema = z.enum(["economic", "capable"]);
export type ModelTierValue = z.infer<typeof ModelTierSchema>;

export const AiProviderSchema = z.enum(["gemini", "claude-proxy"]);
export type AiProviderValue = z.infer<typeof AiProviderSchema>;

export const ClaudeModelTierSchema = z.enum(["haiku", "sonnet", "opus"]);
export type ClaudeModelTierValue = z.infer<typeof ClaudeModelTierSchema>;

// ============================================================
// User Settings Schemas
// ============================================================

export const UpdateGeminiApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "API key is required"),
});

export type UpdateGeminiApiKey = z.infer<typeof UpdateGeminiApiKeySchema>;

export const UpdateUserSettingsSchema = z
  .object({
    geminiApiKey: z.string().min(1, "API key is required").optional(),
    modelTier: ModelTierSchema.optional(),
    aiProvider: AiProviderSchema.optional(),
    claudeModelTier: ClaudeModelTierSchema.optional(),
  })
  .refine(
    (data) =>
      data.geminiApiKey !== undefined ||
      data.modelTier !== undefined ||
      data.aiProvider !== undefined ||
      data.claudeModelTier !== undefined,
    { message: "At least one field is required" },
  );

export type UpdateUserSettings = z.infer<typeof UpdateUserSettingsSchema>;

export const TestGeminiApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "API key is required"),
});

export type TestGeminiApiKey = z.infer<typeof TestGeminiApiKeySchema>;

export const UserSettingsResponseSchema = z.object({
  identificador: z.string(),
  usuarioId: z.string(),
  geminiApiKeyConfigured: z.boolean().describe("Whether user has set a Gemini API key"),
  modelTier: ModelTierSchema.describe("Selected Gemini model tier"),
  aiProvider: AiProviderSchema.describe("Selected AI provider"),
  claudeModelTier: ClaudeModelTierSchema.describe("Selected Claude model tier"),
  criadaEm: z.date(),
  atualizadaEm: z.date(),
});

export type UserSettingsResponse = z.infer<typeof UserSettingsResponseSchema>;

export const TestGeminiKeyResponseSchema = z.object({
  valid: z.boolean(),
  message: z.string(),
});

export type TestGeminiKeyResponse = z.infer<typeof TestGeminiKeyResponseSchema>;

// ============================================================
// Key Health Check
// ============================================================

export const KeyHealthStatusSchema = z.enum([
  "healthy",
  "invalid",
  "quota_exhausted",
  "error",
  "not_configured",
]);

export type KeyHealthStatus = z.infer<typeof KeyHealthStatusSchema>;

export const KeyHealthResponseSchema = z.object({
  status: KeyHealthStatusSchema,
  message: z.string(),
});

export type KeyHealthResponse = z.infer<typeof KeyHealthResponseSchema>;
