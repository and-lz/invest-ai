"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { InsightsManualStepper } from "@/components/insights/insights-manual-stepper";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Loader2,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMesAno } from "@/lib/format-date";
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
  alta: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  media: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  baixa: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

const LABELS_CATEGORIA: Record<string, string> = {
  performance_positiva: "Performance positiva",
  performance_negativa: "Performance negativa",
  acao_recomendada: "Ação recomendada",
  risco: "Risco",
  oportunidade: "Oportunidade",
  diversificacao: "Diversificação",
  custos: "Custos",
};

interface InsightCardProps {
  insight: Insight;
  indiceInsight: number;
  identificadorRelatorio: string;
  onConclusaoAlterada: (indiceInsight: number, concluida: boolean) => void;
}

function InsightCard({
  insight,
  indiceInsight,
  identificadorRelatorio,
  onConclusaoAlterada,
}: InsightCardProps) {
  const Icone = ICONES_CATEGORIA[insight.categoria] ?? Lightbulb;
  const estaConcluido = insight.concluida ?? false;
  const [estaAtualizando, setEstaAtualizando] = useState(false);

  const handleToggleConcluido = useCallback(async () => {
    setEstaAtualizando(true);
    try {
      const resposta = await fetch("/api/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificadorRelatorio,
          indiceInsight,
          concluida: !estaConcluido,
        }),
      });

      if (resposta.ok) {
        await resposta.json();
        onConclusaoAlterada(indiceInsight, !estaConcluido);
      }
    } catch (erro) {
      console.error("Erro ao atualizar conclusao do insight:", erro);
    } finally {
      setEstaAtualizando(false);
    }
  }, [identificadorRelatorio, indiceInsight, estaConcluido, onConclusaoAlterada]);

  return (
    <article
      className={`transition-all ${estaConcluido ? "opacity-60" : ""}`}
    >
      {/* Categoria + Prioridade */}
      <div className="mb-2 flex items-center gap-3">
        <Icone className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {LABELS_CATEGORIA[insight.categoria] ?? insight.categoria}
        </span>
        <Badge className={CORES_PRIORIDADE[insight.prioridade] ?? ""}>
          {insight.prioridade}
        </Badge>
      </div>

      {/* Título */}
      <h3 className={`text-xl font-bold leading-snug ${estaConcluido ? "line-through" : ""}`}>
        {insight.titulo}
      </h3>

      {/* Descrição */}
      <p
        className={`mt-2 text-lg leading-relaxed ${estaConcluido ? "line-through text-muted-foreground/60" : "text-muted-foreground"}`}
      >
        {insight.descricao}
      </p>

      {/* Ação Sugerida */}
      {insight.acaoSugerida && (
        <div className="mt-4 rounded-lg border-l-4 border-primary bg-primary/5 px-5 py-4">
          <p className="text-base leading-relaxed">
            <span className="font-bold">Ação sugerida:</span>{" "}
            <span className="italic">{insight.acaoSugerida}</span>
          </p>
        </div>
      )}

      {/* Ativos Relacionados */}
      {insight.ativosRelacionados.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Ativos:
          </span>
          {insight.ativosRelacionados.map((ativo) => (
            <Badge key={ativo} variant="outline">
              {ativo}
            </Badge>
          ))}
        </div>
      )}

      {/* Checkbox de conclusão */}
      {insight.acaoSugerida && (
        <label
          className="mt-4 flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
        >
          <Checkbox
            checked={estaConcluido}
            onCheckedChange={handleToggleConcluido}
            disabled={estaAtualizando}
            aria-label={`Marcar "${insight.titulo}" como concluído`}
          />
          <span className={`text-sm ${estaConcluido ? "text-muted-foreground line-through" : "font-medium"}`}>
            {estaConcluido ? "Ação concluída" : "Marcar ação como concluída"}
          </span>
          {estaConcluido && (
            <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
          )}
        </label>
      )}
    </article>
  );
}

type ModoVisualizacao = "inicial" | "manual" | "insights";

export default function InsightsPage() {
  const { relatorios, estaCarregando: carregandoRelatorios } = useReports();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [estaGerando, setEstaGerando] = useState(false);
  const [erroInsights, setErroInsights] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] =
    useState<ModoVisualizacao>("inicial");
  const [estaCarregandoInsights, setEstaCarregandoInsights] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("");

  // Criar lista de períodos disponíveis a partir dos relatórios
  const periodosDisponiveis = relatorios.map((relatorio) => relatorio.mesReferencia);

  // Definir período padrão como o mais recente quando carregar relatórios
  useEffect(() => {
    if (relatorios.length > 0 && !periodoSelecionado) {
      const relatorioRecente = relatorios[0];
      if (relatorioRecente) {
        setPeriodoSelecionado(relatorioRecente.mesReferencia);
      }
    }
  }, [relatorios, periodoSelecionado]);

  // Carregar insights salvos quando o período mudar
  useEffect(() => {
    if (!periodoSelecionado) return;

    const carregarInsightsSalvos = async () => {
      setEstaCarregandoInsights(true);
      try {
        const url = `/api/insights?mesAno=${encodeURIComponent(periodoSelecionado)}`;
        const resposta = await fetch(url);
        if (resposta.ok) {
          const dados = (await resposta.json()) as {
            insights: InsightsResponse | null;
            identificadorRelatorio: string | null;
            mesReferencia: string;
          };
          if (dados.insights) {
            setInsights(dados.insights);
            setModoVisualizacao("insights");
          } else {
            setInsights(null);
            setModoVisualizacao("inicial");
          }
        }
      } catch (erro) {
        console.error("Erro ao carregar insights salvos:", erro);
        setInsights(null);
        setModoVisualizacao("inicial");
      } finally {
        setEstaCarregandoInsights(false);
      }
    };

    void carregarInsightsSalvos();
  }, [periodoSelecionado]);

  const gerarInsightsViaApi = useCallback(async () => {
    if (relatorios.length === 0 || !periodoSelecionado) return;

    setEstaGerando(true);
    setErroInsights(null);

    try {
      // Encontrar relatório do período selecionado
      const relatorioSelecionado = relatorios.find(
        (relatorio) => relatorio.mesReferencia === periodoSelecionado
      );
      if (!relatorioSelecionado) return;

      const corpo: Record<string, string> = {
        identificadorRelatorio: relatorioSelecionado.identificador,
      };

      // Encontrar relatório anterior (próximo na lista)
      const indiceAtual = relatorios.findIndex(
        (relatorio) => relatorio.identificador === relatorioSelecionado.identificador
      );
      if (indiceAtual >= 0 && indiceAtual < relatorios.length - 1) {
        const relatorioAnterior = relatorios[indiceAtual + 1];
        if (relatorioAnterior) {
          corpo.identificadorRelatorioAnterior = relatorioAnterior.identificador;
        }
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
      setModoVisualizacao("insights");
    } catch (erro) {
      setErroInsights(
        erro instanceof Error ? erro.message : "Erro desconhecido",
      );
    } finally {
      setEstaGerando(false);
    }
  }, [relatorios, periodoSelecionado]);

  const handleInsightsManualSalvos = useCallback(
    (insightsSalvos: InsightsResponse) => {
      setInsights(insightsSalvos);
      setModoVisualizacao("insights");
    },
    [],
  );

  const handleCancelarManual = useCallback(() => {
    setModoVisualizacao("inicial");
  }, []);

  const handleRegerar = useCallback(() => {
    setInsights(null);
    setModoVisualizacao("inicial");
  }, []);

  const handleConclusaoAlterada = useCallback(
    (indiceInsight: number, concluida: boolean) => {
      if (insights) {
        const insightsAtualizados: InsightsResponse = {
          ...insights,
          insights: insights.insights.map((insight, indice) =>
            indice === indiceInsight
              ? { ...insight, concluida }
              : insight,
          ),
        };
        setInsights(insightsAtualizados);
      }
    },
    [insights],
  );

  // Encontrar relatório do período selecionado
  const relatorioSelecionado = relatorios.find(
    (relatorio) => relatorio.mesReferencia === periodoSelecionado
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header
          titulo="Insights IA"
          descricao="Analise inteligente da sua carteira de investimentos"
        />
        {!carregandoRelatorios && periodosDisponiveis.length > 0 && periodoSelecionado && (
          <PeriodSelector
            periodosDisponiveis={periodosDisponiveis}
            periodoSelecionado={periodoSelecionado}
            onPeriodoChange={setPeriodoSelecionado}
          />
        )}
      </div>

      {(carregandoRelatorios || estaCarregandoInsights) && <Skeleton className="h-64" />}

      {!carregandoRelatorios && !estaCarregandoInsights && relatorios.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Faca upload de um relatorio para gerar insights.
            </p>
          </CardContent>
        </Card>
      )}

      {!carregandoRelatorios &&
        !estaCarregandoInsights &&
        relatorios.length > 0 &&
        modoVisualizacao === "inicial" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Gere insights baseados no período selecionado (
                {relatorioSelecionado?.mesReferencia}).
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => void gerarInsightsViaApi()}
                  disabled={estaGerando}
                >
                  {estaGerando && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {estaGerando ? "Gerando insights..." : "Gerar via API"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModoVisualizacao("manual")}
                  disabled={estaGerando}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Gerar via Claude Chat
                </Button>
              </div>
              {erroInsights && (
                <p className="text-sm text-red-600">{erroInsights}</p>
              )}
            </CardContent>
          </Card>
        )}

      {!carregandoRelatorios &&
        !estaCarregandoInsights &&
        relatorios.length > 0 &&
        modoVisualizacao === "manual" &&
        relatorioSelecionado && (
          <InsightsManualStepper
            identificadorRelatorio={relatorioSelecionado.identificador}
            onInsightsSalvos={handleInsightsManualSalvos}
            onCancelar={handleCancelarManual}
          />
        )}

      {modoVisualizacao === "insights" && insights && relatorioSelecionado && (
        <div className="mx-auto max-w-3xl space-y-10">

          {/* --- Cabeçalho Editorial --- */}
          <header className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Análise de Carteira
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {formatarMesAno(insights.mesReferencia, "extenso")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerado em{" "}
              {new Date(insights.dataGeracao).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </header>

          <Separator />

          {/* --- Resumo Executivo --- */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Resumo Executivo
            </h2>
            <Separator className="my-3" />
            <p className="text-xl leading-relaxed">
              {insights.resumoExecutivo}
            </p>
          </section>

          {/* --- Alertas --- */}
          {insights.alertas.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Alertas
              </h2>
              <Separator className="my-3" />
              <div className="space-y-3">
                {insights.alertas.map((alerta, indice) => (
                  <div
                    key={indice}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-l-4 px-5 py-4",
                      alerta.tipo === "urgente"
                        ? "border-l-red-500 bg-red-50 dark:bg-red-950/40"
                        : alerta.tipo === "atencao"
                          ? "border-l-amber-500 bg-amber-50 dark:bg-amber-950/40"
                          : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/40",
                    )}
                  >
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <p className="text-base leading-relaxed">{alerta.mensagem}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- Insights Detalhados --- */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Insights Detalhados
            </h2>
            <Separator className="my-3" />
            <div className="space-y-10">
              {insights.insights.map((insight, indice) => (
                <InsightCard
                  key={indice}
                  insight={insight}
                  indiceInsight={indice}
                  identificadorRelatorio={relatorioSelecionado.identificador}
                  onConclusaoAlterada={handleConclusaoAlterada}
                />
              ))}
            </div>
          </section>

          {/* --- Recomendações de Longo Prazo --- */}
          {insights.recomendacoesLongoPrazo.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Recomendações de Longo Prazo
              </h2>
              <Separator className="my-3" />
              <ul className="space-y-4">
                {insights.recomendacoesLongoPrazo.map(
                  (recomendacao, indice) => (
                    <li
                      key={indice}
                      className="flex items-start gap-3 text-lg leading-relaxed"
                    >
                      <span className="mt-1 font-bold text-primary">
                        {indice + 1}.
                      </span>
                      <span>{recomendacao}</span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}

          {/* --- Rodapé --- */}
          <Separator />
          <div className="flex justify-center pb-8">
            <Button variant="outline" onClick={handleRegerar}>
              Gerar novos insights
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
