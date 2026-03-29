import useSWR from "swr";
import { useCallback, useMemo } from "react";
import type { SavedMessage } from "@/schemas/saved-message.schema";

interface SavedMessagesApiResponse {
  savedMessages: SavedMessage[];
}

interface SaveMessageData {
  conversaId: string;
  tituloConversa: string;
  mensagemId: string;
  papel: "usuario" | "assistente";
  conteudo: string;
}

/**
 * SWR hook for saved/bookmarked chat messages.
 * Provides optimistic save/unsave and a Set for quick lookup.
 */
export function useSavedMessages() {
  const { data, error, isLoading, mutate } = useSWR<SavedMessagesApiResponse>(
    "/api/saved-messages",
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const savedMessages = useMemo(() => data?.savedMessages ?? [], [data?.savedMessages]);

  const savedMessageIds = useMemo(
    () => new Set(savedMessages.map((m) => m.mensagemId)),
    [savedMessages],
  );

  const saveMessage = useCallback(
    async (msg: SaveMessageData) => {
      const optimistic: SavedMessagesApiResponse = {
        savedMessages: [
          {
            identificador: crypto.randomUUID(),
            usuarioId: "",
            conversaId: msg.conversaId,
            tituloConversa: msg.tituloConversa,
            mensagemId: msg.mensagemId,
            papel: msg.papel,
            conteudo: msg.conteudo,
            salvadaEm: new Date().toISOString(),
          },
          ...savedMessages,
        ],
      };

      await mutate(
        async () => {
          const res = await fetch("/api/saved-messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(msg),
          });
          if (!res.ok) throw new Error(`Failed to save message: ${res.status}`);
          return undefined; // revalidate from server
        },
        { optimisticData: optimistic, rollbackOnError: true, revalidate: true },
      );
    },
    [mutate, savedMessages],
  );

  const unsaveMessage = useCallback(
    async (mensagemId: string) => {
      const optimistic: SavedMessagesApiResponse = {
        savedMessages: savedMessages.filter((m) => m.mensagemId !== mensagemId),
      };

      await mutate(
        async () => {
          const res = await fetch(`/api/saved-messages/${mensagemId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error(`Failed to unsave message: ${res.status}`);
          return undefined;
        },
        { optimisticData: optimistic, rollbackOnError: true, revalidate: true },
      );
    },
    [mutate, savedMessages],
  );

  return {
    savedMessages,
    savedMessageIds,
    isLoading,
    error: error as Error | undefined,
    saveMessage,
    unsaveMessage,
  };
}
