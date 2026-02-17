import type { ConversaRepository } from "@/domain/interfaces/conversa-repository";
import type { Conversa, CriarConversa, AtualizarConversa } from "@/schemas/conversa.schema";
import { ConversaSchema } from "@/schemas/conversa.schema";
import { db } from "@/lib/db";
import { conversas } from "@/lib/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { FileStorageError } from "@/domain/errors/app-errors";

const LIMITE_CONVERSAS_POR_USUARIO = 100;

export class DbConversaRepository implements ConversaRepository {
  async salvarConversa(criarConversa: CriarConversa): Promise<Conversa> {
    const novaConversa: Conversa = {
      ...criarConversa,
      identificador: crypto.randomUUID(),
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString(),
    };

    await db.insert(conversas).values({
      identificador: novaConversa.identificador,
      usuarioId: novaConversa.usuarioId,
      titulo: novaConversa.titulo,
      identificadorPagina: novaConversa.identificadorPagina,
      mensagens: novaConversa.mensagens as unknown as Record<string, unknown>[],
      criadaEm: new Date(novaConversa.criadaEm),
      atualizadaEm: new Date(novaConversa.atualizadaEm),
    });

    await this.enforcarLimiteConversas(novaConversa.usuarioId);
    return novaConversa;
  }

  async obterConversaPorUsuario(
    usuarioId: string,
    identificador: string,
  ): Promise<Conversa | null> {
    const rows = await db
      .select()
      .from(conversas)
      .where(and(eq(conversas.usuarioId, usuarioId), eq(conversas.identificador, identificador)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapearConversa(rows[0]!);
  }

  async listarConversasDoUsuario(usuarioId: string): Promise<Conversa[]> {
    const rows = await db
      .select()
      .from(conversas)
      .where(eq(conversas.usuarioId, usuarioId))
      .orderBy(desc(conversas.atualizadaEm));

    return rows.map((row) => this.mapearConversa(row));
  }

  async atualizarConversa(
    usuarioId: string,
    identificador: string,
    atualizacao: AtualizarConversa,
  ): Promise<void> {
    const set: Partial<typeof conversas.$inferInsert> = {
      atualizadaEm: new Date(),
    };

    if (atualizacao.titulo !== undefined) {
      set.titulo = atualizacao.titulo;
    }
    if (atualizacao.mensagens !== undefined) {
      set.mensagens = atualizacao.mensagens as unknown as Record<string, unknown>[];
    }

    const resultado = await db
      .update(conversas)
      .set(set)
      .where(and(eq(conversas.usuarioId, usuarioId), eq(conversas.identificador, identificador)))
      .returning({ identificador: conversas.identificador });

    if (resultado.length === 0) {
      throw new FileStorageError(`Conversa nao encontrada: ${identificador}`);
    }
  }

  async removerConversa(usuarioId: string, identificador: string): Promise<void> {
    await db
      .delete(conversas)
      .where(and(eq(conversas.usuarioId, usuarioId), eq(conversas.identificador, identificador)));
  }

  private mapearConversa(row: typeof conversas.$inferSelect): Conversa {
    return ConversaSchema.parse({
      identificador: row.identificador,
      usuarioId: row.usuarioId,
      titulo: row.titulo,
      identificadorPagina: row.identificadorPagina,
      mensagens: row.mensagens,
      criadaEm: row.criadaEm.toISOString(),
      atualizadaEm: row.atualizadaEm.toISOString(),
    });
  }

  private async enforcarLimiteConversas(usuarioId: string): Promise<void> {
    const todasConversas = await db
      .select({ identificador: conversas.identificador })
      .from(conversas)
      .where(eq(conversas.usuarioId, usuarioId))
      .orderBy(asc(conversas.criadaEm));

    if (todasConversas.length > LIMITE_CONVERSAS_POR_USUARIO) {
      const idsParaRemover = todasConversas
        .slice(0, todasConversas.length - LIMITE_CONVERSAS_POR_USUARIO)
        .map((c) => c.identificador);

      for (const id of idsParaRemover) {
        await db.delete(conversas).where(eq(conversas.identificador, id));
      }
    }
  }
}
