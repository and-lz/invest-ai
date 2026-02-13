import { useState, useCallback } from "react";
import { adicionarTarefaAtivaNoStorage } from "@/components/layout/indicador-tarefa-ativa";

type StatusUpload = "idle" | "uploading" | "success" | "error";

interface RespostaApiUpload {
  identificadorTarefa?: string;
  status?: string;
  erro?: string;
  codigo?: string;
}

interface UploadResult {
  sucesso: boolean;
  identificadorTarefa?: string;
  erro?: string;
}

export function useUploadReport() {
  const [statusUpload, setStatusUpload] = useState<StatusUpload>("idle");
  const [erroUpload, setErroUpload] = useState<string | null>(null);
  const [identificadorTarefa, setIdentificadorTarefa] = useState<string | null>(null);

  const fazerUpload = useCallback(async (arquivo: File, senha?: string): Promise<UploadResult> => {
    setStatusUpload("uploading");
    setErroUpload(null);
    setIdentificadorTarefa(null);

    try {
      const formData = new FormData();
      formData.append("file", arquivo);
      if (senha) {
        formData.append("password", senha);
      }

      const resposta = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const dados = (await resposta.json()) as RespostaApiUpload;

      if (!resposta.ok) {
        const mensagemErro = dados.erro ?? "Falha no upload";
        setStatusUpload("error");
        setErroUpload(mensagemErro);
        return { sucesso: false, erro: mensagemErro };
      }

      // 202 Accepted: processamento em background
      if (dados.identificadorTarefa) {
        adicionarTarefaAtivaNoStorage(dados.identificadorTarefa);
        setIdentificadorTarefa(dados.identificadorTarefa);
      }

      setStatusUpload("success");
      return { sucesso: true, identificadorTarefa: dados.identificadorTarefa };
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
    setIdentificadorTarefa(null);
  }, []);

  return {
    fazerUpload,
    resetar,
    statusUpload,
    erroUpload,
    identificadorTarefa,
    estaProcessando: statusUpload === "uploading",
  };
}
