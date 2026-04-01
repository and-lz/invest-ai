"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Square, ChevronDown, Check, Zap, Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CLAUDE_MODEL_TIER_OPTIONS } from "@/lib/model-tiers";
import type { ClaudeModelTier } from "@/lib/model-tiers";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

/** Maps tier to display label shown in the input toolbar */
const TIER_LABELS: Record<ClaudeModelTier, string> = {
  haiku: "Haiku",
  sonnet: "Sonnet",
  opus: "Opus",
};

const TIER_ICONS: Record<ClaudeModelTier, typeof Zap> = {
  haiku: Zap,
  sonnet: Cpu,
  opus: Sparkles,
};

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
  readonly modelTier?: ClaudeModelTier;
  readonly onModelTierChange?: (tier: ClaudeModelTier) => void;
  readonly hideBorderTop?: boolean;
  readonly suggestions?: readonly ChatSuggestion[];
  readonly suggestionsLoading?: boolean;
  readonly onSuggestionSelect?: (text: string) => void;
  readonly suggestionsFilterText?: string;
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
  modelTier,
  onModelTierChange,
  hideBorderTop,
  suggestions,
  suggestionsLoading,
  onSuggestionSelect,
  suggestionsFilterText,
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
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
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

  const showInlineChips = suggestions && suggestions.length > 0 && onSuggestionSelect && !valor.trim();

  const chipsVisible = showInlineChips || suggestionsLoading;

  return (
    <div className={cn(
      "flex flex-col",
      !hideBorderTop && "border-t",
      fs ? "mx-auto w-full max-w-4xl px-5 pt-3 pb-0" : "px-3 pt-1.5 pb-3",
    )}>
      {/* Claude.ai-style input container: textarea + bottom toolbar */}
      <div className={cn(
        "rounded-2xl border border-border/60 bg-card transition-colors focus-within:border-border",
        fs ? "px-4 pt-3 pb-2" : "px-3 pt-2 pb-1.5",
      )}>
        {/* Textarea area with optional chips overlay */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={valor}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={chipsVisible ? undefined : "Pergunte algo sobre seus investimentos..."}
            disabled={desabilitado}
            rows={1}
            className={cn(
              "placeholder:text-muted-foreground w-full resize-none bg-transparent focus:ring-0 focus:outline-none disabled:opacity-50",
              fs ? "text-base" : "text-sm",
            )}
          />
          {chipsVisible && (
            <div className="pointer-events-none absolute inset-0 flex items-start">
              <SuggestionChips
                suggestions={suggestions ?? []}
                onSelect={onSuggestionSelect!}
                filterText={suggestionsFilterText}
                variant="quick-reply"
                isLoading={suggestionsLoading}
                fullscreen={fs}
              />
            </div>
          )}
        </div>

        {/* Bottom toolbar: model selector + reasoning toggle + send */}
        <div className={cn("relative z-10 flex items-center justify-between", fs ? "mt-1" : "mt-0.5")}>
          <div className="flex-1" />

          <div className="flex items-center gap-1">
            {/* Model tier selector */}
            {onModelTierChange && modelTier && (
              <Popover modal={false} open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={estaTransmitindo}
                    className={cn(
                      "text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50",
                    )}
                  >
                    {(() => { const Icon = TIER_ICONS[modelTier]; return <Icon className="h-3 w-3" />; })()}
                    <span>{TIER_LABELS[modelTier]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-52 p-1" sideOffset={8}>
                  {CLAUDE_MODEL_TIER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onModelTierChange(option.value);
                        setModelPopoverOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                        modelTier === option.value && "bg-muted/50",
                      )}
                    >
                      {(() => { const Icon = TIER_ICONS[option.value]; return <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />; })()}
                      <span className="flex-1">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">{option.description}</span>
                      </span>
                      {modelTier === option.value && (
                        <Check className="text-primary h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}

            {/* Reasoning toggle */}
            {onRaciocinioChange && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onRaciocinioChange(!raciocinio);
                }}
                disabled={estaTransmitindo}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                  raciocinio
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                Extendido
              </button>
            )}

            {/* Send / Stop button */}
            {estaTransmitindo ? (
              <Button variant="ghost" size="icon" onClick={onParar} className="h-7 w-7 shrink-0">
                <Square className="h-3.5 w-3.5 fill-current" />
                <span className="sr-only">Parar transmissao</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEnviar}
                disabled={!valor.trim() || desabilitado}
                className="h-7 w-7 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="sr-only">Enviar mensagem</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
