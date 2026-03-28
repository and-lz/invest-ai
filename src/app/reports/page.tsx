"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { PdfUploadDropzone } from "@/components/upload/pdf-upload-dropzone";
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
import { Trash2, FileText, Upload, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificar as notify } from "@/lib/notifier";
import { typography, icon, layout, dialog } from "@/lib/design-system";
export default function ReportsPage() {
  const router = useRouter();
  const { relatorios, estaCarregando, revalidar } = useReports();

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useChatPageContext();
  useEffect(() => {
    definirContexto("reports");
  }, [definirContexto]);
  const {
    dialogRef,
    open: abrirDialog,
    close: fecharDialog,
    handleBackdropClick,
  } = useNativeDialog();

  const handleUploadAceito = useCallback(() => {
    notify.success("Upload aceito!", {
      description:
        "O relatório está sendo processado em background. Você será notificado quando concluir.",
      actionUrl: "/",
      actionLabel: "Ver dashboard",
    });
    fecharDialog();
    router.push("/");
  }, [router, fecharDialog]);

  const handleRemover = useCallback(
    async (identificador: string) => {
      try {
        const resposta = await fetch(`/api/reports/${identificador}`, {
          method: "DELETE",
        });
        if (resposta.ok) {
          notify.success("Relatorio removido");
          await revalidar();
        }
      } catch {
        notify.error("Falha ao remover relatorio");
      }
    },
    [revalidar],
  );

  const handleRegenerar = useCallback(
    async (identificador: string) => {
      try {
        const resposta = await fetch(`/api/reports/${identificador}/regenerate`, {
          method: "POST",
        });
        if (resposta.ok) {
          notify.success("Reextracao iniciada", {
            description: "Voce sera notificado quando concluir.",
            actionUrl: "/",
            actionLabel: "Ver dashboard",
          });
        } else {
          const dados = await resposta.json() as { erro?: string };
          notify.error(dados.erro ?? "Falha ao iniciar reextracao");
        }
      } catch {
        notify.error("Falha ao iniciar reextracao");
      }
    },
    [],
  );

  return (
    <div className={layout.pageSpacing}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={layout.pageHeader}>
          <FileText
            className={cn(icon.pageTitle, "text-muted-foreground")}
            aria-hidden="true"
          />
          <Header titulo="Relatorios" descricao="Historico de relatorios importados" />
        </div>
        <Button onClick={abrirDialog} className="gap-2">
          <Upload className={icon.button} />
          Importar Novo Relatorio
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-label="Importar relatório"
        className={cn(
          "bg-background max-h-[85vh] overflow-y-auto rounded-lg border p-0 shadow-lg",
          dialog.backdrop,
          dialog.centered,
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
          <h2 className={typography.h3}>Importar Relatorio</h2>
          <Button variant="ghost" size="icon" onClick={fecharDialog}>
            <X className={icon.button} />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <div className="p-6">
          <PdfUploadDropzone onUploadSucesso={handleUploadAceito} />
        </div>
      </dialog>

      {/* Lista de Histórico */}
      <section className="space-y-4">
        {estaCarregando && <Skeleton className="h-64" />}

        {!estaCarregando && relatorios.length === 0 && (
          <Card>
            <CardContent className={layout.emptyStateCard}>
              <FileText className={icon.emptyState} />
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
                            disabled={relatorio.statusExtracao !== "concluido"}
                            onClick={() => void handleRegenerar(relatorio.identificador)}
                            title="Reextrair relatorio"
                          >
                            <RefreshCw className={icon.button} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleRemover(relatorio.identificador)}
                          >
                            <Trash2 className={icon.button} />
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
