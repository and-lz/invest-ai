import { NextResponse } from "next/server";
import { obterGenerateInsightsUseCase } from "@/lib/container";
import { AppError } from "@/domain/errors/app-errors";
import { z } from "zod/v4";

const InsightsRequestSchema = z.object({
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
});

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
      return NextResponse.json(
        { erro: erro.message, codigo: erro.code },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { erro: "Falha ao gerar insights" },
      { status: 500 },
    );
  }
}
