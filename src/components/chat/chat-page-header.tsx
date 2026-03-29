"use client";

import { Menu, Trash2, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/ui/logo";
import type { SpeechStatus } from "@/hooks/use-speech-synthesis";
import { cn } from "@/lib/utils";

interface ChatPageHeaderProps {
  readonly title: string;
  readonly onToggleSidebar: () => void;
  readonly ttsSupported: boolean;
  readonly ttsEnabled: boolean;
  readonly speechStatus: SpeechStatus;
  readonly onToggleTts: () => void;
  readonly hasMessages: boolean;
  readonly onClearHistory: () => void;
  readonly onBack: () => void;
}

export function ChatPageHeader({
  title,
  onToggleSidebar,
  ttsSupported,
  ttsEnabled,
  speechStatus,
  onToggleTts,
  hasMessages,
  onClearHistory,
  onBack,
}: ChatPageHeaderProps) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky inset-x-0 top-0 z-10 border-b backdrop-blur-sm">
      <div className="flex items-center px-6 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
          <Logo />
        </div>
        <div className="min-w-0 flex-1 px-4 text-center">
          <p className="text-muted-foreground truncate text-sm font-medium">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {ttsSupported && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleTts}
                    className={cn("h-10 w-10", ttsEnabled && "text-primary")}
                  >
                    {ttsEnabled ? (
                      <Volume2
                        className={cn("h-5 w-5", speechStatus === "speaking" && "animate-pulse")}
                      />
                    ) : (
                      <VolumeX className="text-muted-foreground h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {ttsEnabled ? "Desativar leitura em voz alta" : "Ativar leitura em voz alta"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {hasMessages && (
            <Button variant="ghost" size="icon" onClick={onClearHistory} className="h-10 w-10">
              <Trash2 className="text-muted-foreground h-5 w-5" />
              <span className="sr-only">Limpar historico</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10">
            <ArrowLeft className="text-muted-foreground h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
