"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Loader2, ArrowRight } from "lucide-react";

interface PromptExtracaoCopiavelProps {
  onProximoPasso: () => void;
}

export function PromptExtracaoCopiavel({
  onProximoPasso,
}: PromptExtracaoCopiavelProps) {
  const [promptCompleto, setPromptCompleto] = useState<string>("");
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch("/api/reports/manual")
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Falha ao carregar prompt");
        return resposta.json() as Promise<{ prompt: string }>;
      })
      .then((dados) => {
        setPromptCompleto(dados.prompt);
        setEstaCarregando(false);
      })
      .catch((erro: Error) => {
        setErroCarregamento(erro.message);
        setEstaCarregando(false);
      });
  }, []);

  const copiarPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(promptCompleto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [promptCompleto]);

  if (estaCarregando) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (erroCarregamento) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-red-600">{erroCarregamento}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold">Passo 1: Copiar o prompt</h3>
          <p className="text-sm text-muted-foreground">
            Copie o prompt abaixo e cole no Claude Chat junto com o PDF do
            relatorio.
          </p>
        </div>

        <ScrollArea className="h-64 rounded-md border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap text-xs">{promptCompleto}</pre>
        </ScrollArea>

        <div className="flex items-center gap-3">
          <Button onClick={copiarPrompt} variant="outline">
            {copiado ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar prompt
              </>
            )}
          </Button>

          <Button onClick={onProximoPasso}>
            Ja copiei, proximo passo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
