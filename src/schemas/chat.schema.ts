import { z } from "zod/v4";

/** Papeis possiveis de uma mensagem no chat */
export const PapelMensagemChatEnum = z.enum(["usuario", "assistente"]);

/** Mensagem individual no chat (estado do cliente) */
export const MensagemChatSchema = z.object({
  identificador: z.string().uuid(),
  papel: PapelMensagemChatEnum,
  conteudo: z.string(),
  criadaEm: z.string().datetime(),
});

/** Paginas disponiveis no app para contexto do chat */
export const IdentificadorPaginaEnum = z.enum([
  "dashboard",
  "reports",
  "insights",
  "trends",
  "desempenho",
  "aprender",
]);

/** Mensagem compacta enviada ao servidor (sem metadata de UI) */
export const MensagemParaServidorSchema = z.object({
  papel: PapelMensagemChatEnum,
  conteudo: z.string().min(1).max(4000),
});

/** Requisicao POST /api/chat */
export const RequisicaoChatSchema = z.object({
  mensagens: z.array(MensagemParaServidorSchema).min(1).max(40),
  contextoPagina: z.string().max(50000).optional(),
  identificadorPagina: IdentificadorPaginaEnum,
});

// ---- Tipos inferidos ----

export type MensagemChat = z.infer<typeof MensagemChatSchema>;
export type IdentificadorPagina = z.infer<typeof IdentificadorPaginaEnum>;
export type MensagemParaServidor = z.infer<typeof MensagemParaServidorSchema>;
export type RequisicaoChat = z.infer<typeof RequisicaoChatSchema>;
