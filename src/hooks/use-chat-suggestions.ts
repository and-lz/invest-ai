"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ChatSuggestion } from "@/lib/chat-suggestions";
import type { IdentificadorPagina } from "@/schemas/chat.schema";

const DEBOUNCE_MS = 600;
const MIN_INPUT_LENGTH = 3;

interface UseChatSuggestionsOptions {
  readonly input: string;
  readonly pageId: IdentificadorPagina;
  readonly recentMessages: readonly string[];
  readonly enabled: boolean;
}

interface UseChatSuggestionsReturn {
  readonly suggestions: readonly ChatSuggestion[];
  readonly isLoading: boolean;
}

export function useChatSuggestions({
  input,
  pageId,
  recentMessages,
  enabled,
}: UseChatSuggestionsOptions): UseChatSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(
    async (text: string, signal: AbortSignal) => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chat/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: text,
            pageId,
            recentMessages: recentMessages.slice(-4),
          }),
          signal,
        });

        if (!response.ok || signal.aborted) return;

        const data = (await response.json()) as { suggestions?: string[] };
        if (signal.aborted) return;

        const parsed: ChatSuggestion[] = (data.suggestions ?? []).map((s) => ({
          label: s,
          text: s,
        }));
        setSuggestions(parsed);
      } catch {
        // Aborted or network error — silent fail
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [pageId, recentMessages],
  );

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const trimmed = input.trim();

    // Don't fetch if disabled or input too short
    if (!enabled || trimmed.length < MIN_INPUT_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Debounce the request
    timeoutRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      void fetchSuggestions(trimmed, controller.signal);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, enabled, fetchSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { suggestions, isLoading };
}
