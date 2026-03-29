"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatSuggestion } from "@/lib/chat-suggestions";

interface SuggestionChipsProps {
  readonly suggestions: readonly ChatSuggestion[];
  readonly onSelect: (text: string) => void;
  readonly filterText?: string;
  readonly variant: "empty-state" | "floating";
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
  const [collapsed, setCollapsed] = useState(false);
  const prevSuggestionsRef = useRef(suggestions);

  // Reset to expanded when suggestions change (new assistant response)
  useEffect(() => {
    if (suggestions !== prevSuggestionsRef.current && suggestions.length > 0) {
      setCollapsed(false);
    }
    prevSuggestionsRef.current = suggestions;
  }, [suggestions]);

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

  // Floating variant
  return (
    <div
      className={cn(
        "pointer-events-auto absolute bottom-3 right-3 z-10 flex items-end gap-1.5",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
      )}
      role="group"
      aria-label="Sugestoes de perguntas"
    >
      {/* Chevron toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          "bg-background/80 backdrop-blur-sm border shrink-0",
          "h-7 w-7 rounded-full",
          "text-muted-foreground hover:text-foreground",
        )}
        title={collapsed ? "Mostrar sugestoes" : "Ocultar sugestoes"}
      >
        {collapsed ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Suggestion chips */}
      {!collapsed && (
        <div
          className={cn(
            "bg-background/80 backdrop-blur-sm rounded-xl border p-2",
            "flex flex-col items-end gap-1.5",
            "animate-in fade-in slide-in-from-right-2 duration-150",
            fs ? "max-w-xs" : "max-w-[200px]",
          )}
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
                "bg-secondary hover:bg-secondary/80 rounded-full border",
                "cursor-pointer transition-colors",
                "text-foreground hover:border-primary/30",
                "w-full truncate text-right",
                fs ? "text-sm px-4 py-2" : "text-xs px-3 py-1.5",
              )}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
