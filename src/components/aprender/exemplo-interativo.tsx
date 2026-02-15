"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExemploInterativoProps {
  readonly titulo: string;
  readonly children: React.ReactNode;
  readonly requerDados?: boolean;
  readonly temDados?: boolean;
  readonly fallback?: React.ReactNode;
  readonly className?: string;
}

const FALLBACK_PADRAO = (
  <Card className="border-warning/30 bg-warning/5">
    <CardHeader>
      <div className="flex items-center gap-3">
        <FileQuestion className="text-warning h-6 w-6 shrink-0" aria-hidden="true" />
        <CardTitle className="text-base">Exemplo personalizado indisponível</CardTitle>
      </div>
      <CardDescription>
        Importe um relatório de investimentos para ver este exemplo com seus próprios dados.
      </CardDescription>
    </CardHeader>
  </Card>
);

export function ExemploInterativo({
  titulo,
  children,
  requerDados = false,
  temDados = false,
  fallback = FALLBACK_PADRAO,
  className,
}: ExemploInterativoProps) {
  const mostrarFallback = requerDados && !temDados;

  return (
    <div className={cn("my-8", className)}>
      <h3 className="mb-4 text-lg font-semibold">{titulo}</h3>

      {mostrarFallback ? fallback : children}
    </div>
  );
}
