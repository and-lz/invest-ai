"use client";

import { useMemo } from "react";
import { Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface SuggestionChipsProps {
  readonly suggestions: readonly ChatSuggestion[];
  readonly onSelect: (text: string) => void;
  readonly onPrefill?: (text: string) => void;
  readonly filterText?: string;
  readonly variant: "empty-state" | "quick-reply";
  readonly isLoading?: boolean;
  readonly fullscreen?: boolean;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  onPrefill,
  filterText,
  variant,
  isLoading,
  fullscreen,
}: SuggestionChipsProps) {
  const filtered = useMemo(() => {
    if (!filterText || filterText.length < 2) return suggestions;
    const lower = filterText.toLowerCase();
    return suggestions.filter(
      (s) => s.label.toLowerCase().includes(lower) || s.text.toLowerCase().includes(lower),
    );
  }, [suggestions, filterText]);

  const fs = fullscreen;

  if (filtered.length === 0 && !isLoading) return null;

  if (variant === "empty-state") {
    return (
      <div
        className="flex flex-wrap items-center justify-center gap-2 px-4"
        role="group"
        aria-label="Sugestoes de perguntas"
      >
        {filtered.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              "bg-secondary hover:bg-secondary/80 rounded-full border",
              "cursor-pointer transition-colors",
              "text-foreground hover:border-primary/30",
              fs ? "text-sm px-4 py-2" : "text-xs px-3 py-1.5",
            )}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    );
  }

  // Quick-reply: standalone horizontal scrollable row above the input
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-none pb-1",
        fs ? "px-5" : "px-3",
      )}
      role="group"
      aria-label="Sugestoes de perguntas"
    >
      {isLoading && (
        <Loader2 className="text-muted-foreground h-3.5 w-3.5 shrink-0 animate-spin" />
      )}
      {filtered.map((suggestion) => (
        <div
          key={suggestion.label}
          className={cn(
            "group flex shrink-0 items-center",
            "rounded-full border border-primary/40 bg-card",
            "text-primary",
            fs ? "text-xs" : "text-xs",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(suggestion.text)}
            aria-label={`Enviar: ${suggestion.label}`}
            className={cn(
              "cursor-pointer rounded-l-full px-3 py-1 transition-colors",
              "hover:bg-muted transition-colors",
              onPrefill ? "rounded-r-none pr-2" : "rounded-r-full",
            )}
          >
            {suggestion.label}
          </button>
          {onPrefill && (
            <>
              <span className="h-3 w-px shrink-0 bg-border/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              <button
                type="button"
                onClick={() => onPrefill(suggestion.text)}
                aria-label={`Editar sugestão: ${suggestion.label}`}
                className={cn(
                  "cursor-pointer rounded-r-full px-2 py-1 transition-all",
                  "hover:bg-muted",
                  "opacity-0 group-hover:opacity-100",
                )}
              >
                <Pencil className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
