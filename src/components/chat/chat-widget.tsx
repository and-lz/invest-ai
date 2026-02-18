"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MessageCircle, X, Trash2, Menu, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensagemChatBolha } from "@/components/chat/mensagem-chat";
import { CampoEntradaChat } from "@/components/chat/campo-entrada-chat";
import { ListaConversas } from "@/components/chat/lista-conversas";
import { useChatAssistente } from "@/hooks/use-chat-assistente";
import {
  EVENTO_ABRIR_CHAT_COM_PERGUNTA,
  type EventoAbrirChatDetalhe,
} from "@/components/ui/botao-explicar-ia";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [estaAberto, setEstaAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const areaScrollRef = useRef<HTMLDivElement>(null);

  const {
    mensagens,
    estaTransmitindo,
    enviarMensagem,
    limparHistorico,
    erro,
    pararTransmissao,
    conversaAtualId,
    criarNovaConversa,
    carregarConversa,
  } = useChatAssistente();

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (areaScrollRef.current) {
      areaScrollRef.current.scrollTop = areaScrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Close chat on ESC key
  useEffect(() => {
    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape" && estaAberto) {
        setEstaAberto(false);
        setMostrarSidebar(false);
        setTelaCheia(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [estaAberto]);

  // Listen for external "ask AI to explain" events from chart card buttons
  useEffect(() => {
    function handleAbrirComPergunta(evento: Event) {
      const { pergunta } = (evento as CustomEvent<EventoAbrirChatDetalhe>).detail;
      setEstaAberto(true);
      criarNovaConversa();
      // Small delay to let React render the open state before sending
      setTimeout(() => {
        void enviarMensagem(pergunta);
      }, 100);
    }

    window.addEventListener(EVENTO_ABRIR_CHAT_COM_PERGUNTA, handleAbrirComPergunta);
    return () => {
      window.removeEventListener(EVENTO_ABRIR_CHAT_COM_PERGUNTA, handleAbrirComPergunta);
    };
  }, [criarNovaConversa, enviarMensagem]);

  const handleAlternarChat = useCallback(() => {
    setEstaAberto((anterior) => !anterior);
    setMostrarSidebar(false);
    setTelaCheia(false);
  }, []);

  const handleSelecionarConversa = useCallback(
    async (identificador: string) => {
      await carregarConversa(identificador);
      setMostrarSidebar(false);
    },
    [carregarConversa],
  );

  const handleNovaConversa = useCallback(() => {
    criarNovaConversa();
    setMostrarSidebar(false);
  }, [criarNovaConversa]);

  const handleFecharSidebar = useCallback(() => {
    setMostrarSidebar(false);
  }, []);

  return (
    <>
      {/* Botao flutuante (FAB) */}
      <Button
        onClick={handleAlternarChat}
        size="icon"
        className={cn(
          "fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full shadow-lg transition-transform",
          estaAberto && "scale-0",
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Abrir assistente</span>
      </Button>

      {/* Painel de chat */}
      {estaAberto && (
        <div
          className={cn(
            "bg-background fixed z-60 flex overflow-hidden border shadow-xl",
            telaCheia
              ? "inset-0 h-dvh w-dvw"
              : "left-0 top-0 h-dvh w-dvw md:inset-auto md:right-6 md:bottom-6 md:left-auto md:top-auto md:h-[85vh] md:max-h-[calc(100vh-3rem)] md:w-[420px] md:rounded-2xl",
          )}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Backdrop da sidebar (mobile) */}
          {mostrarSidebar && (
            <div
              className="absolute inset-0 z-5 bg-black/40 transition-opacity md:hidden"
              onClick={handleFecharSidebar}
              aria-hidden="true"
            />
          )}

          {/* Sidebar de conversas (overlay, aberta apenas ao clicar) */}
          <div
            className={cn(
              "bg-background absolute z-10 h-full w-64 border-r transition-transform",
              mostrarSidebar ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <ListaConversas
              conversaAtualId={conversaAtualId}
              onSelecionarConversa={handleSelecionarConversa}
              onNovaConversa={handleNovaConversa}
            />
          </div>

          {/* Area principal do chat */}
          <div className={cn("flex flex-1 flex-col", telaCheia && "chat-fullscreen")}>
            {/* Cabecalho */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Botao toggle sidebar (historico de conversas) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMostrarSidebar(!mostrarSidebar)}
                  className="h-8 w-8"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <MessageCircle className="text-muted-foreground h-5 w-5" />
                <h3 className="text-sm font-medium">Assistente</h3>
              </div>
              <div className="flex items-center gap-1">
                {mensagens.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={limparHistorico} className="h-8 w-8">
                    <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="sr-only">Limpar historico</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTelaCheia((v) => !v)}
                  className="hidden h-8 w-8 md:inline-flex"
                >
                  {telaCheia ? (
                    <Minimize2 className="text-muted-foreground h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="text-muted-foreground h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">{telaCheia ? "Sair da tela cheia" : "Tela cheia"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAlternarChat}
                  className="h-8 w-8"
                >
                  <X className="text-muted-foreground h-4 w-4" />
                  <span className="sr-only">Fechar assistente</span>
                </Button>
              </div>
            </div>

            {/* Area de mensagens */}
            <div ref={areaScrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {mensagens.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageCircle className="text-muted-foreground mb-3 h-10 w-10" />
                  <p className="text-muted-foreground text-sm">
                    Pergunte sobre seus investimentos.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    O assistente tem acesso aos dados da pagina atual.
                  </p>
                </div>
              )}
              {mensagens.map((mensagem, indice) => (
                <MensagemChatBolha
                  key={mensagem.identificador}
                  mensagem={mensagem}
                  estaTransmitindo={
                    estaTransmitindo &&
                    mensagem.papel === "assistente" &&
                    indice === mensagens.length - 1
                  }
                />
              ))}
            </div>

            {/* Banner de erro */}
            {erro && (
              <div className="bg-destructive/5 border-t px-4 py-2">
                <p className="text-destructive text-xs">{erro}</p>
              </div>
            )}

            {/* Campo de entrada */}
            <CampoEntradaChat
              onEnviar={enviarMensagem}
              onParar={pararTransmissao}
              estaTransmitindo={estaTransmitindo}
            />
          </div>
        </div>
      )}
    </>
  );
}
