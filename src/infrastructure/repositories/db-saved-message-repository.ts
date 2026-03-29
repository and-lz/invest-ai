import type { SavedMessageRepository } from "@/domain/interfaces/saved-message-repository";
import type { SavedMessage, CreateSavedMessage } from "@/schemas/saved-message.schema";
import { SavedMessageSchema } from "@/schemas/saved-message.schema";
import { db } from "@/lib/db";
import { mensagensSalvas } from "@/lib/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export class DbSavedMessageRepository implements SavedMessageRepository {
  async save(data: CreateSavedMessage): Promise<SavedMessage> {
    const now = new Date();
    const id = crypto.randomUUID();

    const rows = await db
      .insert(mensagensSalvas)
      .values({
        identificador: id,
        usuarioId: data.usuarioId,
        conversaId: data.conversaId,
        tituloConversa: data.tituloConversa,
        mensagemId: data.mensagemId,
        papel: data.papel,
        conteudo: data.conteudo,
        salvadaEm: now,
      })
      .onConflictDoNothing()
      .returning();

    // If conflict (already saved), fetch the existing one
    if (rows.length === 0) {
      const existing = await db
        .select()
        .from(mensagensSalvas)
        .where(
          and(
            eq(mensagensSalvas.usuarioId, data.usuarioId),
            eq(mensagensSalvas.mensagemId, data.mensagemId),
          ),
        )
        .limit(1);

      return this.mapRow(existing[0]!);
    }

    return this.mapRow(rows[0]!);
  }

  async remove(usuarioId: string, mensagemId: string): Promise<void> {
    await db
      .delete(mensagensSalvas)
      .where(
        and(
          eq(mensagensSalvas.usuarioId, usuarioId),
          eq(mensagensSalvas.mensagemId, mensagemId),
        ),
      );
  }

  async list(usuarioId: string): Promise<SavedMessage[]> {
    const rows = await db
      .select()
      .from(mensagensSalvas)
      .where(eq(mensagensSalvas.usuarioId, usuarioId))
      .orderBy(desc(mensagensSalvas.salvadaEm));

    return rows.map((row) => this.mapRow(row));
  }

  async isSaved(usuarioId: string, mensagemIds: string[]): Promise<Set<string>> {
    if (mensagemIds.length === 0) return new Set();

    const rows = await db
      .select({ mensagemId: mensagensSalvas.mensagemId })
      .from(mensagensSalvas)
      .where(
        and(
          eq(mensagensSalvas.usuarioId, usuarioId),
          inArray(mensagensSalvas.mensagemId, mensagemIds),
        ),
      );

    return new Set(rows.map((r) => r.mensagemId));
  }

  private mapRow(row: typeof mensagensSalvas.$inferSelect): SavedMessage {
    return SavedMessageSchema.parse({
      identificador: row.identificador,
      usuarioId: row.usuarioId,
      conversaId: row.conversaId,
      tituloConversa: row.tituloConversa,
      mensagemId: row.mensagemId,
      papel: row.papel,
      conteudo: row.conteudo,
      salvadaEm: row.salvadaEm.toISOString(),
    });
  }
}
