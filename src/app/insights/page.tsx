"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useContextoPaginaChat } from "@/contexts/contexto-pagina-chat";
import { serializarContextoInsights } from "@/lib/serializar-contexto-chat";
import { Header } from "@/components/layout/header";
import { useReports } from "@/hooks/use-reports";
import { revalidarTarefasAtivas } from "@/hooks/use-tarefas-ativas";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { InsightsManualStepper } from "@/components/insights/insights-manual-stepper";
import { InsightsList } from "@/components/insights/insights-list";
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
  ArrowLeft,
  ListPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { icone } from "@/lib/design-system";
import { notificar } from "@/lib/notificar";
import { formatarMesAno, validarMesAno } from "@/lib/format-date";
import type { InsightsResponse, Insight, StatusAcao } from "@/schemas/insights.schema";

/** Formata mesReferencia de forma segura: se já estiver formatado, retorna como está */
function formatarMesReferenciaSeguro(mesReferencia: string): string {
  if (validarMesAno(mesReferencia)) {
    return formatarMesAno(mesReferencia, "extenso");
  }
  // Valor já formatado pela Gemini (ex: "janeiro de 2026") — retornar como está
  return mesReferencia;
}

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

const INSIGHT_TO_CONCLUSAO: Record<string, string> = {
  performance_positiva: "positivo",
  performance_negativa: "atencao",
  acao_recomendada: "neutro",
  risco: "atencao",
  oportunidade: "positivo",
  diversificacao: "neutro",
  custos: "atencao",
};

type AddToPlanStatus = "idle" | "loading" | "added" | "error";

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
  const router = useRouter();
  const Icone = ICONES_CATEGORIA[insight.categoria] ?? Lightbulb;
  const statusAtual = insight.statusAcao ?? "pendente";
  const [estaAtualizando, setEstaAtualizando] = useState(false);
  const [planStatus, setPlanStatus] = useState<AddToPlanStatus>("idle");

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

  const handleAddToPlan = useCallback(async () => {
    if (!insight.acaoSugerida || planStatus === "loading" || planStatus === "added") return;

    setPlanStatus("loading");
    try {
      const response = await fetch("/api/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textoOriginal: insight.acaoSugerida,
          tipoConclusao: INSIGHT_TO_CONCLUSAO[insight.categoria] ?? "neutro",
          origem: "insight-acao-sugerida",
          ativosRelacionados: insight.ativosRelacionados,
        }),
      });

      if (response.status === 409) {
        notificar.info("Já no plano", {
          description: "Este item já está no seu plano de ação.",
        });
        setPlanStatus("added");
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { erro?: string };
        throw new Error(errorBody.erro ?? "Falha ao adicionar ao plano");
      }

      notificar.success("Adicionado ao plano", {
        description: "Ação adicionada com recomendação da IA.",
        actionUrl: "/plano-acao",
        actionLabel: "Ver plano",
        action: {
          label: "Ver plano",
          onClick: () => router.push("/plano-acao"),
        },
      });
      setPlanStatus("added");
    } catch (error) {
      console.error("[Insights] Error adding to plan:", error);
      notificar.error("Erro ao adicionar", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      });
      setPlanStatus("error");
    }
  }, [insight.acaoSugerida, insight.categoria, insight.ativosRelacionados, planStatus, router]);

  // Estilos diferentes para cada status
  const estilosBloco = {
    pendente: "border border-transparent rounded-lg p-4",
    concluida: "border border-transparent rounded-lg p-4 opacity-60",
    ignorada: "border border-transparent rounded-lg p-4 opacity-50",
  };

  const estiloTexto = {
    pendente: "",
    concluida: "",
    ignorada: "",
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
      <p
        className={cn(
          "text-muted-foreground mt-2 text-lg leading-relaxed",
          estiloTexto[statusAtual],
        )}
      >
        {insight.descricao}
      </p>

      {/* Ação Sugerida */}
      {insight.acaoSugerida && (
        <div
          className={cn(
            "mt-4 rounded-lg border-l-4 px-5 py-4",
            "border-muted-foreground/20 bg-muted/50",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className={cn("text-base leading-relaxed", estiloTexto[statusAtual])}>
              <span className="font-bold">Acao sugerida:</span>{" "}
              <span className="italic">{insight.acaoSugerida}</span>
            </p>
            <button
              type="button"
              onClick={() => void handleAddToPlan()}
              disabled={planStatus === "loading" || planStatus === "added"}
              className={cn(
                "mt-0.5 shrink-0 cursor-pointer rounded-sm p-1 transition-colors",
                planStatus === "added"
                  ? "text-success"
                  : planStatus === "loading"
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60 hover:text-muted-foreground",
              )}
              aria-label="Adicionar ao plano de ação"
            >
              {planStatus === "loading" ? (
                <Loader2 className={cn(icone.botao, "animate-spin")} />
              ) : planStatus === "added" ? (
                <Check className={icone.botao} />
              ) : (
                <ListPlus className={icone.botao} />
              )}
            </button>
          </div>
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
                <Check className="h-4 w-4" />
                Concluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleAlterarStatus("ignorada")}
                disabled={estaAtualizando}
                className="text-muted-foreground hover:text-warning h-8 gap-1.5 text-xs"
              >
                <X className="h-4 w-4" />
                Ignorar
              </Button>
            </>
          )}
          {statusAtual === "concluida" && (
            <div className="text-success flex items-center gap-2 text-sm">
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

type ModoVisualizacao = "lista" | "gerar" | "manual" | "insights";

export default function InsightsPage() {
  const { relatorios, estaCarregando: carregandoRelatorios, erro: erroRelatorios } = useReports();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [estaGerando, setEstaGerando] = useState(false);
  const [erroInsights, setErroInsights] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>("lista");
  const [estaCarregandoInsights, setEstaCarregandoInsights] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("");

  // Tratar erro de relatórios na UI sem crashar a página inteira
  const temErroRelatorios = !!erroRelatorios;

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useContextoPaginaChat();
  const contextoSerializado = useMemo(
    () => (insights ? serializarContextoInsights(insights) : undefined),
    [insights],
  );
  useEffect(() => {
    definirContexto("insights", contextoSerializado);
  }, [definirContexto, contextoSerializado]);

  // Criar lista de períodos disponíveis a partir dos relatórios + opção consolidada
  const periodosDisponiveis = [
    ...relatorios.map((relatorio) => relatorio.mesReferencia),
    ...(relatorios.length > 1 ? ["consolidado"] : []),
  ];

  const ehConsolidado = periodoSelecionado === "consolidado";

  // Encontrar relatório do período selecionado
  const relatorioSelecionado = relatorios.find(
    (relatorio) => relatorio.mesReferencia === periodoSelecionado,
  );

  // --- Navigation callbacks ---

  const handleSelectInsight = useCallback(async (identificador: string) => {
    setEstaCarregandoInsights(true);
    setPeriodoSelecionado(identificador);

    try {
      const url = `/api/insights?mesAno=${encodeURIComponent(identificador)}`;
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
        }
      }
    } catch (erro) {
      console.error("Erro ao carregar insights:", erro);
    } finally {
      setEstaCarregandoInsights(false);
    }
  }, []);

  const voltarParaLista = useCallback(() => {
    setModoVisualizacao("lista");
    setInsights(null);
  }, []);

  const entrarModoGerar = useCallback(() => {
    if (!periodoSelecionado && relatorios.length > 0) {
      const relatorioRecente = relatorios[0];
      if (relatorioRecente) {
        setPeriodoSelecionado(relatorioRecente.mesReferencia);
      }
    }
    setModoVisualizacao("gerar");
  }, [periodoSelecionado, relatorios]);

  const gerarInsightsViaApi = useCallback(async () => {
    if (relatorios.length === 0 || !periodoSelecionado) return;

    setEstaGerando(true);
    setErroInsights(null);

    try {
      let corpo: Record<string, string | boolean>;

      // Modo consolidado: gerar com todos os meses
      if (ehConsolidado) {
        const primeiroRelatorio = relatorios[0];
        if (!primeiroRelatorio) return;

        corpo = {
          identificadorRelatorio: primeiroRelatorio.identificador,
          consolidado: true,
        };
      } else {
        // Encontrar relatório do período selecionado
        const relatorioDoPerido = relatorios.find(
          (relatorio) => relatorio.mesReferencia === periodoSelecionado,
        );
        if (!relatorioDoPerido) return;

        corpo = {
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
      }

      const resposta = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao solicitar geração de insights");
      }

      // 202 Accepted: processamento em background
      const dados = (await resposta.json()) as { identificadorTarefa?: string };
      if (dados.identificadorTarefa) {
        revalidarTarefasAtivas();
      }

      // Return to list to wait for background task
      setModoVisualizacao("lista");
      setErroInsights(null);
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
    setModoVisualizacao("gerar");
  }, []);

  const handleInsightsDeleted = useCallback(
    (identificador: string) => {
      // If the deleted insights are the ones currently being viewed, reset view
      if (identificador === periodoSelecionado) {
        setInsights(null);
        setModoVisualizacao("lista");
      }
    },
    [periodoSelecionado],
  );

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

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {modoVisualizacao !== "lista" && (
            <Button variant="ghost" size="icon" onClick={voltarParaLista}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Lightbulb className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <Header
            titulo="Análises IA"
            descricao="Analise inteligente da sua carteira de investimentos"
          />
        </div>
        {(modoVisualizacao === "gerar" || modoVisualizacao === "manual") &&
          !carregandoRelatorios &&
          periodosDisponiveis.length > 0 &&
          periodoSelecionado && (
            <PeriodSelector
              periodosDisponiveis={periodosDisponiveis}
              periodoSelecionado={periodoSelecionado}
              onPeriodoChange={setPeriodoSelecionado}
            />
          )}
      </div>

      {/* --- Loading --- */}
      {(carregandoRelatorios || estaCarregandoInsights) && !temErroRelatorios && (
        <Skeleton className="h-64" />
      )}

      {/* --- Error state --- */}
      {temErroRelatorios && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertTriangle className="text-destructive h-12 w-12" />
            <p className="text-muted-foreground">
              Erro ao carregar relatórios. Verifique sua conexão e tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* --- No reports --- */}
      {!carregandoRelatorios && !temErroRelatorios && relatorios.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              Faca upload de um relatorio para gerar analises.
            </p>
          </CardContent>
        </Card>
      )}

      {/* === LIST MODE (default) === */}
      {!carregandoRelatorios &&
        !estaCarregandoInsights &&
        !temErroRelatorios &&
        relatorios.length > 0 &&
        modoVisualizacao === "lista" && (
          <>
            <InsightsList
              onSelectPeriod={(id) => void handleSelectInsight(id)}
              selectedPeriod=""
              onInsightsDeleted={handleInsightsDeleted}
              onGenerateNew={entrarModoGerar}
            />
            <div className="flex justify-center">
              <Button variant="outline" onClick={entrarModoGerar}>
                <Lightbulb className="mr-2 h-4 w-4" />
                Gerar novas análises
              </Button>
            </div>
          </>
        )}

      {/* === GENERATE MODE === */}
      {!carregandoRelatorios &&
        relatorios.length > 0 &&
        modoVisualizacao === "gerar" && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              {ehConsolidado ? (
                <Layers className="text-muted-foreground h-12 w-12" />
              ) : (
                <Lightbulb className="text-muted-foreground h-12 w-12" />
              )}
              <p className="text-muted-foreground text-center">
                {ehConsolidado
                  ? `Gere uma análise consolidada de todos os ${relatorios.length} meses disponíveis.`
                  : `Gere uma análise baseada no período selecionado (${relatorioSelecionado?.mesReferencia ?? periodoSelecionado}).`}
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={() => void gerarInsightsViaApi()} disabled={estaGerando}>
                  {estaGerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {estaGerando
                    ? "Gerando análise..."
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
              {erroInsights && <p className="text-destructive text-sm">{erroInsights}</p>}
            </CardContent>
          </Card>
        )}

      {/* === MANUAL MODE === */}
      {!carregandoRelatorios &&
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

      {/* === DETAIL MODE === */}
      {modoVisualizacao === "insights" && insights && (
        <div className="mx-auto max-w-3xl space-y-16">
          {/* --- Cabeçalho Editorial --- */}
          <header className="text-center">
            <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
              {ehConsolidado ? "Análise Consolidada" : "Análise de Carteira"}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {ehConsolidado ? "Todos os meses" : formatarMesReferenciaSeguro(insights.mesReferencia)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {ehConsolidado && <span>{relatorios.length} relatórios analisados — </span>}
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
              Análises Detalhadas
            </h2>
            <Separator className="my-3" />
            <div className="space-y-14">
              {insights.insights.map((insight, indice) => (
                <InsightCard
                  key={indice}
                  insight={insight}
                  indiceInsight={indice}
                  identificadorRelatorio={
                    ehConsolidado ? "consolidado" : (relatorioSelecionado?.identificador ?? periodoSelecionado)
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
          <div className="flex justify-center gap-3 pb-12">
            <Button variant="outline" onClick={voltarParaLista}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
