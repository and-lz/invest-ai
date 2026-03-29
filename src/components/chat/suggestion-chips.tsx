"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface SuggestionChipsProps {
  readonly suggestions: readonly ChatSuggestion[];
  readonly onSelect: (text: string) => void;
  readonly filterText?: string;
  readonly variant: "empty-state" | "quick-reply";
  readonly isLoading?: boolean;
  readonly fullscreen?: boolean;
}

export function SuggestionChips({
  suggestions,
  onSelect,
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

  // Quick-reply: vertical stack, right-aligned, above the input
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-1.5",
        fs ? "mx-auto w-full max-w-4xl px-5 py-2" : "px-3 py-1.5",
      )}
      role="group"
      aria-label="Sugestoes de perguntas"
    >
      {isLoading && (
        <Loader2 className="text-muted-foreground h-3.5 w-3.5 shrink-0 animate-spin" />
      )}
      {filtered.map((suggestion) => (
        <button
          key={suggestion.label}
          type="button"
          onClick={() => onSelect(suggestion.text)}
          className={cn(
            "bg-secondary hover:bg-secondary/80 rounded-full border",
            "cursor-pointer transition-colors",
            "text-foreground hover:border-primary/30",
            fs ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1",
          )}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
