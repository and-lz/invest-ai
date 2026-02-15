"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, Square, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { cn } from "@/lib/utils";

// ============================================================
// Botão inline para ler artigos educacionais em voz alta.
// Usa Web Speech API para selecionar a melhor voz pt-BR disponível.
// Posicionado ao lado do título do artigo.
// ============================================================

interface BotaoLerArtigoProps {
  readonly className?: string;
}

export function BotaoLerArtigo({ className }: BotaoLerArtigoProps) {
  const { status, isSupported, error, speak, pause, resume, stop } = useSpeechSynthesis();
  const [textoArtigo, setTextoArtigo] = useState<string>("");
  const extraiuTextoRef = useRef(false);

  // Extrair texto do artigo ao montar
  useEffect(() => {
    if (extraiuTextoRef.current) return;

    const artigo = document.querySelector("article");
    if (!artigo) return;

    // Extrair título (h1)
    const titulo = artigo.querySelector("h1")?.textContent?.trim() || "";

    // Extrair conteúdo principal (prose container)
    const proseContainer = artigo.querySelector(".prose");
    if (!proseContainer) return;

    // Clonar para não afetar DOM original
    const clone = proseContainer.cloneNode(true) as HTMLElement;

    // Remover elementos que não devem ser lidos (navegação, badges, code blocks)
    clone.querySelectorAll("nav, .badge, hr, code, pre").forEach((elemento) => elemento.remove());

    // Extrair texto limpo
    const conteudo = clone.innerText.trim();

    // Montar texto final: "Título do Artigo. Conteúdo..."
    const textoCompleto = titulo ? `${titulo}. ${conteudo}` : conteudo;

    setTextoArtigo(textoCompleto);
    extraiuTextoRef.current = true;
  }, []);

  // Não renderizar se não houver suporte ou texto
  if (!isSupported || !textoArtigo) {
    return null;
  }

  const handlePlayPause = () => {
    if (status === "idle") {
      speak(textoArtigo);
    } else if (status === "speaking") {
      pause();
    } else if (status === "paused") {
      resume();
    }
  };

  const handleStop = () => {
    stop();
  };

  const isPlaying = status === "speaking";
  const isPaused = status === "paused";
  const isLoading = status === "loading";
  const isIdle = status === "idle";
  const hasError = status === "error";

  // Tooltip text baseado no estado
  const tooltipText = (() => {
    if (hasError) return error?.message || "Erro ao reproduzir áudio";
    if (isLoading) return "Carregando...";
    if (isIdle) return "Ouvir artigo";
    if (isPlaying) return "Pausar leitura";
    if (isPaused) return "Continuar leitura";
    return "";
  })();

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <TooltipProvider>
        {/* Botão Play/Pause */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handlePlayPause}
              size="sm"
              variant={isPlaying || isPaused ? "default" : "outline"}
              className="relative h-9 w-9 rounded-full transition-transform hover:scale-105"
              aria-label={tooltipText}
              disabled={isLoading || hasError}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : hasError ? (
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" aria-hidden="true" />
              )}
              {/* Indicador visual de áudio ativo */}
              {isPlaying && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-success"
                  aria-hidden="true"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>

        {/* Botão Stop (só aparece quando está tocando ou pausado) */}
        {(isPlaying || isPaused) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleStop}
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full transition-transform hover:scale-105"
                aria-label="Parar leitura"
              >
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Parar leitura</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}
