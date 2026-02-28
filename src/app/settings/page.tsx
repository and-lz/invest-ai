"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { GeminiApiKeyForm } from "@/components/settings/gemini-api-key-form";
import { ApiKeyInfo } from "@/components/settings/api-key-info";
import { typography, icon, layout } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) return;
        const data = await response.json();
        setIsKeyConfigured(data.geminiApiKeyConfigured);
      } catch {
        // Silently fail — page still works without loading status
      }
    }

    loadSettings();
  }, []);

  function handleSuccess() {
    setIsKeyConfigured(true);
  }

  return (
    <div className={cn(layout.pageSpacing, "max-w-2xl mx-auto py-6")}>
      <div className={cn(layout.pageHeader, "mb-6")}>
        <Settings className={cn(icon.pageTitle, "text-primary")} />
        <h1 className={typography.h1}>Configurações</h1>
      </div>

      <div className={cn(layout.sectionSpacing)}>
        <GeminiApiKeyForm onSuccess={handleSuccess} isKeyConfigured={isKeyConfigured} />
        <ApiKeyInfo />
      </div>
    </div>
  );
}
