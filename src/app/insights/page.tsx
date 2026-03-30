"use client";

import { Header } from "@/components/layout/header";
import { isAiEnabled } from "@/lib/ai-features";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { InsightsList } from "@/components/insights/insights-list";
import { InsightCard } from "@/components/insights/insight-card";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { Lightbulb, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMesReferenciaSeguro } from "@/lib/insights-constants";
import { useInsightsPage } from "@/hooks/use-insights-page";

export default function InsightsPage() {
  const {
    relatorios,
    insights,
    carregandoRelatorios,
    estaCarregandoInsights,
    estaGerando,
    erroInsights,
    temErroRelatorios,
    modoVisualizacao,
    periodoSelecionado,
    periodosDisponiveis,
    ehConsolidado,
    relatorioSelecionado,
    setPeriodoSelecionado,
    handleSelectInsight,
    voltarParaLista,
    gerarInsightsViaApi,
    handleInsightsDeleted,
    handleStatusAlterado,
  } = useInsightsPage();

  if (!isAiEnabled()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <Header
            titulo="Análises Fortuna"
            descricao="Analise inteligente da sua carteira de investimentos"
          />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Lightbulb className="text-muted-foreground h-12 w-12" />
            <p className="text-muted-foreground">
              Funcionalidade disponível apenas em desenvolvimento. Execute o app localmente para gerar análises com a Fortuna.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            titulo="Análises Fortuna"
            descricao="Analise inteligente da sua carteira de investimentos"
          />
        </div>
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
              onGenerateNew={() => void gerarInsightsViaApi()}
            />
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <PeriodSelector
                periodosDisponiveis={periodosDisponiveis}
                periodoSelecionado={periodoSelecionado}
                onPeriodoChange={setPeriodoSelecionado}
              />
              <Button onClick={() => void gerarInsightsViaApi()} disabled={estaGerando}>
                {estaGerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {estaGerando ? "Gerando análise..." : "Gerar análise"}
              </Button>
            </div>
            {erroInsights && (
              <p className="text-destructive text-center text-sm">{erroInsights}</p>
            )}
          </>
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
