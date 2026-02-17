"use client";

import { Button } from "@/components/ui/button";
import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarTimestampBrasileiro } from "@/lib/format-date";

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
}

export function ItemConversa({ conversa, estaAtiva, onSelecionar, onDeletar }: ItemConversaProps) {
  return (
    <div
      className={cn(
        "group hover:bg-muted/50 relative rounded-md border p-2 transition-colors",
        estaAtiva && "border-primary bg-muted",
      )}
    >
      <button onClick={onSelecionar} className="w-full text-left pr-6">
        {/* Titulo */}
        <h4 className="line-clamp-1 text-xs font-medium">{conversa.titulo}</h4>

        {/* Preview */}
        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
          {conversa.previewMensagem}
        </p>

        {/* Footer: timestamp + contagem */}
        <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
          <MessageSquare className="h-3 w-3" />
          <span>{conversa.contagemMensagens}</span>
          <span>•</span>
          <span>{formatarTimestampBrasileiro(conversa.atualizadaEm)}</span>
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
        <Trash2 className="text-destructive h-3 w-3" />
        <span className="sr-only">Deletar conversa</span>
      </Button>
    </div>
  );
}
