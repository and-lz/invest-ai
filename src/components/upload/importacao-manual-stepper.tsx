"use client";

import { useState, useCallback } from "react";
import { PromptExtracaoCopiavel } from "./prompt-extracao-copiavel";
import { FormularioJsonManual } from "./formulario-json-manual";

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

  if (passoAtual === "copiar-prompt") {
    return <PromptExtracaoCopiavel onProximoPasso={avancarParaColarJson} />;
  }

  return (
    <FormularioJsonManual
      onImportacaoSucesso={onImportacaoSucesso}
      onVoltar={voltarParaCopiarPrompt}
    />
  );
}
