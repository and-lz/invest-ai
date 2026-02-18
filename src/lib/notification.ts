import { z } from "zod/v4";
import { db } from "@/lib/db";
import { notificacoes as tabelaNotificacoes } from "@/lib/schema";
import { eq, desc, asc } from "drizzle-orm";

export const TipoNotificacaoEnum = z.enum(["success", "error", "warning", "info"]);

export const NotificacaoSchema = z.object({
  identificador: z.string().uuid(),
  tipo: TipoNotificacaoEnum,
  titulo: z.string(),
  descricao: z.string().optional(),
  acao: z
    .object({
      rotulo: z.string(),
      url: z.string(),
    })
    .optional(),
  criadaEm: z.string().datetime(),
  visualizada: z.boolean().default(false),
});

// Schema para criação (omite campos gerados automaticamente)
export const CriarNotificacaoSchema = NotificacaoSchema.omit({
  identificador: true,
  criadaEm: true,
  visualizada: true,
});

export type Notificacao = z.infer<typeof NotificacaoSchema>;
export type CriarNotificacao = z.infer<typeof CriarNotificacaoSchema>;
export type TipoNotificacao = z.infer<typeof TipoNotificacaoEnum>;

// Mantido para retrocompatibilidade com código que importa este tipo
export const IndiceNotificacoesSchema = z.object({
  notificacoes: z.array(NotificacaoSchema),
});
export type IndiceNotificacoes = z.infer<typeof IndiceNotificacoesSchema>;

const LIMITE_NOTIFICACOES = 50;

export async function listNotifications(usuarioId: string): Promise<Notificacao[]> {
  try {
    const rows = await db
      .select()
      .from(tabelaNotificacoes)
      .where(eq(tabelaNotificacoes.usuarioId, usuarioId))
      .orderBy(desc(tabelaNotificacoes.criadaEm));

    return rows.map(mapearNotificacao);
  } catch (erro) {
    console.error("[Notificacoes] Erro ao listar:", erro);
    return [];
  }
}

export async function addNotification(
  usuarioId: string,
  novaNotificacao: CriarNotificacao,
): Promise<Notificacao> {
  const notificacaoCompleta: Notificacao = {
    ...novaNotificacao,
    identificador: crypto.randomUUID(),
    criadaEm: new Date().toISOString(),
    visualizada: false,
  };

  await db.insert(tabelaNotificacoes).values({
    identificador: notificacaoCompleta.identificador,
    usuarioId,
    tipo: notificacaoCompleta.tipo,
    titulo: notificacaoCompleta.titulo,
    descricao: notificacaoCompleta.descricao,
    acao: notificacaoCompleta.acao as Record<string, string> | undefined,
    visualizada: false,
    criadaEm: new Date(notificacaoCompleta.criadaEm),
  });

  // FIFO: remover notificações mais antigas se exceder o limite
  await enforcarLimiteNotificacoes(usuarioId);

  return notificacaoCompleta;
}

export async function marcarComoVisualizada(
  usuarioId: string,
  identificador: string,
): Promise<void> {
  await db
    .update(tabelaNotificacoes)
    .set({ visualizada: true })
    .where(
      eq(tabelaNotificacoes.identificador, identificador),
    );
}

export async function markAllAsRead(usuarioId: string): Promise<void> {
  await db
    .update(tabelaNotificacoes)
    .set({ visualizada: true })
    .where(eq(tabelaNotificacoes.usuarioId, usuarioId));
}

export async function clearAllNotifications(usuarioId: string): Promise<void> {
  await db
    .delete(tabelaNotificacoes)
    .where(eq(tabelaNotificacoes.usuarioId, usuarioId));
}

async function enforcarLimiteNotificacoes(usuarioId: string): Promise<void> {
  const todasNotificacoes = await db
    .select({ identificador: tabelaNotificacoes.identificador })
    .from(tabelaNotificacoes)
    .where(eq(tabelaNotificacoes.usuarioId, usuarioId))
    .orderBy(asc(tabelaNotificacoes.criadaEm));

  if (todasNotificacoes.length > LIMITE_NOTIFICACOES) {
    const idsParaRemover = todasNotificacoes
      .slice(0, todasNotificacoes.length - LIMITE_NOTIFICACOES)
      .map((n) => n.identificador);

    for (const id of idsParaRemover) {
      await db
        .delete(tabelaNotificacoes)
        .where(eq(tabelaNotificacoes.identificador, id));
    }
  }
}

function mapearNotificacao(row: typeof tabelaNotificacoes.$inferSelect): Notificacao {
  return NotificacaoSchema.parse({
    identificador: row.identificador,
    tipo: row.tipo,
    titulo: row.titulo,
    descricao: row.descricao ?? undefined,
    acao: row.acao ?? undefined,
    criadaEm: row.criadaEm.toISOString(),
    visualizada: row.visualizada,
  });
}
