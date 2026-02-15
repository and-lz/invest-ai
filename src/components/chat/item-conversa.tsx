"use client";

import { useState } from "react";
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

export function ItemConversa({
  conversa,
  estaAtiva,
  onSelecionar,
  onDeletar,
}: ItemConversaProps) {
  const [mostrarAcoes, setMostrarAcoes] = useState(false);

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 transition-colors hover:bg-muted/50",
        estaAtiva && "border-primary bg-muted",
      )}
      onMouseEnter={() => setMostrarAcoes(true)}
      onMouseLeave={() => setMostrarAcoes(false)}
    >
      <button onClick={onSelecionar} className="w-full text-left">
        {/* Titulo */}
        <h4 className="text-sm font-medium line-clamp-1">{conversa.titulo}</h4>

        {/* Preview */}
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {conversa.previewMensagem}
        </p>

        {/* Footer: timestamp + contagem */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>{conversa.contagemMensagens}</span>
          <span>•</span>
          <span>{formatarTimestampBrasileiro(conversa.atualizadaEm)}</span>
        </div>
      </button>

      {/* Botao deletar (hover) */}
      {mostrarAcoes && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(evento) => {
            evento.stopPropagation();
            onDeletar();
          }}
          className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
          <span className="sr-only">Deletar conversa</span>
        </Button>
      )}
    </div>
  );
}
