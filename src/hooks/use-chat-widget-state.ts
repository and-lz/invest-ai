"use client";

import { useState, useCallback, useEffect } from "react";
import type { ClaudeModelTier } from "@/lib/model-tiers";

export function useChatWidgetState() {
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [raciocinio, setRaciocinio] = useState(true);
  const [modelTier, setModelTier] = useState<ClaudeModelTier>("sonnet");

  useEffect(() => {
    const stored = localStorage.getItem("chatReasoningEnabled");
    setRaciocinio(stored === null ? true : stored === "true");
    const storedTier = localStorage.getItem("chatModelTier");
    if (storedTier === "haiku" || storedTier === "sonnet" || storedTier === "opus") {
      setModelTier(storedTier);
    }
  }, []);

  const handleRaciocinioChange = useCallback((enabled: boolean) => {
    setRaciocinio(enabled);
    localStorage.setItem("chatReasoningEnabled", String(enabled));
  }, []);

  const handleModelTierChange = useCallback((tier: ClaudeModelTier) => {
    setModelTier(tier);
    localStorage.setItem("chatModelTier", tier);
  }, []);

  const toggleSidebar = useCallback(() => {
    setMostrarSidebar((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setMostrarSidebar(false);
  }, []);

  const toggleTts = useCallback((stopSpeech: () => void) => {
    setTtsEnabled((v) => {
      if (v) stopSpeech();
      return !v;
    });
  }, []);

  return {
    mostrarSidebar,
    setMostrarSidebar,
    ttsEnabled,
    setTtsEnabled,
    raciocinio,
    modelTier,
    handleRaciocinioChange,
    handleModelTierChange,
    toggleSidebar,
    closeSidebar,
    toggleTts,
  };
}
