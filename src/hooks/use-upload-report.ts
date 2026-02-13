import { useState, useCallback, useEffect, useRef } from "react";
import type { ReportMetadata } from "@/schemas/report-metadata.schema";

type StatusUpload = "idle" | "uploading" | "processing" | "success" | "error";

interface UploadResult {
  sucesso: boolean;
  metadados?: ReportMetadata;
  erro?: string;
}

export function useUploadReport() {
  const [statusUpload, setStatusUpload] = useState<StatusUpload>("idle");
  const [erroUpload, setErroUpload] = useState<string | null>(null);
  const [metadadosResultado, setMetadadosResultado] = useState<ReportMetadata | null>(null);
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);
  const tempoInicioRef = useRef<number | null>(null);

  useEffect(() => {
    const estaAtivo = statusUpload === "uploading" || statusUpload === "processing";
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
  }, [statusUpload]);

  const fazerUpload = useCallback(async (arquivo: File, senha?: string): Promise<UploadResult> => {
    setStatusUpload("uploading");
    setErroUpload(null);
    setMetadadosResultado(null);
    setSegundosDecorridos(0);
    tempoInicioRef.current = Date.now();

    try {
      const formData = new FormData();
      formData.append("file", arquivo);
      if (senha) {
        formData.append("password", senha);
      }

      setStatusUpload("processing");

      const resposta = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const dados = (await resposta.json()) as UploadResult & { codigo?: string };

      if (!resposta.ok) {
        const mensagemErro = dados.erro ?? "Falha no upload";
        setStatusUpload("error");
        setErroUpload(mensagemErro);
        return { sucesso: false, erro: mensagemErro };
      }

      setStatusUpload("success");
      setMetadadosResultado(dados.metadados ?? null);
      return { sucesso: true, metadados: dados.metadados };
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : "Erro desconhecido";
      setStatusUpload("error");
      setErroUpload(mensagemErro);
      return { sucesso: false, erro: mensagemErro };
    }
  }, []);

  const resetar = useCallback(() => {
    setStatusUpload("idle");
    setErroUpload(null);
    setMetadadosResultado(null);
    setSegundosDecorridos(0);
    tempoInicioRef.current = null;
  }, []);

  return {
    fazerUpload,
    resetar,
    statusUpload,
    erroUpload,
    metadadosResultado,
    segundosDecorridos,
    estaProcessando: statusUpload === "uploading" || statusUpload === "processing",
  };
}
