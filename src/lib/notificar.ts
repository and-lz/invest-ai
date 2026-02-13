import { toast } from "sonner";
import type { TipoNotificacao } from "@/lib/notificacao";
import { dispararEventoNotificacaoCriada } from "@/hooks/use-notificacoes";

interface OpcoesNotificacao {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** URL para o botão de ação na central de notificações */
  actionUrl?: string;
  /** Rótulo do botão de ação na central (default: "Ver resultado") */
  actionLabel?: string;
}

async function persistirNotificacao(
  tipo: TipoNotificacao,
  titulo: string,
  opcoes?: OpcoesNotificacao,
): Promise<void> {
  try {
    const resposta = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        titulo,
        descricao: opcoes?.description,
        acao: opcoes?.actionUrl
          ? {
              rotulo: opcoes.actionLabel ?? opcoes.action?.label ?? "Ver resultado",
              url: opcoes.actionUrl,
            }
          : undefined,
      }),
    });

    if (resposta.ok) {
      dispararEventoNotificacaoCriada();
    }
  } catch (erro) {
    // Silent fail: não bloqueia a exibição do toast se a persistência falhar
    console.error("[Notificar] Falha ao persistir notificacao:", erro);
  }
}

export const notificar = {
  success: (titulo: string, opcoes?: OpcoesNotificacao) => {
    toast.success(titulo, opcoes);
    void persistirNotificacao("success", titulo, opcoes);
  },

  error: (titulo: string, opcoes?: OpcoesNotificacao) => {
    toast.error(titulo, opcoes);
    void persistirNotificacao("error", titulo, opcoes);
  },

  warning: (titulo: string, opcoes?: OpcoesNotificacao) => {
    toast.warning(titulo, opcoes);
    void persistirNotificacao("warning", titulo, opcoes);
  },

  info: (titulo: string, opcoes?: OpcoesNotificacao) => {
    toast.info(titulo, opcoes);
    void persistirNotificacao("info", titulo, opcoes);
  },
};
