"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface SuggestionChipsProps {
  readonly suggestions: readonly ChatSuggestion[];
  readonly onSelect: (text: string) => void;
  readonly filterText?: string;
  readonly variant: "empty-state" | "follow-up";
  readonly isLoading?: boolean;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  filterText,
  variant,
  isLoading,
}: SuggestionChipsProps) {
  const filtered = useMemo(() => {
    if (!filterText || filterText.length < 2) return suggestions;
    const lower = filterText.toLowerCase();
    return suggestions.filter(
      (s) => s.label.toLowerCase().includes(lower) || s.text.toLowerCase().includes(lower),
    );
  }, [suggestions, filterText]);

  if (filtered.length === 0 && !isLoading) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        variant === "empty-state" && "justify-center px-4",
        variant === "follow-up" && "px-3 pt-2",
      )}
      role="group"
      aria-label="Sugestoes de perguntas"
    >
      {isLoading && (
        <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
      )}
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
