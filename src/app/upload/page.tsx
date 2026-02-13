"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Header } from "@/components/layout/header";
import { PdfUploadDropzone } from "@/components/upload/pdf-upload-dropzone";
import { ImportacaoManualStepper } from "@/components/upload/importacao-manual-stepper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
        <TabsList className="w-auto">
          <TabsTrigger value="automatico" className="shrink-0 gap-1.5">
            Upload direto
            <span className="bg-muted-foreground/10 text-muted-foreground rounded px-1 py-0.5 text-[9px] font-medium leading-none">
              REC
            </span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="shrink-0">
            Via Claude Chat
          </TabsTrigger>
        </TabsList>
        <TabsContent value="automatico" className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Envie o PDF e extraimos os dados automaticamente com IA.
          </p>
          <PdfUploadDropzone onUploadSucesso={handleSucesso} />
        </TabsContent>
        <TabsContent value="manual" className="space-y-2">
          <p className="text-muted-foreground mb-2 text-sm">
            Copie um prompt, cole no Claude Chat junto com o PDF e retorne o resultado aqui.
          </p>
          <ImportacaoManualStepper onImportacaoSucesso={handleSucesso} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
