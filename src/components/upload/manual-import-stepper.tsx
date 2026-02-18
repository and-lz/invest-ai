"use client";

import { useState, useCallback } from "react";
import { PromptExtracaoCopiavel } from "./copyable-extraction-prompt";
import { FormularioJsonManual } from "./manual-json-form";
import { IndicadorPassos } from "./step-indicator";

type PassoImportacao = "copiar-prompt" | "colar-json";

interface ImportacaoManualStepperProps {
  onImportacaoSucesso?: (identificador: string) => void;
}

export function ImportacaoManualStepper({ onImportacaoSucesso }: ImportacaoManualStepperProps) {
  const [passoAtual, setPassoAtual] = useState<PassoImportacao>("copiar-prompt");

  const avancarParaColarJson = useCallback(() => {
    setPassoAtual("colar-json");
  }, []);

  const voltarParaCopiarPrompt = useCallback(() => {
    setPassoAtual("copiar-prompt");
  }, []);

  const passosIndicador = [
    {
      numero: 1,
      rotulo: "Copiar prompt",
      status: passoAtual === "copiar-prompt" ? ("ativo" as const) : ("concluido" as const),
    },
    {
      numero: 2,
      rotulo: "Colar resposta",
      status: passoAtual === "colar-json" ? ("ativo" as const) : ("pendente" as const),
    },
  ];

  return (
    <div className="space-y-4">
      <IndicadorPassos passos={passosIndicador} />
      {passoAtual === "copiar-prompt" ? (
        <PromptExtracaoCopiavel onProximoPasso={avancarParaColarJson} />
      ) : (
        <FormularioJsonManual
          onImportacaoSucesso={onImportacaoSucesso}
          onVoltar={voltarParaCopiarPrompt}
        />
      )}
    </div>
  );
}
