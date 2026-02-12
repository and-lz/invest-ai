"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Loader2,
} from "lucide-react";
import type { InsightsResponse, Insight } from "@/schemas/insights.schema";

const ICONES_CATEGORIA: Record<string, typeof TrendingUp> = {
  performance_positiva: TrendingUp,
  performance_negativa: TrendingDown,
  acao_recomendada: Target,
  risco: Shield,
  oportunidade: Lightbulb,
  diversificacao: Target,
  custos: AlertTriangle,
};

const CORES_PRIORIDADE: Record<string, string> = {
  alta: "bg-red-100 text-red-800",
  media: "bg-amber-100 text-amber-800",
  baixa: "bg-blue-100 text-blue-800",
};

function InsightCard({ insight }: { insight: Insight }) {
  const Icone = ICONES_CATEGORIA[insight.categoria] ?? Lightbulb;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <Icone className="mt-1 h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{insight.titulo}</CardTitle>
            <Badge className={CORES_PRIORIDADE[insight.prioridade] ?? ""}>
              {insight.prioridade}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-11">
        <p className="text-sm text-muted-foreground">{insight.descricao}</p>
        {insight.acaoSugerida && (
          <p className="mt-2 text-sm font-medium">
            Acao sugerida: {insight.acaoSugerida}
          </p>
        )}
        {insight.ativosRelacionados.length > 0 && (
          <div className="mt-2 flex gap-1">
            {insight.ativosRelacionados.map((ativo) => (
              <Badge key={ativo} variant="outline" className="text-xs">
                {ativo}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const { relatorios, estaCarregando: carregandoRelatorios } = useReports();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [estaGerando, setEstaGerando] = useState(false);
  const [erroInsights, setErroInsights] = useState<string | null>(null);

  const gerarInsights = useCallback(async () => {
    if (relatorios.length === 0) return;

    setEstaGerando(true);
    setErroInsights(null);

    try {
      const relatorioRecente = relatorios[0];
      if (!relatorioRecente) return;

      const corpo: Record<string, string> = {
        identificadorRelatorio: relatorioRecente.identificador,
      };

      if (relatorios.length >= 2 && relatorios[1]) {
        corpo.identificadorRelatorioAnterior = relatorios[1].identificador;
      }

      const resposta = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao gerar insights");
      }

      const dados = (await resposta.json()) as { insights: InsightsResponse };
      setInsights(dados.insights);
    } catch (erro) {
      setErroInsights(
        erro instanceof Error ? erro.message : "Erro desconhecido",
      );
    } finally {
      setEstaGerando(false);
    }
  }, [relatorios]);

  return (
    <div className="space-y-6">
      <Header
        titulo="Insights IA"
        descricao="Analise inteligente da sua carteira de investimentos"
      />

      {carregandoRelatorios && <Skeleton className="h-64" />}

      {!carregandoRelatorios && relatorios.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Faca upload de um relatorio para gerar insights.
            </p>
          </CardContent>
        </Card>
      )}

      {!carregandoRelatorios && relatorios.length > 0 && !insights && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Gere insights baseados no relatorio mais recente ({relatorios[0]?.mesReferencia}).
            </p>
            <Button onClick={() => void gerarInsights()} disabled={estaGerando}>
              {estaGerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {estaGerando ? "Gerando insights..." : "Gerar Insights"}
            </Button>
            {erroInsights && (
              <p className="text-sm text-red-600">{erroInsights}</p>
            )}
          </CardContent>
        </Card>
      )}

      {insights && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resumo Executivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {insights.resumoExecutivo}
              </p>
            </CardContent>
          </Card>

          {insights.alertas.length > 0 && (
            <div className="space-y-2">
              {insights.alertas.map((alerta, indice) => (
                <Card
                  key={indice}
                  className={
                    alerta.tipo === "urgente"
                      ? "border-red-200 bg-red-50"
                      : alerta.tipo === "atencao"
                        ? "border-amber-200 bg-amber-50"
                        : ""
                  }
                >
                  <CardContent className="flex items-center gap-3 py-3">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm">{alerta.mensagem}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Insights</h3>
            {insights.insights.map((insight, indice) => (
              <InsightCard key={indice} insight={insight} />
            ))}
          </div>

          {insights.recomendacoesLongoPrazo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recomendacoes de Longo Prazo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2">
                  {insights.recomendacoesLongoPrazo.map((recomendacao, indice) => (
                    <li key={indice} className="text-sm text-muted-foreground">
                      {recomendacao}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => void gerarInsights()}
              disabled={estaGerando}
            >
              {estaGerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Regenerar Insights
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
