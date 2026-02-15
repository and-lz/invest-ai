import { z } from "zod/v4";
import { MensagemChatSchema, IdentificadorPaginaEnum } from "./chat.schema";

/** Schema para uma conversa completa */
export const ConversaSchema = z.object({
  identificador: z.string().uuid(),
  usuarioId: z.string(),
  titulo: z.string().min(1).max(100),
  identificadorPagina: IdentificadorPaginaEnum,
  mensagens: z.array(MensagemChatSchema).max(100), // Limite de 100 mensagens por conversa
  criadaEm: z.string().datetime(),
  atualizadaEm: z.string().datetime(),
});

/** Indice de todas as conversas (single file storage) */
export const IndiceConversasSchema = z.object({
  conversas: z.array(ConversaSchema),
});

/** Schema para criação (omite campos gerados automaticamente) */
export const CriarConversaSchema = ConversaSchema.omit({
  identificador: true,
  criadaEm: true,
  atualizadaEm: true,
});

/** Schema para atualização parcial */
export const AtualizarConversaSchema = z.object({
  titulo: z.string().min(1).max(100).optional(),
  mensagens: z.array(MensagemChatSchema).max(100).optional(),
});

// ---- Tipos inferidos ----

export type Conversa = z.infer<typeof ConversaSchema>;
export type IndiceConversas = z.infer<typeof IndiceConversasSchema>;
export type CriarConversa = z.infer<typeof CriarConversaSchema>;
export type AtualizarConversa = z.infer<typeof AtualizarConversaSchema>;
