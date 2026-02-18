import type { PlanoAcaoRepository } from "@/domain/interfaces/action-plan-repository";
import type {
  ItemPlanoAcao,
  CriarItemPlano,
  EnriquecimentoAi,
  StatusItemPlano,
} from "@/schemas/action-plan.schema";
import { ItemPlanoAcaoSchema } from "@/schemas/action-plan.schema";
import { db } from "@/lib/db";
import { itensPlanoAcao } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { FileStorageError } from "@/domain/errors/app-errors";

export class DbPlanoAcaoRepository implements PlanoAcaoRepository {
  async salvarItem(
    usuarioId: string,
    item: CriarItemPlano,
    enriquecimento: EnriquecimentoAi | null,
  ): Promise<ItemPlanoAcao> {
    const novoItem: ItemPlanoAcao = {
      identificador: crypto.randomUUID(),
      usuarioId,
      textoOriginal: item.textoOriginal,
      tipoConclusao: item.tipoConclusao,
      origem: item.origem,
      recomendacaoEnriquecida: enriquecimento?.recomendacaoEnriquecida ?? null,
      fundamentacao: enriquecimento?.fundamentacao ?? null,
      ativosRelacionados: item.ativosRelacionados ?? [],
      status: "pendente",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      concluidoEm: null,
    };

    await db.insert(itensPlanoAcao).values({
      identificador: novoItem.identificador,
      usuarioId: novoItem.usuarioId,
      textoOriginal: novoItem.textoOriginal,
      tipoConclusao: novoItem.tipoConclusao,
      origem: novoItem.origem,
      recomendacaoEnriquecida: novoItem.recomendacaoEnriquecida,
      fundamentacao: novoItem.fundamentacao,
      ativosRelacionados: novoItem.ativosRelacionados as unknown as Record<string, unknown>[],
      status: novoItem.status,
      criadoEm: new Date(novoItem.criadoEm),
      atualizadoEm: new Date(novoItem.atualizadoEm),
      concluidoEm: null,
    });

    return novoItem;
  }

  async atualizarEnriquecimento(
    usuarioId: string,
    identificador: string,
    enriquecimento: EnriquecimentoAi,
  ): Promise<void> {
    await db
      .update(itensPlanoAcao)
      .set({
        recomendacaoEnriquecida: enriquecimento.recomendacaoEnriquecida,
        fundamentacao: enriquecimento.fundamentacao,
        atualizadoEm: new Date(),
      })
      .where(
        and(
          eq(itensPlanoAcao.usuarioId, usuarioId),
          eq(itensPlanoAcao.identificador, identificador),
        ),
      );
  }

  async listarItensDoUsuario(usuarioId: string): Promise<ItemPlanoAcao[]> {
    const rows = await db
      .select()
      .from(itensPlanoAcao)
      .where(eq(itensPlanoAcao.usuarioId, usuarioId))
      .orderBy(desc(itensPlanoAcao.criadoEm));

    return rows.map((row) => this.mapearItem(row));
  }

  async atualizarStatus(
    usuarioId: string,
    identificador: string,
    status: StatusItemPlano,
  ): Promise<void> {
    const set: Partial<typeof itensPlanoAcao.$inferInsert> = {
      status,
      atualizadoEm: new Date(),
      concluidoEm: status === "concluida" ? new Date() : null,
    };

    const resultado = await db
      .update(itensPlanoAcao)
      .set(set)
      .where(
        and(
          eq(itensPlanoAcao.usuarioId, usuarioId),
          eq(itensPlanoAcao.identificador, identificador),
        ),
      )
      .returning({ identificador: itensPlanoAcao.identificador });

    if (resultado.length === 0) {
      throw new FileStorageError(`Item do plano nao encontrado: ${identificador}`);
    }
  }

  async removerItem(usuarioId: string, identificador: string): Promise<void> {
    await db
      .delete(itensPlanoAcao)
      .where(
        and(
          eq(itensPlanoAcao.usuarioId, usuarioId),
          eq(itensPlanoAcao.identificador, identificador),
        ),
      );
  }

  async existeComTexto(usuarioId: string, textoOriginal: string): Promise<boolean> {
    const rows = await db
      .select({ identificador: itensPlanoAcao.identificador })
      .from(itensPlanoAcao)
      .where(
        and(
          eq(itensPlanoAcao.usuarioId, usuarioId),
          sql`lower(${itensPlanoAcao.textoOriginal}) = lower(${textoOriginal})`,
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  private mapearItem(row: typeof itensPlanoAcao.$inferSelect): ItemPlanoAcao {
    return ItemPlanoAcaoSchema.parse({
      identificador: row.identificador,
      usuarioId: row.usuarioId,
      textoOriginal: row.textoOriginal,
      tipoConclusao: row.tipoConclusao,
      origem: row.origem,
      recomendacaoEnriquecida: row.recomendacaoEnriquecida,
      fundamentacao: row.fundamentacao,
      ativosRelacionados: row.ativosRelacionados,
      status: row.status,
      criadoEm: row.criadoEm.toISOString(),
      atualizadoEm: row.atualizadoEm.toISOString(),
      concluidoEm: row.concluidoEm?.toISOString() ?? null,
    });
  }
}
