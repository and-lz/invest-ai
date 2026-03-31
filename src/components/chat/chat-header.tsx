"use client";

import { X, Trash2, Menu, Maximize2, Volume2, VolumeX, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SpeechStatus } from "@/hooks/use-speech-synthesis";

interface ChatHeaderProps {
  readonly fullscreen: boolean;
  readonly onToggleSidebar: () => void;
  readonly ttsSupported: boolean;
  readonly ttsEnabled: boolean;
  readonly onToggleTts: () => void;
  readonly speechStatus: SpeechStatus;
  readonly hasMensagens: boolean;
  readonly onLimparHistorico: () => void;
  readonly onOpenFullscreen: () => void;
  readonly onFechar: () => void;
}

export function ChatHeader({
  fullscreen: fs,
  onToggleSidebar,
  ttsSupported,
  ttsEnabled,
  onToggleTts,
  speechStatus,
  hasMensagens,
  onLimparHistorico,
  onOpenFullscreen,
  onFechar,
}: ChatHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between border-b",
      fs ? "px-6 py-5" : "px-4 py-3",
    )}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className={fs ? "h-10 w-10" : "h-8 w-8"}
        >
          <Menu className={fs ? "h-6 w-6" : "h-4 w-4"} />
        </Button>

        <Image src="/fortuna-minimal.png" alt="Fortuna" width={28} height={28} className={cn("rounded-full", fs ? "h-7 w-7" : "h-5 w-5")} />
        <h3 className={cn("font-medium", fs ? "text-lg" : "text-sm")}>Fortuna</h3>
      </div>
      <div className="flex items-center gap-1">
        {ttsSupported && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleTts}
                  className={cn("relative", fs ? "h-10 w-10" : "h-8 w-8", ttsEnabled && "text-primary")}
                >
                  {ttsEnabled ? (
                    <Volume2
                      className={cn(
                        fs ? "h-6 w-6" : "h-4 w-4",
                        speechStatus === "speaking" && "animate-pulse",
                      )}
                    />
                  ) : (
                    <VolumeX className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
                  )}
                  {ttsEnabled && (
                    <AlertTriangle className="text-warning absolute -right-0.5 -bottom-0.5 h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {ttsEnabled
                  ? "Leitura ativa (qualidade limitada pelo navegador)"
                  : "Ativar leitura em voz alta"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {hasMensagens && (
          <Button variant="ghost" size="icon" onClick={onLimparHistorico} className={fs ? "h-10 w-10" : "h-8 w-8"}>
            <Trash2 className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
            <span className="sr-only">Limpar historico</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenFullscreen}
          className={cn("hidden md:inline-flex", fs ? "h-10 w-10" : "h-8 w-8")}
        >
          <Maximize2 className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
          <span className="sr-only">Abrir em tela cheia</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onFechar}
          className={fs ? "h-10 w-10" : "h-8 w-8"}
        >
          <X className={cn("text-muted-foreground", fs ? "h-6 w-6" : "h-4 w-4")} />
          <span className="sr-only">Fechar Fortuna</span>
        </Button>
      </div>
    </div>
  );
}
