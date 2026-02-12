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
      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Manual (Claude Chat)</TabsTrigger>
          <TabsTrigger value="automatico">Automatico (API)</TabsTrigger>
        </TabsList>
        <TabsContent value="manual">
          <ImportacaoManualStepper onImportacaoSucesso={handleSucesso} />
        </TabsContent>
        <TabsContent value="automatico">
          <PdfUploadDropzone onUploadSucesso={handleSucesso} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
