"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Square, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampoEntradaChatProps {
  readonly onEnviar: (conteudo: string) => void;
  readonly onParar: () => void;
  readonly estaTransmitindo: boolean;
  readonly desabilitado?: boolean;
  readonly autoFocus?: boolean;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly fullscreen?: boolean;
  readonly raciocinio?: boolean;
  readonly onRaciocinioChange?: (enabled: boolean) => void;
}

function ehDispositivoTouch(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none)").matches;
}

export function CampoEntradaChat({
  onEnviar,
  onParar,
  estaTransmitindo,
  desabilitado,
  autoFocus = true,
  value: controlledValue,
  onValueChange,
  fullscreen,
  raciocinio,
  onRaciocinioChange,
}: CampoEntradaChatProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = controlledValue !== undefined;
  const valor = isControlled ? controlledValue : internalValue;
  const setValor = useCallback(
    (v: string) => {
      if (isControlled) {
        onValueChange?.(v);
      } else {
        setInternalValue(v);
      }
    },
    [isControlled, onValueChange],
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fs = fullscreen;

  // Auto-focus quando componente monta (apenas em desktop, nao abre teclado no mobile)
  useEffect(() => {
    if (autoFocus && textareaRef.current && !ehDispositivoTouch()) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleEnviar = useCallback(() => {
    if (valor.trim() && !estaTransmitindo) {
      onEnviar(valor);
      setValor("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [valor, estaTransmitindo, onEnviar, setValor]);

  const handleKeyDown = useCallback(
    (evento: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (evento.key === "Enter" && !evento.shiftKey) {
        evento.preventDefault();
        handleEnviar();
      }
    },
    [handleEnviar],
  );

  const handleInput = useCallback(
    (evento: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValor(evento.target.value);
      const textarea = evento.target;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, fs ? 180 : 120)}px`;
    },
    [setValor, fs],
  );

  return (
    <div className={cn(
      "flex items-end border-t",
      fs ? "mx-auto w-full max-w-4xl gap-3 p-5" : "gap-2 p-3",
    )}>
      {onRaciocinioChange && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRaciocinioChange(!raciocinio)}
          className={cn(
            "shrink-0",
            raciocinio ? "text-primary" : "text-muted-foreground",
          )}
          title={raciocinio ? "Desativar raciocínio" : "Ativar raciocínio"}
        >
          <Brain className="h-4 w-4" />
        </Button>
      )}
      <textarea
        ref={textareaRef}
        value={valor}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Pergunte algo sobre seus investimentos..."
        disabled={desabilitado}
        rows={1}
        className={cn(
          "bg-background placeholder:text-muted-foreground focus:ring-ring flex-1 resize-none rounded-lg border focus:ring-1 focus:outline-none disabled:opacity-50",
          fs ? "px-4 py-3 text-base" : "px-3 py-2 text-sm",
        )}
      />
      {estaTransmitindo ? (
        <Button variant="ghost" size="icon" onClick={onParar} className="shrink-0">
          <Square className="h-4 w-4" />
          <span className="sr-only">Parar transmissao</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEnviar}
          disabled={!valor.trim() || desabilitado}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar mensagem</span>
        </Button>
      )}
    </div>
  );
}
