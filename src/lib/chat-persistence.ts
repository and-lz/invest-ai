import type { MensagemChat } from "@/schemas/chat.schema";
import { notificar } from "@/lib/notifier";

/** Fetch a conversation by ID. Returns messages and settings on success, null on 404. Throws on other errors. */
export async function loadConversation(
  identificador: string,
): Promise<{ mensagens: MensagemChat[]; modoMercado: boolean } | null> {
  const resposta = await fetch(`/api/conversations/${identificador}`);
  if (resposta.status === 404) return null;
  if (!resposta.ok) {
    throw new Error(`Erro ao carregar conversa: ${resposta.status}`);
  }
  const dados = (await resposta.json()) as {
    conversa: { mensagens: MensagemChat[]; modoMercado?: boolean };
  };
  return {
    mensagens: dados.conversa.mensagens,
    modoMercado: dados.conversa.modoMercado ?? false,
  };
}

/** Generate a smart AI title for a conversation (fire-and-forget). */
export async function generateSmartTitle(
  conversaId: string,
  mensagens: readonly MensagemChat[],
): Promise<void> {
  try {
    const payload = mensagens.slice(0, 4).map((m) => ({
      papel: m.papel,
      conteudo: m.conteudo,
    }));
    const resp = await fetch("/api/chat/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagens: payload }),
    });
    if (!resp.ok) return;
    const { titulo } = (await resp.json()) as { titulo: string };
    if (!titulo) return;
    await fetch(`/api/conversations/${conversaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
  } catch {
    notificar.info("Não foi possível gerar título da conversa");
  }
}

interface AutoSaveParams {
  readonly mensagens: readonly MensagemChat[];
  readonly conversaAtualId: string | null;
  readonly identificadorPagina: string;
  readonly modoMercado: boolean;
  readonly onConversaCriada: (id: string) => void;
  readonly onAutoSaveFail: (failCount: number) => void;
  readonly autoSaveFailCount: number;
}

/** Auto-save conversation: creates a new one or updates existing. */
export async function autoSaveConversation(params: AutoSaveParams): Promise<void> {
  const { mensagens, conversaAtualId, identificadorPagina, modoMercado, onConversaCriada, onAutoSaveFail } =
    params;

  if (mensagens.length === 0) return;

  // Placeholder title from first user message (replaced by AI title later)
  const primeiraMensagemUsuario = mensagens.find((mensagem) => mensagem.papel === "usuario");
  const titulo = primeiraMensagemUsuario?.conteudo.slice(0, 50) ?? "Nova conversa";

  try {
    if (!conversaAtualId) {
      // Criar nova conversa
      const resposta = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          identificadorPagina,
          mensagens,
          modoMercado,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao criar conversa");
      }

      const dados = (await resposta.json()) as {
        conversa: { identificador: string };
      };
      onConversaCriada(dados.conversa.identificador);

      // Fire-and-forget: generate smart AI title
      void generateSmartTitle(dados.conversa.identificador, mensagens);
    } else {
      // Atualizar conversa existente
      await fetch(`/api/conversations/${conversaAtualId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens, modoMercado }),
      });
    }
    onAutoSaveFail(0);
  } catch (erroCatch) {
    console.error("Erro ao salvar conversa:", erroCatch);
    const newCount = params.autoSaveFailCount + 1;
    onAutoSaveFail(newCount);
    if (newCount >= 3) {
      notificar.warning("Conversa não salva", {
        description: "Suas mensagens podem não ser preservadas.",
      });
    }
  }
}
