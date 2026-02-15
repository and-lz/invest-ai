import { NextResponse } from "next/server";
import {
  obterGenerateInsightsUseCase,
  obterGenerateInsightsConsolidadosUseCase,
  obterListReportsUseCase,
  obterFilesystemReportRepository,
  obterAtualizarConclusaoInsightUseCase,
} from "@/lib/container";
import { AppError } from "@/domain/errors/app-errors";
import { requireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";
import { StatusAcaoEnum } from "@/schemas/insights.schema";
import { salvarTarefa } from "@/lib/tarefa-background";
import { executarTarefaEmBackground } from "@/lib/executor-tarefa-background";
import type { TarefaBackground } from "@/lib/tarefa-background";
import { cabecalhosCachePrivado, cabecalhosSemCache } from "@/lib/cabecalhos-cache";

const InsightsRequestSchema = z.object({
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
  consolidado: z.boolean().optional(),
});

export async function GET(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { searchParams } = new URL(request.url);
    const mesAnoParam = searchParams.get("mesAno");

    // Busca direta para insights consolidados
    if (mesAnoParam === "consolidado") {
      const repository = await obterFilesystemReportRepository();
      const insights = await repository.obterInsights("consolidado");
      return NextResponse.json(
        {
          insights,
          identificadorRelatorio: "consolidado",
          mesReferencia: "consolidado",
        },
        cabecalhosCachePrivado(300, 600),
      );
    }

    const listUseCase = await obterListReportsUseCase();
    const relatorios = await listUseCase.executar();

    if (relatorios.length === 0) {
      return NextResponse.json(
        { insights: null, identificadorRelatorio: null },
        cabecalhosCachePrivado(300, 600),
      );
    }

    let relatorioSelecionado = relatorios[0];

    // Se mesAno foi fornecido, buscar o relatório específico
    if (mesAnoParam) {
      const relatorioEncontrado = relatorios.find(
        (relatorio) => relatorio.mesReferencia === mesAnoParam,
      );
      if (relatorioEncontrado) {
        relatorioSelecionado = relatorioEncontrado;
      }
    }

    if (!relatorioSelecionado) {
      return NextResponse.json(
        { insights: null, identificadorRelatorio: null },
        cabecalhosCachePrivado(300, 600),
      );
    }

    const repository = await obterFilesystemReportRepository();
    const insights = await repository.obterInsights(relatorioSelecionado.identificador);

    return NextResponse.json(
      {
        insights,
        identificadorRelatorio: relatorioSelecionado.identificador,
        mesReferencia: relatorioSelecionado.mesReferencia,
      },
      cabecalhosCachePrivado(300, 600),
    );
  } catch (erro) {
    console.error("Erro ao buscar insights:", erro);
    return NextResponse.json({ erro: "Falha ao buscar insights" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const corpo: unknown = await request.json();
    const resultado = InsightsRequestSchema.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: resultado.error.issues },
        { status: 400 },
      );
    }

    const identificadorTarefa = crypto.randomUUID();
    const ehConsolidado = resultado.data.consolidado === true;

    const tarefa: TarefaBackground = {
      identificador: identificadorTarefa,
      tipo: ehConsolidado ? "gerar-insights-consolidados" : "gerar-insights",
      status: "processando",
      iniciadoEm: new Date().toISOString(),
      parametros: ehConsolidado
        ? undefined
        : {
            identificadorRelatorio: resultado.data.identificadorRelatorio,
            ...(resultado.data.identificadorRelatorioAnterior && {
              identificadorRelatorioAnterior: resultado.data.identificadorRelatorioAnterior,
            }),
          },
    };

    await salvarTarefa(tarefa);

    if (ehConsolidado) {
      void executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Insights Consolidados",
        executarOperacao: async () => {
          const useCase = await obterGenerateInsightsConsolidadosUseCase();
          await useCase.executar();
          return {
            descricaoResultado: "Insights consolidados gerados",
            urlRedirecionamento: "/insights?mesAno=consolidado",
          };
        },
      });
    } else {
      const identificadorRelatorio = resultado.data.identificadorRelatorio;
      const identificadorRelatorioAnterior = resultado.data.identificadorRelatorioAnterior;

      void executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Insights",
        executarOperacao: async () => {
          const useCase = await obterGenerateInsightsUseCase();
          await useCase.executar({
            identificadorRelatorio,
            identificadorRelatorioAnterior,
          });
          return {
            descricaoResultado: `Insights para ${identificadorRelatorio} gerados`,
            urlRedirecionamento: `/insights?mesAno=${encodeURIComponent(identificadorRelatorio)}`,
          };
        },
      });
    }

    return NextResponse.json(
      { identificadorTarefa, status: "processando" },
      { status: 202, ...cabecalhosSemCache() },
    );
  } catch (erro) {
    console.error("Erro ao gerar insights:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Falha ao gerar insights" }, { status: 500 });
  }
}

const AtualizarConclusaoRequestSchema = z.object({
  identificadorRelatorio: z.string().min(1),
  indiceInsight: z.number().int().nonnegative(),
  // @deprecated - usar statusAcao
  concluida: z.boolean().optional(),
  statusAcao: StatusAcaoEnum.optional(),
});

export async function PATCH(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const corpo: unknown = await request.json();
    const resultado = AtualizarConclusaoRequestSchema.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: resultado.error.issues },
        { status: 400 },
      );
    }

    const useCase = await obterAtualizarConclusaoInsightUseCase();
    const insights = await useCase.executar({
      identificadorRelatorio: resultado.data.identificadorRelatorio,
      indiceInsight: resultado.data.indiceInsight,
      concluida: resultado.data.concluida,
      statusAcao: resultado.data.statusAcao,
    });

    return NextResponse.json({ insights }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao atualizar conclusao de insight:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Falha ao atualizar conclusao de insight" }, { status: 500 });
  }
}
