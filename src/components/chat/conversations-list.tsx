"use client";

import { useMemo, useState, useCallback } from "react";
import { useConversas } from "@/hooks/use-conversations";
import { ItemConversa } from "./conversation-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, MessageSquare } from "lucide-react";
import { icon } from "@/lib/design-system";
import { groupByDate } from "@/lib/date-grouping";
import { cn } from "@/lib/utils";

interface ListaConversasProps {
  readonly conversaAtualId: string | null;
  readonly onSelecionarConversa: (identificador: string) => void;
  readonly onNovaConversa: () => void;
  readonly fullscreen?: boolean;
  readonly useLinks?: boolean;
}

export function ListaConversas({
  conversaAtualId,
  onSelecionarConversa,
  onNovaConversa,
  fullscreen,
  useLinks,
}: ListaConversasProps) {
  const { conversas, estaCarregando, deletarConversa } = useConversas();
  const fs = fullscreen;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletar = useCallback(async (identificador: string) => {
    setDeletingId(identificador);
    try {
      await deletarConversa(identificador);
    } finally {
      setDeletingId(null);
    }
  }, [deletarConversa]);

  const groups = useMemo(() => groupByDate(conversas), [conversas]);

  return (
    <div className="flex h-full flex-col">
      {/* New conversation button */}
      <div className={cn("border-b", fs ? "p-4" : "p-3")}>
        <Button onClick={onNovaConversa} variant="outline" size={fs ? "default" : "sm"} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      {/* Conversation list grouped by date */}
      <div className="flex-1 overflow-y-auto">
        {estaCarregando ? (
          <div className={cn(fs ? "p-3" : "p-2")}>
            {/* Fake date group header */}
            <Skeleton className={cn("mb-2 rounded", fs ? "mx-3 h-2.5 w-16" : "mx-2.5 h-2 w-12")} />
            <div className="space-y-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn("rounded-md", fs ? "px-3 py-2" : "px-2.5 py-1.5")}>
                  <Skeleton className={cn("rounded", fs ? "h-3.5 w-full" : "h-3 w-full")} style={{ width: `${70 + (i % 3) * 10}%` }} />
                </div>
              ))}
            </div>
          </div>
        ) : conversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6">
            <MessageSquare className={icon.emptyState} />
            <p className={cn("text-muted-foreground text-center", fs ? "text-lg" : "text-sm")}>
              Nenhuma conversa ainda.
              <br />
              Comece a conversar!
            </p>
          </div>
        ) : (
          <div className={cn(fs ? "p-3" : "p-2")}>
            {groups.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <h5 className={cn(
                  "text-muted-foreground mb-2 font-medium uppercase tracking-wider",
                  fs ? "px-3 text-[11px]" : "px-2.5 text-[10px]",
                )}>
                  {group.label}
                </h5>
                <div className="space-y-0.5">
                  {group.items.map((conversa) => (
                    <ItemConversa
                      key={conversa.identificador}
                      conversa={conversa}
                      estaAtiva={conversa.identificador === conversaAtualId}
                      onSelecionar={() => onSelecionarConversa(conversa.identificador)}
                      onDeletar={() => void handleDeletar(conversa.identificador)}
                      estaExcluindo={conversa.identificador === deletingId}
                      fullscreen={fs}
                      href={useLinks ? `/chat/${conversa.identificador}` : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
