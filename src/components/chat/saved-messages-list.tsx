"use client";

import { useMemo } from "react";
import { useSavedMessages } from "@/hooks/use-saved-messages";
import { Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { icon } from "@/lib/design-system";
import { groupByDate } from "@/lib/date-grouping";
import { cn } from "@/lib/utils";
import type { SavedMessage } from "@/schemas/saved-message.schema";

interface SavedMessagesListProps {
  readonly onSelecionarConversa: (conversaId: string) => void;
  readonly fullscreen?: boolean;
}

export function SavedMessagesList({
  onSelecionarConversa,
  fullscreen,
}: SavedMessagesListProps) {
  const { savedMessages, isLoading, unsaveMessage } = useSavedMessages();
  const fs = fullscreen;

  // Map salvadaEm → atualizadaEm for groupByDate compatibility
  const groupable = useMemo(
    () => savedMessages.map((m) => ({ ...m, atualizadaEm: m.salvadaEm })),
    [savedMessages],
  );
  const groups = useMemo(() => groupByDate(groupable), [groupable]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className={cn(fs ? "p-3" : "p-2")}>
            {/* Group — mirrors real: h5 header + SavedMessageItem rows */}
            <div className="mb-4">
              <div className={cn(fs ? "px-3" : "px-2.5")}>
                <Skeleton className={cn("mb-2 rounded", fs ? "h-2.5 w-14" : "h-2 w-10")} />
              </div>
              <div className="space-y-0.5">
                {/* Each row mirrors SavedMessageItem: same padding, title + 2-line preview */}
                {["w-full", "w-4/5", "w-full"].map((lastLineW, i) => (
                  <div key={i} className={cn("rounded-md", fs ? "px-3 py-2.5" : "px-2.5 py-2")}>
                    {/* Conversation title — matches text-[10px]/text-[11px] */}
                    <Skeleton className={cn("mb-1 rounded", fs ? "h-2.5 w-20" : "h-2 w-16")} />
                    {/* Content preview — matches text-xs/text-sm, line-clamp-2 */}
                    <div className="space-y-1">
                      <Skeleton className={cn("w-full rounded", fs ? "h-3.5" : "h-3")} />
                      <Skeleton className={cn("rounded", lastLineW, fs ? "h-3.5" : "h-3")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (savedMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6">
        <Bookmark className={icon.emptyState} />
        <p className={cn("text-muted-foreground text-center", fs ? "text-lg" : "text-sm")}>
          Nenhuma mensagem salva.
          <br />
          Clique no <Bookmark className="mb-0.5 inline h-3.5 w-3.5" /> nas mensagens para salvar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className={cn(fs ? "p-3" : "p-2")}>
          {groups.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <h5
                className={cn(
                  "text-muted-foreground mb-2 font-medium uppercase tracking-wider",
                  fs ? "px-3 text-[11px]" : "px-2.5 text-[10px]",
                )}
              >
                {group.label}
              </h5>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SavedMessageItem
                    key={item.identificador}
                    item={item}
                    fullscreen={fs}
                    onSelect={() => onSelecionarConversa(item.conversaId)}
                    onUnsave={() => void unsaveMessage(item.mensagemId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SavedMessageItem({
  item,
  fullscreen,
  onSelect,
  onUnsave,
}: {
  readonly item: SavedMessage;
  readonly fullscreen?: boolean;
  readonly onSelect: () => void;
  readonly onUnsave: () => void;
}) {
  const fs = fullscreen;

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-md transition-colors hover:bg-muted/50",
        fs ? "px-3 py-2.5" : "px-2.5 py-2",
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
    >
      {/* Conversation title */}
      <p
        className={cn(
          "text-muted-foreground mb-1 truncate",
          fs ? "text-[11px]" : "text-[10px]",
        )}
      >
        {item.tituloConversa}
      </p>

      {/* Message content preview */}
      <p
        className={cn(
          "line-clamp-2",
          fs ? "text-sm" : "text-xs",
        )}
      >
        {item.papel === "usuario" ? "Você: " : "Fortuna: "}
        {item.conteudo.slice(0, 200)}
      </p>

      {/* Unsave button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUnsave();
        }}
        type="button"
        className={cn(
          "absolute top-2 right-2 inline-flex items-center justify-center rounded-md transition-opacity hover:bg-muted",
          "text-primary opacity-0 group-hover:opacity-100",
          fs ? "h-7 w-7" : "h-6 w-6",
        )}
        aria-label="Remover dos salvos"
      >
        <Bookmark className={cn("fill-current", fs ? "h-4 w-4" : "h-3.5 w-3.5")} />
      </button>
    </div>
  );
}
