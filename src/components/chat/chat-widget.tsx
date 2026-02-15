"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MessageCircle, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensagemChatBolha } from "@/components/chat/mensagem-chat";
import { CampoEntradaChat } from "@/components/chat/campo-entrada-chat";
import { useChatAssistente } from "@/hooks/use-chat-assistente";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [estaAberto, setEstaAberto] = useState(false);
  const areaScrollRef = useRef<HTMLDivElement>(null);

  const {
    mensagens,
    estaTransmitindo,
    enviarMensagem,
    limparHistorico,
    erro,
    pararTransmissao,
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
        <div className="fixed right-6 bottom-6 z-40 flex h-[520px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
          {/* Cabecalho */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium">Assistente</h3>
            </div>
            <div className="flex items-center gap-1">
              {mensagens.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={limparHistorico}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="sr-only">Limpar historico</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAlternarChat}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Fechar assistente</span>
              </Button>
            </div>
          </div>

          {/* Area de mensagens */}
          <div
            ref={areaScrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {mensagens.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Pergunte sobre seus investimentos.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
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
            <div className="border-t bg-destructive/5 px-4 py-2">
              <p className="text-xs text-destructive">{erro}</p>
            </div>
          )}

          {/* Campo de entrada */}
          <CampoEntradaChat
            onEnviar={enviarMensagem}
            onParar={pararTransmissao}
            estaTransmitindo={estaTransmitindo}
          />
        </div>
      )}
    </>
  );
}
