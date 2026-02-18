"use client";

import { useCallback, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Lock, Loader2 } from "lucide-react";
import { useUploadReport } from "@/hooks/use-upload-report";
import { ResultadoUpload } from "./upload-result";
import { cn } from "@/lib/utils";
import { tipografia, icone } from "@/lib/design-system";

interface PdfUploadDropzoneProps {
  onUploadSucesso?: (identificadorTarefa: string) => void;
}

export function PdfUploadDropzone({ onUploadSucesso }: PdfUploadDropzoneProps) {
  const [estaSobreDropzone, setEstaSobreDropzone] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [senhaPdf, setSenhaPdf] = useState<string>("");
  const [mostrarCampoSenha, setMostrarCampoSenha] = useState(false);
  const [mostrarInputSenha, setMostrarInputSenha] = useState(false);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const { fazerUpload, resetar, statusUpload, erroUpload, estaProcessando } = useUploadReport();

  const validarArquivo = useCallback((arquivo: File): boolean => {
    if (!arquivo.name.toLowerCase().endsWith(".pdf")) {
      return false;
    }
    if (arquivo.size > 32 * 1024 * 1024) {
      return false;
    }
    return true;
  }, []);

  const selecionarArquivo = useCallback(
    (arquivo: File) => {
      if (!validarArquivo(arquivo)) return;
      setArquivoSelecionado(arquivo);
      setMostrarCampoSenha(true);
      setSenhaPdf("");
      setMostrarInputSenha(false);
    },
    [validarArquivo],
  );

  const confirmarUpload = useCallback(async () => {
    if (!arquivoSelecionado) return;
    const resultado = await fazerUpload(arquivoSelecionado, senhaPdf || undefined);
    if (resultado.sucesso && resultado.identificadorTarefa) {
      onUploadSucesso?.(resultado.identificadorTarefa);
    }
  }, [arquivoSelecionado, senhaPdf, fazerUpload, onUploadSucesso]);

  const handleDrop = useCallback(
    (evento: React.DragEvent) => {
      evento.preventDefault();
      setEstaSobreDropzone(false);
      const arquivo = evento.dataTransfer.files[0];
      if (arquivo) {
        selecionarArquivo(arquivo);
      }
    },
    [selecionarArquivo],
  );

  const handleDragOver = useCallback((evento: React.DragEvent) => {
    evento.preventDefault();
    setEstaSobreDropzone(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setEstaSobreDropzone(false);
  }, []);

  const handleSelecionarArquivo = useCallback(
    (evento: React.ChangeEvent<HTMLInputElement>) => {
      const arquivo = evento.target.files?.[0];
      if (arquivo) {
        selecionarArquivo(arquivo);
      }
    },
    [selecionarArquivo],
  );

  const handleNovoUpload = useCallback(() => {
    resetar();
    setArquivoSelecionado(null);
    setSenhaPdf("");
    setMostrarCampoSenha(false);
    setMostrarInputSenha(false);
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = "";
    }
  }, [resetar]);

  if (statusUpload === "success") {
    return (
      <Card>
        <CardContent className="p-6">
          <ResultadoUpload
            tipo="sucesso"
            titulo="Upload aceito!"
            mensagem="O relatório está sendo processado em background. Você será notificado quando concluir."
            rotuloAcao="Enviar outro relatorio"
            onAcao={handleNovoUpload}
          />
        </CardContent>
      </Card>
    );
  }

  if (statusUpload === "error") {
    return (
      <Card>
        <CardContent className="p-6">
          <ResultadoUpload
            tipo="erro"
            titulo="Erro no processamento"
            mensagem={erroUpload ?? "Erro desconhecido"}
            rotuloAcao="Tentar novamente"
            onAcao={handleNovoUpload}
          />
        </CardContent>
      </Card>
    );
  }

  if (estaProcessando) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 py-12">
          <Loader2 className={cn(icone.carregandoGrande, "text-muted-foreground")} />
          <p className="text-muted-foreground text-sm">Enviando arquivo...</p>
        </CardContent>
      </Card>
    );
  }

  if (mostrarCampoSenha && arquivoSelecionado) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 py-8">
            <FileText className="text-primary h-12 w-12" />
            <div className="space-y-2 text-center">
              <h3 className={tipografia.h3}>Arquivo selecionado</h3>
              <p className="text-muted-foreground text-sm">{arquivoSelecionado.name}</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              {mostrarInputSenha ? (
                <div className="space-y-2">
                  <Label htmlFor="senha-pdf" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Senha do PDF
                  </Label>
                  <Input
                    id="senha-pdf"
                    type="password"
                    placeholder="Digite a senha do PDF"
                    value={senhaPdf}
                    onChange={(e) => setSenhaPdf(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void confirmarUpload();
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarInputSenha(true)}
                  className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-1.5 text-xs underline-offset-4 transition-colors hover:underline"
                >
                  <Lock className="h-4 w-4" />
                  Meu PDF tem senha
                </button>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={confirmarUpload} className="flex-1">
                  Processar relatorio
                </Button>
                <Button variant="outline" onClick={handleNovoUpload}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-6 transition-colors md:p-12",
        estaSobreDropzone ? "border-primary bg-primary/5" : "border-muted-foreground/25",
      )}
    >
      <Upload className={icone.estadoVazio} />
      <div className="text-center">
        <h3 className={tipografia.h3}>Arraste seu relatorio PDF aqui</h3>
        <p className="text-muted-foreground text-sm">ou clique para selecionar (max 32MB)</p>
      </div>
      <input
        ref={inputArquivoRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleSelecionarArquivo}
      />
      <Button variant="outline" onClick={() => inputArquivoRef.current?.click()}>
        Selecionar arquivo
      </Button>
    </div>
  );
}
