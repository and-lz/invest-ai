"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { PdfUploadDropzone } from "@/components/upload/pdf-upload-dropzone";
import { ImportacaoManualStepper } from "@/components/upload/manual-import-stepper";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, FileText, Upload, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificar } from "@/lib/notifier";
import { tipografia, icone, layout, dialog } from "@/lib/design-system";

export default function ReportsPage() {
  const router = useRouter();
  const { relatorios, estaCarregando, revalidar } = useReports();

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useChatPageContext();
  useEffect(() => {
    definirContexto("reports");
  }, [definirContexto]);
  const [metodoUploadSelecionado, setMetodoUploadSelecionado] = useState<"automatico" | "manual">(
    "automatico",
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  const abrirDialog = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const fecharDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleUploadAceito = useCallback(() => {
    notificar.success("Upload aceito!", {
      description:
        "O relatório está sendo processado em background. Você será notificado quando concluir.",
      actionUrl: "/",
      actionLabel: "Ver dashboard",
    });
    fecharDialog();
    router.push("/");
  }, [router, fecharDialog]);

  const handleImportacaoManualSucesso = useCallback(
    (identificador: string) => {
      notificar.success("Relatorio importado com sucesso!", {
        description: `Referencia: ${identificador}`,
        actionUrl: "/",
        actionLabel: "Ver dashboard",
      });
      fecharDialog();
      router.push("/");
    },
    [router, fecharDialog],
  );

  const handleRemover = useCallback(
    async (identificador: string) => {
      try {
        const resposta = await fetch(`/api/reports/${identificador}`, {
          method: "DELETE",
        });
        if (resposta.ok) {
          notificar.success("Relatorio removido");
          await revalidar();
        }
      } catch {
        notificar.error("Falha ao remover relatorio");
      }
    },
    [revalidar],
  );

  return (
    <div className={layout.espacamentoPagina}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={layout.headerPagina}>
          <FileText
            className={cn(icone.tituloPagina, "text-muted-foreground")}
            aria-hidden="true"
          />
          <Header titulo="Relatorios" descricao="Historico de relatorios importados" />
        </div>
        <Button onClick={abrirDialog} className="gap-2">
          <Upload className={icone.botao} />
          Importar Novo Relatorio
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Importar relatório"
        className={cn(
          "bg-background max-h-[85vh] overflow-y-auto rounded-lg border p-0 shadow-lg",
          dialog.backdrop,
        )}
        style={{
          maxWidth: "42rem",
          width: "90vw",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
        }}
      >
        <div className="flex items-center justify-between border-b p-6">
          <h2 className={tipografia.h3}>Importar Relatorio</h2>
          <Button variant="ghost" size="icon" onClick={fecharDialog}>
            <X className={icone.botao} />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex gap-2">
            <Button
              variant={metodoUploadSelecionado === "automatico" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetodoUploadSelecionado("automatico")}
              className="gap-1.5"
            >
              <Upload className={icone.botao} />
              Upload Direto
              <span className="bg-background/80 rounded px-1 py-0.5 text-[9px] leading-none font-medium">
                REC
              </span>
            </Button>
            <Button
              variant={metodoUploadSelecionado === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetodoUploadSelecionado("manual")}
              className="gap-1.5"
            >
              <MessageSquare className={icone.botao} />
              Via Chat
            </Button>
          </div>

          {metodoUploadSelecionado === "automatico" && (
            <PdfUploadDropzone onUploadSucesso={handleUploadAceito} />
          )}
          {metodoUploadSelecionado === "manual" && (
            <ImportacaoManualStepper onImportacaoSucesso={handleImportacaoManualSucesso} />
          )}
        </div>
      </dialog>

      {/* Lista de Histórico */}
      <section className="space-y-4">
        {estaCarregando && <Skeleton className="h-64" />}

        {!estaCarregando && relatorios.length === 0 && (
          <Card>
            <CardContent className={layout.estadoVazioCard}>
              <FileText className={icone.estadoVazio} />
              <p className="text-muted-foreground mb-4">Nenhum relatorio encontrado.</p>
              <Button onClick={abrirDialog}>Importar Primeiro Relatorio</Button>
            </CardContent>
          </Card>
        )}

        {!estaCarregando && relatorios.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referencia</TableHead>
                      <TableHead className="hidden sm:table-cell">Arquivo</TableHead>
                      <TableHead className="hidden md:table-cell">Data Upload</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorios.map((relatorio) => (
                      <TableRow key={relatorio.identificador}>
                        <TableCell className="font-medium">{relatorio.mesReferencia}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {relatorio.nomeArquivoOriginal}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(relatorio.dataUpload).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              relatorio.statusExtracao === "concluido"
                                ? "default"
                                : relatorio.statusExtracao === "erro"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {relatorio.statusExtracao}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleRemover(relatorio.identificador)}
                          >
                            <Trash2 className={icone.botao} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
