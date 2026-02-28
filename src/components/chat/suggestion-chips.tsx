"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface SuggestionChipsProps {
  readonly suggestions: readonly ChatSuggestion[];
  readonly onSelect: (text: string) => void;
  readonly filterText?: string;
  readonly variant: "empty-state" | "follow-up";
}

export function SuggestionChips({
  suggestions,
  onSelect,
  filterText,
  variant,
}: SuggestionChipsProps) {
  const filtered = useMemo(() => {
    if (!filterText || filterText.length < 2) return suggestions;
    const lower = filterText.toLowerCase();
    return suggestions.filter(
      (s) => s.label.toLowerCase().includes(lower) || s.text.toLowerCase().includes(lower),
    );
  }, [suggestions, filterText]);

  if (filtered.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        variant === "empty-state" && "justify-center px-4",
        variant === "follow-up" && "px-3 pt-2",
      )}
      role="group"
      aria-label="Sugestoes de perguntas"
    >
      {filtered.map((suggestion) => (
        <button
          key={suggestion.label}
          type="button"
          onClick={() => onSelect(suggestion.text)}
          className={cn(
            "text-xs",
            "bg-secondary hover:bg-secondary/80 rounded-full border px-3 py-1.5",
            "cursor-pointer transition-colors",
            "text-foreground hover:border-primary/30",
          )}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}
