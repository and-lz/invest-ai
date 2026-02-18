import useSWR from "swr";
import { useCallback, useEffect, useMemo } from "react";
import type { Notificacao } from "@/lib/notification";

interface NotificacoesApiResponse {
  notificacoes: Notificacao[];
}

const NOTIFICATION_CREATED_EVENT = "notificacao-criada";

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR<NotificacoesApiResponse>("/api/notifications", {
    refreshInterval: 30_000, // Polling lento como fallback (30s)
    revalidateOnFocus: true,
  });

  // Revalida imediatamente quando uma nova notificação é criada (via notificar.ts)
  useEffect(() => {
    const handleNotificacaoCriada = () => {
      void mutate();
    };

    window.addEventListener(NOTIFICATION_CREATED_EVENT, handleNotificacaoCriada);
    return () => window.removeEventListener(NOTIFICATION_CREATED_EVENT, handleNotificacaoCriada);
  }, [mutate]);

  const notificacoes = useMemo(() => data?.notificacoes ?? [], [data?.notificacoes]);
  const naoVisualizadas = useMemo(
    () => notificacoes.filter((notificacao) => !notificacao.visualizada),
    [notificacoes],
  );

  const marcarComoLida = useCallback(
    async (identificador: string) => {
      // Optimistic update: marca como lida imediatamente na UI
      const dadosOtimistas: NotificacoesApiResponse = {
        notificacoes: notificacoes.map((notificacao) =>
          notificacao.identificador === identificador
            ? { ...notificacao, visualizada: true }
            : notificacao,
        ),
      };

      try {
        await mutate(
          async () => {
            const resposta = await fetch(`/api/notifications/${identificador}`, {
              method: "PATCH",
            });
            if (!resposta.ok) {
              throw new Error(`Erro ao marcar notificacao: ${resposta.status}`);
            }
            return dadosOtimistas;
          },
          {
            optimisticData: dadosOtimistas,
            rollbackOnError: true,
            revalidate: false,
          },
        );
      } catch (erro) {
        console.error("Erro ao marcar notificacao como lida:", erro);
      }
    },
    [mutate, notificacoes],
  );

  const marcarTodasComoLidas = useCallback(async () => {
    const dadosOtimistas: NotificacoesApiResponse = {
      notificacoes: notificacoes.map((notificacao) => ({
        ...notificacao,
        visualizada: true,
      })),
    };

    try {
      await mutate(
        async () => {
          const resposta = await fetch("/api/notifications/mark-all-read", {
            method: "PATCH",
          });
          if (!resposta.ok) {
            throw new Error(`Erro ao marcar todas: ${resposta.status}`);
          }
          return dadosOtimistas;
        },
        {
          optimisticData: dadosOtimistas,
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (erro) {
      console.error("Erro ao marcar todas notificacoes como lidas:", erro);
    }
  }, [mutate, notificacoes]);

  const limparTodas = useCallback(async () => {
    const dadosOtimistas: NotificacoesApiResponse = { notificacoes: [] };

    try {
      await mutate(
        async () => {
          const resposta = await fetch("/api/notifications", {
            method: "DELETE",
          });
          if (!resposta.ok) {
            throw new Error(`Erro ao limpar notificacoes: ${resposta.status}`);
          }
          return dadosOtimistas;
        },
        {
          optimisticData: dadosOtimistas,
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (erro) {
      console.error("Erro ao limpar notificacoes:", erro);
    }
  }, [mutate]);

  return {
    notificacoes,
    naoVisualizadas,
    contagemNaoVisualizadas: naoVisualizadas.length,
    estaCarregando: isLoading,
    erro: error as Error | undefined,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
    revalidar: mutate,
  };
}

/**
 * Dispara evento customizado para notificar o hook que uma notificação foi criada.
 * Chamado pelo wrapper `notificar()` após POST bem-sucedido.
 */
export function fireNotificationCreatedEvent(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_CREATED_EVENT));
  }
}
