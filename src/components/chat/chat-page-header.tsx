"use client";

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
  readonly criadaEm?: string;
  readonly preview?: string;
  readonly paginaLabel?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ChatPageHeader({
  title,
  onToggleSidebar,
  ttsSupported,
  ttsEnabled,
  onToggleTts,
  hasMessages,
  onClearHistory,
  onBack,
  criadaEm,
  preview,
  paginaLabel,
}: ChatPageHeaderProps) {
  const showOverflow = ttsSupported || hasMessages;
  const hasEditorial = !!criadaEm;

  return (
    <header className="chat-page-nav bg-background shrink-0">
      {/* Action row */}
      <div className="flex items-center px-4 py-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-9 w-9 shrink-0">
          <Menu className="h-4 w-4" />
        </Button>

        {!hasEditorial && (
          <div className="min-w-0 flex-1 px-3">
            <h1 className="text-muted-foreground truncate text-xs font-normal">{title}</h1>
          </div>
        )}
        {hasEditorial && <div className="flex-1" />}

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

      {/* Editorial section */}
      {hasEditorial && (
        <div className="px-8 pb-8 pt-1 border-b border-border/40 text-center">
          {/* Eyebrow — category + date */}
          <p className="text-muted-foreground/50 text-[10px] font-semibold uppercase tracking-[0.2em]">
            {[paginaLabel, formatDate(criadaEm)].filter(Boolean).join("  ·  ")}
          </p>

          {/* Thin rule */}
          <div className="mx-auto my-3 h-px w-8 bg-border/60" />

          {/* Headline */}
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            {title}
          </h2>

          {/* Standfirst / deck */}
          {preview && (
            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm italic leading-relaxed line-clamp-3">
              {preview}
            </p>
          )}
        </div>
      )}
    </header>
  );
}
