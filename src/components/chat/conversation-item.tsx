"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemConversaProps {
  readonly conversa: {
    identificador: string;
    titulo: string;
    atualizadaEm: string;
  };
  readonly estaAtiva: boolean;
  readonly onSelecionar: () => void;
  readonly onDeletar: () => void;
  readonly fullscreen?: boolean;
  readonly href?: string;
}

export function ItemConversa({ conversa, estaAtiva, onSelecionar, onDeletar, fullscreen, href }: ItemConversaProps) {
  const fs = fullscreen;

  const content = (
    <p className={cn("line-clamp-1", fs ? "text-sm" : "text-xs")}>
      {conversa.titulo}
    </p>
  );

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 relative rounded-md transition-colors",
        fs ? "px-3 py-2" : "px-2.5 py-1.5",
        estaAtiva && "bg-muted",
      )}
    >
      {href ? (
        <Link href={href} className="block w-full pr-6">
          {content}
        </Link>
      ) : (
        <button onClick={onSelecionar} className="w-full text-left pr-6">
          {content}
        </button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={(evento) => {
          evento.stopPropagation();
          onDeletar();
        }}
        className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 opacity-60 transition-opacity hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 className="text-destructive h-3.5 w-3.5" />
        <span className="sr-only">Deletar conversa</span>
      </Button>
    </div>
  );
}
