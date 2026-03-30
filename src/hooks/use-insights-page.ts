import { useState, useCallback, useEffect, useMemo } from "react";
import { useChatPageContext } from "@/contexts/chat-page-context";
import { serializarContextoInsights } from "@/lib/serialize-chat-context";
import { useReports } from "@/hooks/use-reports";
import { revalidarTarefasAtivas } from "@/hooks/use-active-tasks";
import type { InsightsResponse, StatusAcao } from "@/schemas/insights.schema";

export type ModoVisualizacao = "lista" | "insights";

export function useInsightsPage() {
  const { relatorios, estaCarregando: carregandoRelatorios, erro: erroRelatorios } = useReports();
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [estaGerando, setEstaGerando] = useState(false);
  const [erroInsights, setErroInsights] = useState<string | null>(null);
  const [modoVisualizacao, setModoVisualizacao] = useState<ModoVisualizacao>("lista");
  const [estaCarregandoInsights, setEstaCarregandoInsights] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("");

  const temErroRelatorios = !!erroRelatorios;

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useChatPageContext();
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

  const gerarInsightsViaApi = useCallback(async () => {
    let periodo = periodoSelecionado;
    if (!periodo && relatorios.length > 0) {
      const relatorioRecente = relatorios[0];
      if (relatorioRecente) {
        periodo = relatorioRecente.mesReferencia;
        setPeriodoSelecionado(periodo);
      }
    }
    if (relatorios.length === 0 || !periodo) return;

    setEstaGerando(true);
    setErroInsights(null);

    try {
      let corpo: Record<string, string | boolean>;
      const consolidado = periodo === "consolidado";

      if (consolidado) {
        const primeiroRelatorio = relatorios[0];
        if (!primeiroRelatorio) return;

        corpo = {
          identificadorRelatorio: primeiroRelatorio.identificador,
          consolidado: true,
        };
      } else {
        const relatorioDoPerido = relatorios.find(
          (relatorio) => relatorio.mesReferencia === periodo,
        );
        if (!relatorioDoPerido) return;

        corpo = {
          identificadorRelatorio: relatorioDoPerido.identificador,
        };

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

      const dados = (await resposta.json()) as { identificadorTarefa?: string };
      if (dados.identificadorTarefa) {
        revalidarTarefasAtivas();
      }

      setModoVisualizacao("lista");
      setErroInsights(null);
    } catch (erro) {
      setErroInsights(erro instanceof Error ? erro.message : "Erro desconhecido");
    } finally {
      setEstaGerando(false);
    }
  }, [relatorios, periodoSelecionado]);

  const handleInsightsDeleted = useCallback(
    (identificador: string) => {
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

  return {
    // State
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
    // Actions
    setPeriodoSelecionado,
    handleSelectInsight,
    voltarParaLista,
    gerarInsightsViaApi,
    handleInsightsDeleted,
    handleStatusAlterado,
  };
}
