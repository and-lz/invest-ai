"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { useDadosAtivo, useListaAtivosCarteira } from "@/hooks/use-dados-ativo";
import { useAnaliseIaAtivo, dispararAnaliseIaAtivo } from "@/hooks/use-analise-ia-ativo";
import { SeletorAtivo } from "@/components/desempenho/seletor-ativo";
import { CardsResumoAtivo } from "@/components/desempenho/cards-resumo-ativo";
import { GraficoEvolucaoAtivo } from "@/components/desempenho/grafico-evolucao-ativo";
import { GraficoRendimentos } from "@/components/desempenho/grafico-rendimentos";
import { TabelaMovimentacoes } from "@/components/desempenho/tabela-movimentacoes";
import { AnaliseIaAtivo } from "@/components/desempenho/analise-ia-ativo";
import { adicionarTarefaAtivaNoStorage } from "@/components/layout/indicador-tarefa-ativa";
import { notificar } from "@/lib/notificar";

function DesempenhoConteudo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tickerDaUrl = searchParams.get("ticker");

  const [tickerSelecionado, setTickerSelecionado] = useState<string | null>(tickerDaUrl);
  const [analisandoComIa, setAnalisandoComIa] = useState(false);

  const { ativosCarteira, estaCarregando: carregandoLista } = useListaAtivosCarteira();
  const { dadosAtivo, estaCarregando: carregandoDados, revalidar: revalidarDados } = useDadosAtivo(tickerSelecionado);
  const { analise, estaCarregando: carregandoAnalise, revalidar: revalidarAnalise } = useAnaliseIaAtivo(tickerSelecionado);

  // Sincronizar ticker da URL com o estado
  useEffect(() => {
    if (tickerDaUrl && tickerDaUrl !== tickerSelecionado) {
      setTickerSelecionado(tickerDaUrl);
    }
  }, [tickerDaUrl, tickerSelecionado]);

  const handleSelecionarTicker = useCallback(
    (ticker: string) => {
      setTickerSelecionado(ticker);
      router.push(`/desempenho?ticker=${encodeURIComponent(ticker)}`, { scroll: false });
    },
    [router],
  );

  const handleAnalisarComIa = useCallback(async () => {
    if (!tickerSelecionado) return;

    setAnalisandoComIa(true);
    try {
      const identificadorTarefa = await dispararAnaliseIaAtivo(tickerSelecionado);
      adicionarTarefaAtivaNoStorage(identificadorTarefa);
      notificar.info("Analise iniciada", {
        description: `Analisando ${tickerSelecionado} com IA...`,
      });

      // Polling para verificar quando a analise esta pronta
      const intervaloPoll = setInterval(async () => {
        const resultado = await revalidarAnalise();
        if (resultado?.analise) {
          clearInterval(intervaloPoll);
          setAnalisandoComIa(false);
        }
      }, 3000);

      // Timeout de 3 minutos
      setTimeout(() => {
        clearInterval(intervaloPoll);
        setAnalisandoComIa(false);
      }, 180_000);
    } catch {
      notificar.error("Erro ao iniciar analise", {
        description: "Tente novamente mais tarde.",
      });
      setAnalisandoComIa(false);
    }
  }, [tickerSelecionado, revalidarAnalise]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <Header
          titulo="Desempenho de Ativo"
          descricao="Analise detalhada de ativos da sua carteira ou do mercado"
        />
      </div>

      {/* Seletor de Ativo */}
      <div className="flex flex-wrap items-center gap-3">
        <SeletorAtivo
          ativosCarteira={ativosCarteira}
          tickerSelecionado={tickerSelecionado}
          aoSelecionarTicker={handleSelecionarTicker}
          estaCarregando={carregandoLista}
        />

        {tickerSelecionado && dadosAtivo && !analise && (
          <Button
            onClick={() => void handleAnalisarComIa()}
            disabled={analisandoComIa}
            variant="outline"
            className="gap-2"
          >
            {analisandoComIa ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {analisandoComIa ? "Analisando..." : "Analisar com IA"}
          </Button>
        )}

        {analise && (
          <Button
            onClick={() => void handleAnalisarComIa()}
            disabled={analisandoComIa}
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${analisandoComIa ? "animate-spin" : ""}`} />
            Re-analisar
          </Button>
        )}
      </div>

      {/* Estado vazio */}
      {!tickerSelecionado && !carregandoLista && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Selecione um ativo da sua carteira ou busque por ticker para ver a analise de desempenho.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {tickerSelecionado && carregandoDados && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={indice} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
      )}

      {/* Dados carregados */}
      {dadosAtivo && !carregandoDados && (
        <>
          {/* KPI Cards */}
          <CardsResumoAtivo dadosAtivo={dadosAtivo} />

          {/* Charts lado a lado */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GraficoEvolucaoAtivo
              historico={dadosAtivo.historicoNaCarteira}
              nomeAtivo={dadosAtivo.nomeAtivo}
            />
            <GraficoRendimentos
              eventos={dadosAtivo.eventosFinanceirosDoAtivo}
              nomeAtivo={dadosAtivo.nomeAtivo}
            />
          </div>

          {/* Movimentacoes */}
          <TabelaMovimentacoes
            movimentacoes={dadosAtivo.movimentacoesDoAtivo}
            nomeAtivo={dadosAtivo.nomeAtivo}
          />

          {/* Analise IA */}
          {carregandoAnalise && tickerSelecionado && (
            <Skeleton className="h-96" />
          )}

          {analise && <AnaliseIaAtivo analise={analise} />}

          {/* Estado sem dados (busca livre sem resultados) */}
          {!dadosAtivo.estaNaCarteira &&
            !dadosAtivo.cotacaoAtual &&
            dadosAtivo.historicoNaCarteira.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground text-center">
                    Nenhum dado encontrado para {tickerSelecionado}. Verifique se o ticker esta correto.
                  </p>
                  <Button variant="outline" onClick={() => void revalidarDados()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  );
}

export default function DesempenhoPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={indice} className="h-28" />
            ))}
          </div>
        </div>
      }
    >
      <DesempenhoConteudo />
    </Suspense>
  );
}
