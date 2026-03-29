"use client";

import { useState } from "react";
import { ListaConversas } from "@/components/chat/conversations-list";
import { SavedMessagesList } from "@/components/chat/saved-messages-list";
import { cn } from "@/lib/utils";

type SidebarTab = "conversas" | "salvos";

interface SidebarTabsProps {
  readonly conversaAtualId: string | null;
  readonly onSelecionarConversa: (identificador: string) => void;
  readonly onNovaConversa: () => void;
  readonly fullscreen?: boolean;
  readonly useLinks?: boolean;
}

export function SidebarTabs({
  conversaAtualId,
  onSelecionarConversa,
  onNovaConversa,
  fullscreen,
  useLinks,
}: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("conversas");
  const fs = fullscreen;

  return (
    <div className="flex h-full flex-col">
      {/* Tab header */}
      <div className={cn("flex border-b", fs ? "px-3" : "px-2")}>
        <button
          type="button"
          onClick={() => setActiveTab("conversas")}
          className={cn(
            "flex-1 py-2.5 text-center font-medium transition-colors",
            fs ? "text-sm" : "text-xs",
            activeTab === "conversas"
              ? "border-primary text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Conversas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("salvos")}
          className={cn(
            "flex-1 py-2.5 text-center font-medium transition-colors",
            fs ? "text-sm" : "text-xs",
            activeTab === "salvos"
              ? "border-primary text-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Salvos
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1">
        {activeTab === "conversas" ? (
          <ListaConversas
            conversaAtualId={conversaAtualId}
            onSelecionarConversa={onSelecionarConversa}
            onNovaConversa={onNovaConversa}
            fullscreen={fs}
            useLinks={useLinks}
          />
        ) : (
          <SavedMessagesList
            onSelecionarConversa={onSelecionarConversa}
            fullscreen={fs}
          />
        )}
      </div>
    </div>
  );
}
