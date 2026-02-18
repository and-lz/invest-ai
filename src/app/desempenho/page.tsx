"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useContextoPaginaChat } from "@/contexts/contexto-pagina-chat";
import { serializarContextoDesempenho } from "@/lib/serializar-contexto-chat";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, BotIcon, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { useDadosAtivo, useListaAtivosCarteira } from "@/hooks/use-dados-ativo";
import { useAnaliseIaAtivo, dispararAnaliseIaAtivo } from "@/hooks/use-analise-ia-ativo";
import { GridAtivosCarteira } from "@/components/desempenho/grid-ativos-carteira";
import { CardsResumoAtivo } from "@/components/desempenho/cards-resumo-ativo";
import { revalidarTarefasAtivas } from "@/hooks/use-tarefas-ativas";
import { notificar } from "@/lib/notificar";

// Lazy-load chart-heavy components to reduce initial bundle size
const GraficoEvolucaoAtivo = dynamic(
  () =>
    import("@/components/desempenho/grafico-evolucao-ativo").then((m) => m.GraficoEvolucaoAtivo),
  { loading: () => <Skeleton className="h-80" /> },
);

const GraficoRendimentos = dynamic(
  () => import("@/components/desempenho/grafico-rendimentos").then((m) => m.GraficoRendimentos),
  { loading: () => <Skeleton className="h-80" /> },
);

const TabelaMovimentacoes = dynamic(
  () => import("@/components/desempenho/tabela-movimentacoes").then((m) => m.TabelaMovimentacoes),
  { loading: () => <Skeleton className="h-64" /> },
);

const AnaliseIaAtivo = dynamic(
  () => import("@/components/desempenho/analise-ia-ativo").then((m) => m.AnaliseIaAtivo),
  { loading: () => <Skeleton className="h-96" /> },
);

function DesempenhoConteudo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tickerDaUrl = searchParams.get("ticker");

  const [tickerSelecionado, setTickerSelecionado] = useState<string | null>(tickerDaUrl);
  const [analisandoComIa, setAnalisandoComIa] = useState(false);

  const { ativosCarteira, estaCarregando: carregandoLista } = useListaAtivosCarteira();
  const {
    dadosAtivo,
    estaCarregando: carregandoDados,
    revalidar: revalidarDados,
  } = useDadosAtivo(tickerSelecionado);
  const {
    analise,
    estaCarregando: carregandoAnalise,
    revalidar: revalidarAnalise,
  } = useAnaliseIaAtivo(tickerSelecionado);

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useContextoPaginaChat();
  const contextoSerializado = useMemo(
    () => (dadosAtivo ? serializarContextoDesempenho(dadosAtivo) : undefined),
    [dadosAtivo],
  );
  useEffect(() => {
    definirContexto("desempenho", contextoSerializado);
  }, [definirContexto, contextoSerializado]);

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
      await dispararAnaliseIaAtivo(tickerSelecionado);
      revalidarTarefasAtivas();
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
        <BarChart3 className="text-muted-foreground h-6 w-6" aria-hidden="true" />
        <Header
          titulo="Desempenho de Ativo"
          descricao="Analise detalhada de ativos da sua carteira ou do mercado"
        />
      </div>

      {/* Grid de Ativos */}
      <GridAtivosCarteira
        ativosCarteira={ativosCarteira}
        tickerSelecionado={tickerSelecionado}
        aoSelecionarTicker={handleSelecionarTicker}
        estaCarregando={carregandoLista}
      />

      {/* Botões de Ação */}
      {tickerSelecionado && dadosAtivo && (
        <div className="flex flex-wrap items-center gap-3">
          {!analise && (
            <Button
              onClick={() => void handleAnalisarComIa()}
              disabled={analisandoComIa}
              className="ai-gradient-bg ai-button gap-2 border-0 text-white disabled:opacity-60"
            >
              {analisandoComIa ? (
                <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
              ) : (
                <BotIcon className="relative z-10 h-4 w-4" />
              )}
              <span className="relative z-10">{analisandoComIa ? "Analisando..." : "Analisar com IA"}</span>
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
              <RefreshCw className={`h-4 w-4 ${analisandoComIa ? "animate-spin" : ""}`} />
              Re-analisar
            </Button>
          )}
        </div>
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
          {carregandoAnalise && tickerSelecionado && <Skeleton className="h-96" />}

          {analise && <AnaliseIaAtivo analise={analise} />}

          {/* Estado sem dados (busca livre sem resultados) */}
          {!dadosAtivo.estaNaCarteira &&
            !dadosAtivo.cotacaoAtual &&
            dadosAtivo.historicoNaCarteira.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-12">
                  <AlertTriangle className="text-muted-foreground h-12 w-12" />
                  <p className="text-muted-foreground text-center">
                    Nenhum dado encontrado para {tickerSelecionado}. Verifique se o ticker esta
                    correto.
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
