"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tipografia } from "@/lib/design-system";

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
        <CheckCircle className="text-success h-12 w-12" />
      ) : (
        <XCircle className="text-destructive h-12 w-12" />
      )}
      <div className="text-center">
        <h3 className={tipografia.h3}>{titulo}</h3>
        <p
          className={cn(
            tipografia.corpo,
            tipo === "erro" ? "text-destructive" : "text-muted-foreground",
          )}
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
