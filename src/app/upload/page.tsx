"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Header } from "@/components/layout/header";
import { PdfUploadDropzone } from "@/components/upload/pdf-upload-dropzone";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSucesso = useCallback(
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
        descricao="Envie seu relatorio consolidado do Inter Prime (PDF)"
      />
      <PdfUploadDropzone onUploadSucesso={handleUploadSucesso} />
    </div>
  );
}
