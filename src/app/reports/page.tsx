"use client";

import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCallback } from "react";

export default function ReportsPage() {
  const { relatorios, estaCarregando, revalidar } = useReports();

  const handleRemover = useCallback(
    async (identificador: string) => {
      try {
        const resposta = await fetch(`/api/reports/${identificador}`, {
          method: "DELETE",
        });
        if (resposta.ok) {
          toast.success("Relatorio removido");
          await revalidar();
        }
      } catch {
        toast.error("Falha ao remover relatorio");
      }
    },
    [revalidar],
  );

  return (
    <div className="space-y-6">
      <Header
        titulo="Relatorios"
        descricao="Historico de relatorios uploadados"
      />

      {estaCarregando && <Skeleton className="h-64" />}

      {!estaCarregando && relatorios.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum relatorio encontrado.</p>
            <Link href="/upload">
              <Button>Fazer Upload</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!estaCarregando && relatorios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relatorios Processados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.map((relatorio) => (
                  <TableRow key={relatorio.identificador}>
                    <TableCell className="font-medium">
                      {relatorio.mesReferencia}
                    </TableCell>
                    <TableCell>{relatorio.nomeArquivoOriginal}</TableCell>
                    <TableCell>
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
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
