import { db } from "@/lib/db";
import { configuracoesUsuario } from "@/lib/schema";
import { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { eq } from "drizzle-orm";
import { encryptData, decryptData } from "@/lib/encryption";
import { randomUUID } from "crypto";

export class DbUserSettingsRepository implements UserSettingsRepository {
  async getUserSettings(
    userId: string,
  ): Promise<{
    identificador: string;
    usuarioId: string;
    geminiApiKey?: string;
    modelTier?: string;
    criadaEm: Date;
    atualizadaEm: Date;
  } | null> {
    const result = await db
      .select()
      .from(configuracoesUsuario)
      .where(eq(configuracoesUsuario.usuarioId, userId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const row = result[0];
    if (!row) {
      return null;
    }

    const settings: {
      identificador: string;
      usuarioId: string;
      geminiApiKey?: string;
      modelTier?: string;
      criadaEm: Date;
      atualizadaEm: Date;
    } = {
      identificador: row.identificador,
      usuarioId: row.usuarioId,
      criadaEm: row.criadaEm,
      atualizadaEm: row.atualizadaEm,
    };

    if (row.chaveApiGemini) {
      settings.geminiApiKey = decryptData(row.chaveApiGemini);
    }

    if (row.modeloTier) {
      settings.modelTier = row.modeloTier;
    }

    return settings;
  }

  async updateGeminiApiKey(userId: string, geminiApiKey: string): Promise<void> {
    const encryptedKey = encryptData(geminiApiKey);
    const now = new Date();

    const existing = await db
      .select()
      .from(configuracoesUsuario)
      .where(eq(configuracoesUsuario.usuarioId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(configuracoesUsuario)
        .set({
          chaveApiGemini: encryptedKey,
          atualizadaEm: now,
        })
        .where(eq(configuracoesUsuario.usuarioId, userId));
    } else {
      await db.insert(configuracoesUsuario).values({
        identificador: randomUUID(),
        usuarioId: userId,
        chaveApiGemini: encryptedKey,
        criadaEm: now,
        atualizadaEm: now,
      });
    }
  }

  async updateModelTier(userId: string, modelTier: string): Promise<void> {
    const now = new Date();

    const existing = await db
      .select()
      .from(configuracoesUsuario)
      .where(eq(configuracoesUsuario.usuarioId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(configuracoesUsuario)
        .set({
          modeloTier: modelTier,
          atualizadaEm: now,
        })
        .where(eq(configuracoesUsuario.usuarioId, userId));
    } else {
      await db.insert(configuracoesUsuario).values({
        identificador: randomUUID(),
        usuarioId: userId,
        modeloTier: modelTier,
        criadaEm: now,
        atualizadaEm: now,
      });
    }
  }

  async deleteGeminiApiKey(userId: string): Promise<void> {
    const now = new Date();
    await db
      .update(configuracoesUsuario)
      .set({
        chaveApiGemini: null,
        atualizadaEm: now,
      })
      .where(eq(configuracoesUsuario.usuarioId, userId));
  }
}
