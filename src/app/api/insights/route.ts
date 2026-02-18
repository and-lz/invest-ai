import { NextResponse, after } from "next/server";
import {
  obterGenerateInsightsUseCase,
  obterGenerateConsolidatedInsightsUseCase,
  obterListReportsUseCase,
  obterReportRepository,
  obterUpdateInsightConclusionUseCase,
  obterListInsightsUseCase,
  obterDeleteInsightsUseCase,
} from "@/lib/container";
import { AppError, InsightsNotFoundError } from "@/domain/errors/app-errors";
import { requireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";
import { StatusAcaoEnum } from "@/schemas/insights.schema";
import { salvarTarefa } from "@/lib/background-task";
import { executeBackgroundTask } from "@/lib/background-task-executor";
import type { TarefaBackground } from "@/lib/background-task";
import { cabecalhosCachePrivado, cabecalhosSemCache } from "@/lib/cache-headers";

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

    // List all insights metadata
    if (searchParams.get("list") === "true") {
      const useCase = await obterListInsightsUseCase();
      const insightsMetadados = await useCase.executar();
      return NextResponse.json({ insightsMetadados }, cabecalhosCachePrivado(60, 300));
    }

    const mesAnoParam = searchParams.get("mesAno");

    // Busca direta para insights consolidados
    if (mesAnoParam === "consolidado") {
      const repository = await obterReportRepository();
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

    const repository = await obterReportRepository();
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
      usuarioId: authCheck.session.user.userId,
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
      after(executeBackgroundTask({
        tarefa,
        rotuloLog: "Insights Consolidados",
        usuarioId: authCheck.session.user.userId,
        executarOperacao: async () => {
          const useCase = await obterGenerateConsolidatedInsightsUseCase();
          await useCase.executar();
          return {
            descricaoResultado: "Insights consolidados gerados",
            urlRedirecionamento: "/insights?mesAno=consolidado",
          };
        },
      }));
    } else {
      const identificadorRelatorio = resultado.data.identificadorRelatorio;
      const identificadorRelatorioAnterior = resultado.data.identificadorRelatorioAnterior;

      after(executeBackgroundTask({
        tarefa,
        rotuloLog: "Insights",
        usuarioId: authCheck.session.user.userId,
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
      }));
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

    const useCase = await obterUpdateInsightConclusionUseCase();
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

export async function DELETE(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { searchParams } = new URL(request.url);
    const identificador = searchParams.get("identificador");

    if (!identificador) {
      return NextResponse.json(
        { erro: "Parameter 'identificador' is required" },
        { status: 400 },
      );
    }

    const useCase = await obterDeleteInsightsUseCase();
    await useCase.executar(identificador);

    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    if (erro instanceof InsightsNotFoundError) {
      return NextResponse.json({ erro: erro.message }, { status: 404 });
    }

    console.error("Error deleting insights:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Failed to delete insights" }, { status: 500 });
  }
}
