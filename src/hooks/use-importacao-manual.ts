import { useState, useCallback, useEffect, useRef } from "react";
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
  const [metadadosResultado, setMetadadosResultado] = useState<ReportMetadata | null>(null);
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);
  const tempoInicioRef = useRef<number | null>(null);

  useEffect(() => {
    const estaAtivo = statusImportacao === "validando";
    if (!estaAtivo) {
      tempoInicioRef.current = null;
      return;
    }

    const intervalId = setInterval(() => {
      if (tempoInicioRef.current) {
        setSegundosDecorridos(Math.floor((Date.now() - tempoInicioRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [statusImportacao]);

  const submeterJson = useCallback(async (jsonBruto: string): Promise<ImportacaoManualResult> => {
    setStatusImportacao("validando");
    setErroImportacao(null);
    setMetadadosResultado(null);
    setSegundosDecorridos(0);
    tempoInicioRef.current = Date.now();

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
      const mensagemErro = erro instanceof Error ? erro.message : "Erro desconhecido";
      setStatusImportacao("erro");
      setErroImportacao(mensagemErro);
      return { sucesso: false, erro: mensagemErro };
    }
  }, []);

  const resetar = useCallback(() => {
    setStatusImportacao("idle");
    setErroImportacao(null);
    setMetadadosResultado(null);
    setSegundosDecorridos(0);
    tempoInicioRef.current = null;
  }, []);

  return {
    submeterJson,
    resetar,
    statusImportacao,
    erroImportacao,
    metadadosResultado,
    segundosDecorridos,
    estaValidando: statusImportacao === "validando",
  };
}
