import { useState, useCallback } from "react";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";

type StatusImportacao = "idle" | "validando" | "sucesso" | "erro";

interface ImportacaoManualResult {
  sucesso: boolean;
  metadados?: ReportMetadata;
  erro?: string;
}

export function useImportacaoManual() {
  const [statusImportacao, setStatusImportacao] = useState<StatusImportacao>("idle");
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [metadadosResultado, setMetadadosResultado] =
    useState<ReportMetadata | null>(null);

  const submeterJson = useCallback(
    async (jsonBruto: string): Promise<ImportacaoManualResult> => {
      setStatusImportacao("validando");
      setErroImportacao(null);
      setMetadadosResultado(null);

      try {
        const resposta = await fetch("/api/reports/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: jsonBruto }),
        });

        const dados = (await resposta.json()) as ImportacaoManualResult & {
          codigo?: string;
        };

        if (!resposta.ok) {
          const mensagemErro = dados.erro ?? "Falha na validacao";
          setStatusImportacao("erro");
          setErroImportacao(mensagemErro);
          return { sucesso: false, erro: mensagemErro };
        }

        setStatusImportacao("sucesso");
        setMetadadosResultado(dados.metadados ?? null);
        return { sucesso: true, metadados: dados.metadados };
      } catch (erro) {
        const mensagemErro =
          erro instanceof Error ? erro.message : "Erro desconhecido";
        setStatusImportacao("erro");
        setErroImportacao(mensagemErro);
        return { sucesso: false, erro: mensagemErro };
      }
    },
    [],
  );

  const resetar = useCallback(() => {
    setStatusImportacao("idle");
    setErroImportacao(null);
    setMetadadosResultado(null);
  }, []);

  return {
    submeterJson,
    resetar,
    statusImportacao,
    erroImportacao,
    metadadosResultado,
    estaValidando: statusImportacao === "validando",
  };
}
