import { z } from "zod";

// ============================================================
// Claude Model Tier
// ============================================================

export const ClaudeModelTierSchema = z.enum(["haiku", "sonnet", "opus"]);
export type ClaudeModelTierValue = z.infer<typeof ClaudeModelTierSchema>;

// ============================================================
// User Settings Schemas
// ============================================================

export const UpdateUserSettingsSchema = z.object({
  claudeModelTier: ClaudeModelTierSchema,
});

export type UpdateUserSettings = z.infer<typeof UpdateUserSettingsSchema>;

export const UserSettingsResponseSchema = z.object({
  identificador: z.string(),
  usuarioId: z.string(),
  claudeModelTier: ClaudeModelTierSchema.describe("Selected Claude model tier"),
  criadaEm: z.date(),
  atualizadaEm: z.date(),
});

export type UserSettingsResponse = z.infer<typeof UserSettingsResponseSchema>;
