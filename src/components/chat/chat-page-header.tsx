"use client";

import { forwardRef } from "react";
import { Menu, Trash2, Volume2, VolumeX, ArrowLeft, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SpeechStatus } from "@/hooks/use-speech-synthesis";

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

export const ChatPageHeader = forwardRef<HTMLDivElement, ChatPageHeaderProps>(function ChatPageHeader({
  title,
  onToggleSidebar,
  ttsSupported,
  ttsEnabled,
  onToggleTts,
  hasMessages,
  onClearHistory,
  onBack,
}, ref) {
  const showOverflow = ttsSupported || hasMessages;

  return (
    <div ref={ref} className="chat-auto-header sticky inset-x-0 top-0 z-10">
      <div className="flex items-center px-4 py-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-9 w-9 shrink-0">
          <Menu className="h-4 w-4" />
        </Button>

        <div className="min-w-0 flex-1 px-3">
          <p className="text-muted-foreground truncate text-xs">{title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {showOverflow && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {ttsSupported && (
                  <DropdownMenuItem onClick={onToggleTts}>
                    {ttsEnabled ? (
                      <>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Desativar leitura
                        <AlertTriangle className="text-warning ml-1 h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <VolumeX className="mr-2 h-4 w-4" />
                        Ativar leitura
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {hasMessages && (
                  <DropdownMenuItem onClick={onClearHistory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar histórico
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ArrowLeft className="text-muted-foreground h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
