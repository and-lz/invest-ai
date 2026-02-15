"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Erro nao tratado:", error);
  }, [error]);

  // Mostrar detalhes do erro em desenvolvimento
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <AlertTriangle className="text-destructive h-12 w-12" />
          <h2 className="text-lg font-semibold">Algo deu errado</h2>
          <p className="text-muted-foreground text-sm">
            Ocorreu um erro inesperado. Tente novamente ou recarregue a pagina.
          </p>

          {isDevelopment && (
            <div className="w-full space-y-2 rounded-lg border bg-muted/50 p-4 text-left">
              <p className="text-xs font-semibold text-destructive">Detalhes do erro (desenvolvimento):</p>
              <pre className="overflow-x-auto text-xs text-muted-foreground">
                {error.message}
              </pre>
              {error.digest && (
                <p className="text-xs text-muted-foreground">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
