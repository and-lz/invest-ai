import { z } from "zod/v4";
import { PapelMensagemChatEnum } from "./chat.schema";

/** Schema for a saved/bookmarked chat message */
export const SavedMessageSchema = z.object({
  identificador: z.string().uuid(),
  usuarioId: z.string(),
  conversaId: z.string().uuid(),
  tituloConversa: z.string(),
  mensagemId: z.string().uuid(),
  papel: PapelMensagemChatEnum,
  conteudo: z.string(),
  salvadaEm: z.string().datetime(),
});

/** Schema for creating a saved message (omits auto-generated fields) */
export const CreateSavedMessageSchema = SavedMessageSchema.omit({
  identificador: true,
  salvadaEm: true,
});

// ---- Inferred types ----

export type SavedMessage = z.infer<typeof SavedMessageSchema>;
export type CreateSavedMessage = z.infer<typeof CreateSavedMessageSchema>;
