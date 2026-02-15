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

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <AlertTriangle className="text-destructive h-12 w-12" />
          <h2 className="text-lg font-semibold">Algo deu errado</h2>
          <p className="text-muted-foreground text-sm">
            Ocorreu um erro inesperado. Tente novamente ou recarregue a pagina.
          </p>
          <Button onClick={reset} variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
