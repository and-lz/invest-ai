import { NextResponse } from "next/server";
import {
  obterGenerateInsightsUseCase,
  obterListReportsUseCase,
  obterFilesystemReportRepository,
  obterAtualizarConclusaoInsightUseCase,
} from "@/lib/container";
import { AppError } from "@/domain/errors/app-errors";
import { z } from "zod/v4";
import { StatusAcaoEnum } from "@/schemas/insights.schema";

const InsightsRequestSchema = z.object({
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mesAnoParam = searchParams.get("mesAno");

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

    const useCase = obterGenerateInsightsUseCase();
    const insights = await useCase.executar({
      identificadorRelatorio: resultado.data.identificadorRelatorio,
      identificadorRelatorioAnterior: resultado.data.identificadorRelatorioAnterior,
    });

    return NextResponse.json({ insights });
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
