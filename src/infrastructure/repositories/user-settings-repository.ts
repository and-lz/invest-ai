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

    const settings = {
      identificador: row.identificador,
      usuarioId: row.usuarioId,
      criadaEm: row.criadaEm,
      atualizadaEm: row.atualizadaEm,
    };

    // Descriptografa a chave se existir
    if (row.chaveApiGemini) {
      return {
        ...settings,
        geminiApiKey: decryptData(row.chaveApiGemini),
      };
    }

    return settings;
  }

  async updateGeminiApiKey(userId: string, geminiApiKey: string): Promise<void> {
    const encryptedKey = encryptData(geminiApiKey);
    const now = new Date();

    // Verifica se ja existe configuracao
    const existing = await db
      .select()
      .from(configuracoesUsuario)
      .where(eq(configuracoesUsuario.usuarioId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Atualiza
      await db
        .update(configuracoesUsuario)
        .set({
          chaveApiGemini: encryptedKey,
          atualizadaEm: now,
        })
        .where(eq(configuracoesUsuario.usuarioId, userId));
    } else {
      // Insere
      await db.insert(configuracoesUsuario).values({
        identificador: randomUUID(),
        usuarioId: userId,
        chaveApiGemini: encryptedKey,
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
