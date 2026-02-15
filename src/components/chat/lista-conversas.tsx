"use client";

import { useConversas } from "@/hooks/use-conversas";
import { ItemConversa } from "./item-conversa";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, MessageSquare } from "lucide-react";

interface ListaConversasProps {
  readonly conversaAtualId: string | null;
  readonly onSelecionarConversa: (identificador: string) => void;
  readonly onNovaConversa: () => void;
}

export function ListaConversas({
  conversaAtualId,
  onSelecionarConversa,
  onNovaConversa,
}: ListaConversasProps) {
  const { conversas, estaCarregando, deletarConversa } = useConversas();

  if (estaCarregando) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Botao Nova Conversa */}
      <div className="border-b p-3">
        <Button onClick={onNovaConversa} variant="outline" size="sm" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {conversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Nenhuma conversa ainda.
              <br />
              Comece a conversar!
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversas.map((conversa) => (
              <ItemConversa
                key={conversa.identificador}
                conversa={conversa}
                estaAtiva={conversa.identificador === conversaAtualId}
                onSelecionar={() => onSelecionarConversa(conversa.identificador)}
                onDeletar={() => deletarConversa(conversa.identificador)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
