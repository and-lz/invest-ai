"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Send } from "lucide-react";
import type { InsightsResponse } from "@/schemas/insights.schema";
import { typography } from "@/lib/design-system";

interface FormularioInsightsManualProps {
  identificadorRelatorio: string;
  onInsightsSalvos: (insights: InsightsResponse) => void;
  onVoltar: () => void;
}

type StatusSubmissao = "idle" | "validando" | "sucesso" | "erro";

export function FormularioInsightsManual({
  identificadorRelatorio,
  onInsightsSalvos,
  onVoltar,
}: FormularioInsightsManualProps) {
  const [conteudoJson, setConteudoJson] = useState("");
  const [statusSubmissao, setStatusSubmissao] = useState<StatusSubmissao>("idle");
  const [erroSubmissao, setErroSubmissao] = useState<string | null>(null);

  const estaValidando = statusSubmissao === "validando";

  const handleSubmeter = useCallback(async () => {
    setStatusSubmissao("validando");
    setErroSubmissao(null);

    try {
      const resposta = await fetch("/api/insights/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "salvar",
          identificadorRelatorio,
          json: conteudoJson,
        }),
      });

      const dados = (await resposta.json()) as {
        sucesso?: boolean;
        insights?: InsightsResponse;
        erro?: string;
      };

      if (!resposta.ok) {
        setStatusSubmissao("erro");
        setErroSubmissao(dados.erro ?? "Falha na validacao");
        return;
      }

      setStatusSubmissao("sucesso");
      if (dados.insights) {
        onInsightsSalvos(dados.insights);
      }
    } catch (erro) {
      setStatusSubmissao("erro");
      setErroSubmissao(erro instanceof Error ? erro.message : "Erro desconhecido");
    }
  }, [conteudoJson, identificadorRelatorio, onInsightsSalvos]);

  if (statusSubmissao === "sucesso") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="text-success h-12 w-12" />
            <div className="text-center">
              <h3 className={typography.h3}>Análise salva!</h3>
              <p className="text-muted-foreground text-sm">
                A análise foi validada e salva com sucesso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className={typography.h3}>Passo 2: Colar a resposta da IA</h3>
          <p className="text-muted-foreground text-sm">
            Cole abaixo o JSON que o chat de IA retornou com a análise da sua carteira.
          </p>
        </div>

        <Textarea
          placeholder='Cole o JSON aqui... (deve comecar com { "mesReferencia": ...)'
          value={conteudoJson}
          onChange={(evento) => setConteudoJson(evento.target.value)}
          className="min-h-64 font-mono text-xs"
          disabled={estaValidando}
        />

        {statusSubmissao === "erro" && erroSubmissao && (
          <div className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-md border p-3">
            <XCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
            <pre className="text-destructive text-xs whitespace-pre-wrap">{erroSubmissao}</pre>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onVoltar} disabled={estaValidando}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao prompt
          </Button>

          <Button onClick={handleSubmeter} disabled={!conteudoJson.trim() || estaValidando}>
            {estaValidando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Validar e salvar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
