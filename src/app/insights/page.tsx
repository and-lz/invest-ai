"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  X,
  Check,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMesAno } from "@/lib/format-date";
import type { InsightsResponse, Insight, StatusAcao } from "@/schemas/insights.schema";

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
  alta: "bg-destructive/15 text-destructive",
  media: "bg-muted text-muted-foreground",
  baixa: "bg-muted text-muted-foreground",
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
  onStatusAlterado: (indiceInsight: number, statusAcao: StatusAcao) => void;
}

function InsightCard({
  insight,
  indiceInsight,
  identificadorRelatorio,
  onStatusAlterado,
}: InsightCardProps) {
  const Icone = ICONES_CATEGORIA[insight.categoria] ?? Lightbulb;
  const statusAtual = insight.statusAcao ?? "pendente";
  const [estaAtualizando, setEstaAtualizando] = useState(false);

  const handleAlterarStatus = useCallback(
    async (novoStatus: StatusAcao) => {
      setEstaAtualizando(true);
      try {
        const resposta = await fetch("/api/insights", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identificadorRelatorio,
            indiceInsight,
            statusAcao: novoStatus,
          }),
        });

        if (resposta.ok) {
          await resposta.json();
          onStatusAlterado(indiceInsight, novoStatus);
        }
      } catch (erro) {
        console.error("Erro ao atualizar status do insight:", erro);
      } finally {
        setEstaAtualizando(false);
      }
    },
    [identificadorRelatorio, indiceInsight, onStatusAlterado],
  );

  // Estilos diferentes para cada status
  const estilosBloco = {
    pendente: "border border-transparent rounded-lg p-4",
    concluida:
      "bg-success/5 border border-success/20 rounded-lg p-4",
    ignorada:
      "bg-muted/30 dark:bg-muted/10 border border-muted-foreground/20 dark:border-muted-foreground/10 rounded-lg p-4",
  };

  const estiloTexto = {
    pendente: "",
    concluida: "opacity-70 line-through",
    ignorada: "opacity-60 line-through",
  };

  return (
    <article className={cn("transition-all", estilosBloco[statusAtual])}>
      {/* Categoria + Prioridade */}
      <div className="mb-2 flex items-center gap-3">
        <Icone className="text-muted-foreground h-5 w-5" />
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {LABELS_CATEGORIA[insight.categoria] ?? insight.categoria}
        </span>
        <Badge className={CORES_PRIORIDADE[insight.prioridade] ?? ""}>{insight.prioridade}</Badge>
      </div>

      {/* Título */}
      <h3 className={cn("text-xl leading-snug font-bold", estiloTexto[statusAtual])}>
        {insight.titulo}
      </h3>

      {/* Descrição */}
      <p className={cn("mt-2 text-lg leading-relaxed text-muted-foreground", estiloTexto[statusAtual])}>
        {insight.descricao}
      </p>

      {/* Ação Sugerida */}
      {insight.acaoSugerida && (
        <div
          className={cn(
            "mt-4 rounded-lg border-l-4 px-5 py-4",
            statusAtual === "concluida"
              ? "border-success/40 bg-success/5"
              : statusAtual === "ignorada"
                ? "border-muted-foreground/30 bg-muted/30"
                : "border-muted-foreground/20 bg-muted/50",
          )}
        >
          <p className={cn("text-base leading-relaxed", estiloTexto[statusAtual])}>
            <span className="font-bold">Acao sugerida:</span>{" "}
            <span className="italic">{insight.acaoSugerida}</span>
          </p>
        </div>
      )}

      {/* Ativos Relacionados */}
      {insight.ativosRelacionados.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm font-semibold">Ativos:</span>
          {insight.ativosRelacionados.map((ativo) => (
            <Badge key={ativo} variant="outline">
              {ativo}
            </Badge>
          ))}
        </div>
      )}

      {/* Ações sutis - somente se houver acaoSugerida */}
      {insight.acaoSugerida && (
        <div className="mt-4 flex items-center gap-2">
          {statusAtual === "pendente" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("concluida")}
                disabled={estaAtualizando}
                className="text-muted-foreground hover:text-success h-8 gap-1.5 text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Concluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("ignorada")}
                disabled={estaAtualizando}
                className="text-muted-foreground hover:text-warning h-8 gap-1.5 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Ignorar
              </Button>
            </>
          )}
          {statusAtual === "concluida" && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ação concluída</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("pendente")}
                disabled={estaAtualizando}
                className="text-muted-foreground ml-2 h-7 text-xs"
              >
                Desfazer
              </Button>
            </div>
          )}
          {statusAtual === "ignorada" && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <X className="h-4 w-4" />
              <span>Ação ignorada</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("pendente")}
                disabled={estaAtualizando}
                className="text-muted-foreground ml-2 h-7 text-xs"
              >
                Desfazer
              </Button>
            </div>
          )}
        </div>
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
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>("inicial");
  const [estaCarregandoInsights, setEstaCarregandoInsights] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("");

  // Criar lista de períodos disponíveis a partir dos relatórios + opção consolidada
  const periodosDisponiveis = [
    ...relatorios.map((relatorio) => relatorio.mesReferencia),
    ...(relatorios.length > 1 ? ["consolidado"] : []),
  ];

  const ehConsolidado = periodoSelecionado === "consolidado";

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
      // Modo consolidado: gerar com todos os meses
      if (ehConsolidado) {
        const primeiroRelatorio = relatorios[0];
        if (!primeiroRelatorio) return;

        const resposta = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identificadorRelatorio: primeiroRelatorio.identificador,
            consolidado: true,
          }),
        });

        if (!resposta.ok) {
          throw new Error("Falha ao gerar insights consolidados");
        }

        const dados = (await resposta.json()) as { insights: InsightsResponse };
        setInsights(dados.insights);
        setModoVisualizacao("insights");
        return;
      }

      // Encontrar relatório do período selecionado
      const relatorioDoPerido = relatorios.find(
        (relatorio) => relatorio.mesReferencia === periodoSelecionado,
      );
      if (!relatorioDoPerido) return;

      const corpo: Record<string, string> = {
        identificadorRelatorio: relatorioDoPerido.identificador,
      };

      // Encontrar relatório anterior (próximo na lista)
      const indiceAtual = relatorios.findIndex(
        (relatorio) => relatorio.identificador === relatorioDoPerido.identificador,
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
      setErroInsights(erro instanceof Error ? erro.message : "Erro desconhecido");
    } finally {
      setEstaGerando(false);
    }
  }, [relatorios, periodoSelecionado, ehConsolidado]);

  const handleInsightsManualSalvos = useCallback((insightsSalvos: InsightsResponse) => {
    setInsights(insightsSalvos);
    setModoVisualizacao("insights");
  }, []);

  const handleCancelarManual = useCallback(() => {
    setModoVisualizacao("inicial");
  }, []);

  const handleRegerar = useCallback(() => {
    setInsights(null);
    setModoVisualizacao("inicial");
  }, []);

  const handleStatusAlterado = useCallback(
    (indiceInsight: number, statusAcao: StatusAcao) => {
      if (insights) {
        const insightsAtualizados: InsightsResponse = {
          ...insights,
          insights: insights.insights.map((insight, indice) =>
            indice === indiceInsight
              ? { ...insight, statusAcao, concluida: statusAcao === "concluida" }
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
    (relatorio) => relatorio.mesReferencia === periodoSelecionado,
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
            <Lightbulb className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
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
              {ehConsolidado ? (
                <Layers className="text-muted-foreground h-12 w-12" />
              ) : (
                <Lightbulb className="text-muted-foreground h-12 w-12" />
              )}
              <p className="text-muted-foreground text-center">
                {ehConsolidado
                  ? `Gere insights analisando todos os ${relatorios.length} meses disponíveis.`
                  : `Gere insights baseados no período selecionado (${relatorioSelecionado?.mesReferencia}).`}
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={() => void gerarInsightsViaApi()} disabled={estaGerando}>
                  {estaGerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {estaGerando
                    ? "Gerando insights..."
                    : ehConsolidado
                      ? "Gerar analise consolidada"
                      : "Gerar via API"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModoVisualizacao("manual")}
                  disabled={estaGerando}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Gerar via Chat
                </Button>
              </div>
              {erroInsights && <p className="text-sm text-destructive">{erroInsights}</p>}
            </CardContent>
          </Card>
        )}

      {!carregandoRelatorios &&
        !estaCarregandoInsights &&
        relatorios.length > 0 &&
        modoVisualizacao === "manual" &&
        (relatorioSelecionado || ehConsolidado) && (
          <InsightsManualStepper
            identificadorRelatorio={
              ehConsolidado
                ? (relatorios[0]?.identificador ?? "")
                : (relatorioSelecionado?.identificador ?? "")
            }
            consolidado={ehConsolidado}
            onInsightsSalvos={handleInsightsManualSalvos}
            onCancelar={handleCancelarManual}
          />
        )}

      {modoVisualizacao === "insights" && insights && (relatorioSelecionado || ehConsolidado) && (
        <div className="mx-auto max-w-3xl space-y-16">
          {/* --- Cabeçalho Editorial --- */}
          <header className="text-center">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              {ehConsolidado ? "Análise Consolidada" : "Análise de Carteira"}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {ehConsolidado
                ? "Todos os meses"
                : formatarMesAno(insights.mesReferencia, "extenso")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ehConsolidado && (
                <span>{relatorios.length} relatórios analisados — </span>
              )}
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
            <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
              Resumo Executivo
            </h2>
            <Separator className="my-3" />
            <p className="text-xl leading-relaxed">{insights.resumoExecutivo}</p>
          </section>

          {/* --- Alertas --- */}
          {insights.alertas.length > 0 && (
            <section>
              <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
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
                        ? "border-l-destructive bg-destructive/5"
                        : alerta.tipo === "atencao"
                          ? "border-l-warning bg-warning/5"
                          : "border-l-muted-foreground/30 bg-muted/50",
                    )}
                  >
                    <AlertTriangle className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-base leading-relaxed">{alerta.mensagem}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- Insights Detalhados --- */}
          <section>
            <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
              Insights Detalhados
            </h2>
            <Separator className="my-3" />
            <div className="space-y-14">
              {insights.insights.map((insight, indice) => (
                <InsightCard
                  key={indice}
                  insight={insight}
                  indiceInsight={indice}
                  identificadorRelatorio={
                    ehConsolidado
                      ? "consolidado"
                      : (relatorioSelecionado?.identificador ?? "")
                  }
                  onStatusAlterado={handleStatusAlterado}
                />
              ))}
            </div>
          </section>

          {/* --- Recomendações de Longo Prazo --- */}
          {insights.recomendacoesLongoPrazo.length > 0 && (
            <section>
              <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
                Recomendações de Longo Prazo
              </h2>
              <Separator className="my-3" />
              <ul className="space-y-6">
                {insights.recomendacoesLongoPrazo.map((recomendacao, indice) => (
                  <li key={indice} className="flex items-start gap-3 text-lg leading-relaxed">
                    <span className="text-muted-foreground mt-1 font-bold">{indice + 1}.</span>
                    <span>{recomendacao}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* --- Rodapé --- */}
          <Separator />
          <div className="flex justify-center pb-12">
            <Button variant="outline" onClick={handleRegerar}>
              Gerar novos insights
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
