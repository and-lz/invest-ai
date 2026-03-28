"use client";

import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBrazilianTimestamp } from "@/lib/format-date";

interface ItemConversaProps {
  readonly conversa: {
    identificador: string;
    titulo: string;
    atualizadaEm: string;
    previewMensagem: string;
    contagemMensagens: number;
  };
  readonly estaAtiva: boolean;
  readonly onSelecionar: () => void;
  readonly onDeletar: () => void;
  readonly fullscreen?: boolean;
}

export function ItemConversa({ conversa, estaAtiva, onSelecionar, onDeletar, fullscreen }: ItemConversaProps) {
  const fs = fullscreen;
  return (
    <div
      className={cn(
        "group hover:bg-muted/50 relative rounded-lg border transition-colors",
        fs ? "p-4" : "p-3",
        estaAtiva && "border-primary bg-muted",
      )}
    >
      <button onClick={onSelecionar} className="w-full text-left pr-7">
        {/* Titulo */}
        <h4 className={cn("line-clamp-1 font-medium", fs ? "text-base" : "text-sm")}>{conversa.titulo}</h4>

        {/* Preview */}
        <p className={cn("text-muted-foreground mt-1 line-clamp-2", fs ? "text-sm" : "text-xs")}>
          {conversa.previewMensagem}
        </p>

        {/* Footer: timestamp + contagem */}
        <div className={cn("text-muted-foreground mt-2 flex items-center gap-2", fs ? "text-sm" : "text-xs")}>
          <MessageSquare className="h-3 w-3" />
          <span>{conversa.contagemMensagens}</span>
          <span>•</span>
          <span>{formatBrazilianTimestamp(conversa.atualizadaEm)}</span>
        </div>
      </button>

      {/* Botao deletar: sempre visivel em touch, hover em desktop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(evento) => {
          evento.stopPropagation();
          onDeletar();
        }}
        className="absolute top-2 right-2 h-6 w-6 opacity-60 transition-opacity hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 className="text-destructive h-4 w-4" />
        <span className="sr-only">Deletar conversa</span>
      </Button>
    </div>
  );
}
