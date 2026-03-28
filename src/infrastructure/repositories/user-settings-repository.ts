import { db } from "@/lib/db";
import { configuracoesUsuario } from "@/lib/schema";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DbUserSettingsRepository implements UserSettingsRepository {
  async getUserSettings(
    userId: string,
  ): Promise<{
    identificador: string;
    usuarioId: string;
    claudeModelTier?: string;
    criadaEm: Date;
    atualizadaEm: Date;
  } | null> {
    const result = await db
      .select()
      .from(configuracoesUsuario)
      .where(eq(configuracoesUsuario.usuarioId, userId))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      identificador: row.identificador,
      usuarioId: row.usuarioId,
      claudeModelTier: row.modeloTierClaude ?? undefined,
      criadaEm: row.criadaEm,
      atualizadaEm: row.atualizadaEm,
    };
  }

  async updateClaudeModelTier(userId: string, tier: string): Promise<void> {
    const now = new Date();

    const existing = await db
      .select({ identificador: configuracoesUsuario.identificador })
      .from(configuracoesUsuario)
      .where(eq(configuracoesUsuario.usuarioId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(configuracoesUsuario)
        .set({ modeloTierClaude: tier, atualizadaEm: now })
        .where(eq(configuracoesUsuario.usuarioId, userId));
    } else {
      await db.insert(configuracoesUsuario).values({
        identificador: randomUUID(),
        usuarioId: userId,
        modeloTierClaude: tier,
        criadaEm: now,
        atualizadaEm: now,
      });
    }
  }
}
