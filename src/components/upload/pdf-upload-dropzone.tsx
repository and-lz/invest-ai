"use client";

import { useCallback, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, XCircle, Loader2, Lock } from "lucide-react";
import { useUploadReport } from "@/hooks/use-upload-report";
import { cn } from "@/lib/utils";

interface PdfUploadDropzoneProps {
  onUploadSucesso?: (identificador: string) => void;
}

export function PdfUploadDropzone({ onUploadSucesso }: PdfUploadDropzoneProps) {
  const [estaSobreDropzone, setEstaSobreDropzone] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [senhaPdf, setSenhaPdf] = useState<string>("");
  const [mostrarCampoSenha, setMostrarCampoSenha] = useState(false);
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
    },
    [validarArquivo],
  );

  const confirmarUpload = useCallback(async () => {
    if (!arquivoSelecionado) return;
    const resultado = await fazerUpload(arquivoSelecionado, senhaPdf || undefined);
    if (resultado.sucesso && resultado.metadados) {
      onUploadSucesso?.(resultado.metadados.identificador);
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
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = "";
    }
  }, [resetar]);

  return (
    <Card>
      <CardContent className="p-6">
        {statusUpload === "success" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Upload concluido!</h3>
              <p className="text-muted-foreground text-sm">Relatorio processado com sucesso.</p>
            </div>
            <Button variant="outline" onClick={handleNovoUpload}>
              Enviar outro relatorio
            </Button>
          </div>
        ) : statusUpload === "error" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <XCircle className="h-12 w-12 text-red-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Erro no processamento</h3>
              <p className="text-sm text-red-600">{erroUpload}</p>
            </div>
            <Button variant="outline" onClick={handleNovoUpload}>
              Tentar novamente
            </Button>
          </div>
        ) : mostrarCampoSenha && arquivoSelecionado ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <FileText className="text-primary h-12 w-12" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Arquivo selecionado</h3>
              <p className="text-muted-foreground text-sm">{arquivoSelecionado.name}</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-pdf" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha do PDF (opcional)
                </Label>
                <Input
                  id="senha-pdf"
                  type="password"
                  placeholder="Deixe em branco se não tiver senha"
                  value={senhaPdf}
                  onChange={(e) => setSenhaPdf(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void confirmarUpload();
                    }
                  }}
                />
                <p className="text-muted-foreground text-xs">
                  Se o PDF estiver protegido por senha, informe acima.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmarUpload}
                  className="flex-1"
                  disabled={estaProcessando}
                >
                  {estaProcessando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Processar relatório"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNovoUpload}
                  disabled={estaProcessando}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors",
              estaSobreDropzone ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              estaProcessando && "pointer-events-none opacity-60",
            )}
          >
            {estaProcessando ? (
              <>
                <Loader2 className="text-primary h-12 w-12 animate-spin" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">
                    {statusUpload === "uploading" ? "Enviando arquivo..." : "Processando com IA..."}
                  </h3>
                  <p className="text-muted-foreground text-sm">{arquivoSelecionado?.name}</p>
                  {statusUpload === "processing" && (
                    <div className="text-muted-foreground text-xs space-y-1">
                      <p>Extraindo dados do relatório com IA...</p>
                      <p>Extraindo dados de todas as páginas do relatório.</p>
                      <p className="text-xs text-gray-500">
                        Isso pode levar alguns minutos. Aguarde...
                      </p>
                    </div>
                  )}
                </div>
                <Progress
                  value={statusUpload === "uploading" ? 30 : 70}
                  className="w-64"
                />
              </>
            ) : (
              <>
                {arquivoSelecionado ? (
                  <FileText className="text-muted-foreground h-12 w-12" />
                ) : (
                  <Upload className="text-muted-foreground h-12 w-12" />
                )}
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Arraste seu relatorio PDF aqui</h3>
                  <p className="text-muted-foreground text-sm">
                    ou clique para selecionar (max 32MB)
                  </p>
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
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
