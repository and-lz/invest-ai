"use client";

import { useConversas } from "@/hooks/use-conversations";
import { ItemConversa } from "./conversation-item";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, MessageSquare } from "lucide-react";
import { icon } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface ListaConversasProps {
  readonly conversaAtualId: string | null;
  readonly onSelecionarConversa: (identificador: string) => void;
  readonly onNovaConversa: () => void;
  readonly fullscreen?: boolean;
}

export function ListaConversas({
  conversaAtualId,
  onSelecionarConversa,
  onNovaConversa,
  fullscreen,
}: ListaConversasProps) {
  const { conversas, estaCarregando, deletarConversa } = useConversas();
  const fs = fullscreen;

  if (estaCarregando) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Botao Nova Conversa */}
      <div className={cn("border-b", fs ? "p-4" : "p-3")}>
        <Button onClick={onNovaConversa} variant="outline" size={fs ? "default" : "sm"} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <MessageSquare className={icon.emptyState} />
            <p className={cn("text-muted-foreground text-center", fs ? "text-base" : "text-sm")}>
              Nenhuma conversa ainda.
              <br />
              Comece a conversar!
            </p>
          </div>
        ) : (
          <div className={cn("space-y-1", fs ? "p-3" : "p-2")}>
            {conversas.map((conversa) => (
              <ItemConversa
                key={conversa.identificador}
                conversa={conversa}
                estaAtiva={conversa.identificador === conversaAtualId}
                onSelecionar={() => onSelecionarConversa(conversa.identificador)}
                onDeletar={() => deletarConversa(conversa.identificador)}
                fullscreen={fs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
