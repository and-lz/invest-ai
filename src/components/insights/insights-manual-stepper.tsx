"use client";

import { useState, useCallback } from "react";
import { PromptInsightsCopiavel } from "./prompt-insights-copiavel";
import { FormularioInsightsManual } from "./formulario-insights-manual";
import type { InsightsResponse } from "@/schemas/insights.schema";

type PassoInsightsManual = "copiar-prompt" | "colar-json";

interface InsightsManualStepperProps {
  identificadorRelatorio: string;
  onInsightsSalvos: (insights: InsightsResponse) => void;
  onCancelar: () => void;
}

export function InsightsManualStepper({
  identificadorRelatorio,
  onInsightsSalvos,
  onCancelar,
}: InsightsManualStepperProps) {
  const [passoAtual, setPassoAtual] =
    useState<PassoInsightsManual>("copiar-prompt");

  const avancarParaColarJson = useCallback(() => {
    setPassoAtual("colar-json");
  }, []);

  const voltarParaCopiarPrompt = useCallback(() => {
    setPassoAtual("copiar-prompt");
  }, []);

  if (passoAtual === "copiar-prompt") {
    return (
      <div className="space-y-4">
        <PromptInsightsCopiavel
          identificadorRelatorio={identificadorRelatorio}
          onProximoPasso={avancarParaColarJson}
        />
        <div className="flex justify-center">
          <button
            onClick={onCancelar}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormularioInsightsManual
      identificadorRelatorio={identificadorRelatorio}
      onInsightsSalvos={onInsightsSalvos}
      onVoltar={voltarParaCopiarPrompt}
    />
  );
}
