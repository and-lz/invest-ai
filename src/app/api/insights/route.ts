import { NextResponse } from "next/server";
import {
  obterGenerateInsightsUseCase,
  obterGenerateInsightsConsolidadosUseCase,
  obterListReportsUseCase,
  obterFilesystemReportRepository,
  obterAtualizarConclusaoInsightUseCase,
} from "@/lib/container";
import { AppError } from "@/domain/errors/app-errors";
import { z } from "zod/v4";
import { StatusAcaoEnum } from "@/schemas/insights.schema";
import { salvarTarefa } from "@/lib/tarefa-background";
import type { TarefaBackground } from "@/lib/tarefa-background";

const InsightsRequestSchema = z.object({
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
  consolidado: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mesAnoParam = searchParams.get("mesAno");

    // Busca direta para insights consolidados
    if (mesAnoParam === "consolidado") {
      const repository = obterFilesystemReportRepository();
      const insights = await repository.obterInsights("consolidado");
      return NextResponse.json({
        insights,
        identificadorRelatorio: "consolidado",
        mesReferencia: "consolidado",
      });
    }

    const listUseCase = obterListReportsUseCase();
    const relatorios = await listUseCase.executar();

    if (relatorios.length === 0) {
      return NextResponse.json({ insights: null, identificadorRelatorio: null });
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
      return NextResponse.json({ insights: null, identificadorRelatorio: null });
    }

    const repository = obterFilesystemReportRepository();
    const insights = await repository.obterInsights(relatorioSelecionado.identificador);

    return NextResponse.json({
      insights,
      identificadorRelatorio: relatorioSelecionado.identificador,
      mesReferencia: relatorioSelecionado.mesReferencia,
    });
  } catch (erro) {
    console.error("Erro ao buscar insights:", erro);
    return NextResponse.json({ erro: "Falha ao buscar insights" }, { status: 500 });
  }
}

async function processarInsightsMensaisEmBackground(
  tarefa: TarefaBackground,
  identificadorRelatorio: string,
  identificadorRelatorioAnterior: string | undefined,
): Promise<void> {
  try {
    const useCase = obterGenerateInsightsUseCase();
    await useCase.executar({
      identificadorRelatorio,
      identificadorRelatorioAnterior,
    });

    await salvarTarefa({
      ...tarefa,
      status: "concluido",
      concluidoEm: new Date().toISOString(),
      descricaoResultado: `Insights para ${identificadorRelatorio} gerados`,
      urlRedirecionamento: `/insights?mesAno=${encodeURIComponent(identificadorRelatorio)}`,
    });

    console.info(
      `[Insights] Tarefa ${tarefa.identificador} concluída: ${identificadorRelatorio}`,
    );
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);

    await salvarTarefa({
      ...tarefa,
      status: "erro",
      concluidoEm: new Date().toISOString(),
      erro: mensagemErro,
    });

    console.error(`[Insights] Tarefa ${tarefa.identificador} falhou:`, mensagemErro);
  }
}

async function processarInsightsConsolidadosEmBackground(
  tarefa: TarefaBackground,
): Promise<void> {
  try {
    const useCase = obterGenerateInsightsConsolidadosUseCase();
    await useCase.executar();

    await salvarTarefa({
      ...tarefa,
      status: "concluido",
      concluidoEm: new Date().toISOString(),
      descricaoResultado: "Insights consolidados gerados",
      urlRedirecionamento: "/insights?mesAno=consolidado",
    });

    console.info(`[Insights Consolidados] Tarefa ${tarefa.identificador} concluída`);
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);

    await salvarTarefa({
      ...tarefa,
      status: "erro",
      concluidoEm: new Date().toISOString(),
      erro: mensagemErro,
    });

    console.error(
      `[Insights Consolidados] Tarefa ${tarefa.identificador} falhou:`,
      mensagemErro,
    );
  }
}

export async function POST(request: Request) {
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
    };

    await salvarTarefa(tarefa);

    // Fire-and-forget: processar em background
    if (ehConsolidado) {
      void processarInsightsConsolidadosEmBackground(tarefa);
    } else {
      void processarInsightsMensaisEmBackground(
        tarefa,
        resultado.data.identificadorRelatorio,
        resultado.data.identificadorRelatorioAnterior,
      );
    }

    return NextResponse.json(
      { identificadorTarefa, status: "processando" },
      { status: 202 },
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
  try {
    const corpo: unknown = await request.json();
    const resultado = AtualizarConclusaoRequestSchema.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: resultado.error.issues },
        { status: 400 },
      );
    }

    const useCase = obterAtualizarConclusaoInsightUseCase();
    const insights = await useCase.executar({
      identificadorRelatorio: resultado.data.identificadorRelatorio,
      indiceInsight: resultado.data.indiceInsight,
      concluida: resultado.data.concluida,
      statusAcao: resultado.data.statusAcao,
    });

    return NextResponse.json({ insights });
  } catch (erro) {
    console.error("Erro ao atualizar conclusao de insight:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Falha ao atualizar conclusao de insight" }, { status: 500 });
  }
}
