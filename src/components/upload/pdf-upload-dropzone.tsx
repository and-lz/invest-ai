"use client";

import { useCallback, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUploadReport } from "@/hooks/use-upload-report";
import { cn } from "@/lib/utils";

interface PdfUploadDropzoneProps {
  onUploadSucesso?: (identificador: string) => void;
}

export function PdfUploadDropzone({ onUploadSucesso }: PdfUploadDropzoneProps) {
  const [estaSobreDropzone, setEstaSobreDropzone] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const { fazerUpload, resetar, statusUpload, erroUpload, estaProcessando } =
    useUploadReport();

  const validarArquivo = useCallback((arquivo: File): boolean => {
    if (!arquivo.name.toLowerCase().endsWith(".pdf")) {
      return false;
    }
    if (arquivo.size > 32 * 1024 * 1024) {
      return false;
    }
    return true;
  }, []);

  const processarArquivo = useCallback(
    async (arquivo: File) => {
      if (!validarArquivo(arquivo)) return;
      setArquivoSelecionado(arquivo);
      const resultado = await fazerUpload(arquivo);
      if (resultado.sucesso && resultado.metadados) {
        onUploadSucesso?.(resultado.metadados.identificador);
      }
    },
    [validarArquivo, fazerUpload, onUploadSucesso],
  );

  const handleDrop = useCallback(
    (evento: React.DragEvent) => {
      evento.preventDefault();
      setEstaSobreDropzone(false);
      const arquivo = evento.dataTransfer.files[0];
      if (arquivo) {
        void processarArquivo(arquivo);
      }
    },
    [processarArquivo],
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
        void processarArquivo(arquivo);
      }
    },
    [processarArquivo],
  );

  const handleNovoUpload = useCallback(() => {
    resetar();
    setArquivoSelecionado(null);
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
              <p className="text-sm text-muted-foreground">
                Relatorio processado com sucesso.
              </p>
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
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors",
              estaSobreDropzone
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
              estaProcessando && "pointer-events-none opacity-60",
            )}
          >
            {estaProcessando ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {statusUpload === "uploading"
                      ? "Enviando arquivo..."
                      : "Processando com IA..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {arquivoSelecionado?.name}
                  </p>
                </div>
                <Progress
                  value={statusUpload === "uploading" ? 30 : 70}
                  className="w-64"
                />
              </>
            ) : (
              <>
                {arquivoSelecionado ? (
                  <FileText className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    Arraste seu relatorio PDF aqui
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
                <Button
                  variant="outline"
                  onClick={() => inputArquivoRef.current?.click()}
                >
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
