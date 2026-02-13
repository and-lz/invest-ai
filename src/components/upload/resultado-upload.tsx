"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultadoUploadProps {
  readonly tipo: "sucesso" | "erro";
  readonly titulo: string;
  readonly mensagem: string;
  readonly rotuloAcao: string;
  readonly onAcao: () => void;
}

export function ResultadoUpload({
  tipo,
  titulo,
  mensagem,
  rotuloAcao,
  onAcao,
}: ResultadoUploadProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 py-8"
      role={tipo === "erro" ? "alert" : undefined}
    >
      {tipo === "sucesso" ? (
        <CheckCircle className="h-12 w-12 text-green-600" />
      ) : (
        <XCircle className="h-12 w-12 text-red-600" />
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <p
          className={
            tipo === "erro"
              ? "text-destructive text-sm"
              : "text-muted-foreground text-sm"
          }
        >
          {mensagem}
        </p>
      </div>
      <Button variant={tipo === "sucesso" ? "default" : "outline"} onClick={onAcao}>
        {rotuloAcao}
      </Button>
    </div>
  );
}
