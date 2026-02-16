"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MessageCircle, X, Trash2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensagemChatBolha } from "@/components/chat/mensagem-chat";
import { CampoEntradaChat } from "@/components/chat/campo-entrada-chat";
import { ListaConversas } from "@/components/chat/lista-conversas";
import { useChatAssistente } from "@/hooks/use-chat-assistente";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [estaAberto, setEstaAberto] = useState(false);
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

  const handleAlternarChat = useCallback(() => {
    setEstaAberto((anterior) => !anterior);
  }, []);

  const handleSelecionarConversa = useCallback(
    async (identificador: string) => {
      await carregarConversa(identificador);
      setMostrarSidebar(false); // Fecha sidebar no mobile
    },
    [carregarConversa],
  );

  const handleNovaConversa = useCallback(() => {
    criarNovaConversa();
    setMostrarSidebar(false); // Fecha sidebar no mobile
  }, [criarNovaConversa]);

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
        <div className="bg-background fixed inset-0 z-40 flex overflow-hidden border shadow-xl md:inset-auto md:right-6 md:bottom-6 md:h-[85vh] md:max-h-[calc(100vh-3rem)] md:w-[85vw] md:max-w-350 md:rounded-2xl">
          {/* Sidebar de conversas (desktop: sempre visivel, mobile: drawer) */}
          <div
            className={cn(
              "bg-background absolute z-10 h-full w-64 border-r transition-transform md:relative md:translate-x-0",
              mostrarSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            )}
          >
            <ListaConversas
              conversaAtualId={conversaAtualId}
              onSelecionarConversa={handleSelecionarConversa}
              onNovaConversa={handleNovaConversa}
            />
          </div>

          {/* Area principal do chat */}
          <div className="flex flex-1 flex-col">
            {/* Cabecalho */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Botao toggle sidebar (mobile only) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMostrarSidebar(!mostrarSidebar)}
                  className="h-8 w-8 md:hidden"
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
