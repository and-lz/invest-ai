"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Header } from "@/components/layout/header";
import { PdfUploadDropzone } from "@/components/upload/pdf-upload-dropzone";
import { ImportacaoManualStepper } from "@/components/upload/importacao-manual-stepper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();

  const handleSucesso = useCallback(
    (identificador: string) => {
      toast.success("Relatorio processado com sucesso!", {
        description: `Referencia: ${identificador}`,
      });
      router.push("/");
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <Header
        titulo="Upload de Relatorio"
        descricao="Envie seu relatorio consolidado do Inter Prime"
      />
      <Tabs defaultValue="automatico">
        <TabsList>
          <TabsTrigger value="automatico" className="gap-2">
            Upload direto
            <Badge variant="secondary" className="text-[10px] leading-none">
              Recomendado
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="manual">Via Claude Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="automatico" className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Envie o PDF e extraimos os dados automaticamente com IA.
          </p>
          <PdfUploadDropzone onUploadSucesso={handleSucesso} />
        </TabsContent>
        <TabsContent value="manual" className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Copie um prompt, cole no Claude Chat junto com o PDF e retorne o resultado aqui.
          </p>
          <ImportacaoManualStepper onImportacaoSucesso={handleSucesso} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
