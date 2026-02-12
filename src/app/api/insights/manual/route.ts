import { NextResponse } from "next/server";
import {
  obterSalvarInsightsManualUseCase,
  obterGetReportDetailUseCase,
  obterListReportsUseCase,
} from "@/lib/container";
import { gerarPromptInsightsManual } from "@/lib/prompt-insights-manual";
import { AppError } from "@/domain/errors/app-errors";
import { z } from "zod/v4";

const GerarPromptRequestSchema = z.object({
  acao: z.literal("gerar-prompt"),
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
});

const SalvarInsightsRequestSchema = z.object({
  acao: z.literal("salvar"),
  identificadorRelatorio: z.string().min(1),
  json: z.string().min(1),
});

const RequestSchema = z.discriminatedUnion("acao", [
  GerarPromptRequestSchema,
  SalvarInsightsRequestSchema,
]);

export async function POST(request: Request) {
  try {
    const corpo: unknown = await request.json();
    const resultado = RequestSchema.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: resultado.error.issues },
        { status: 400 },
      );
    }

    const dados = resultado.data;

    if (dados.acao === "gerar-prompt") {
      const detailUseCase = obterGetReportDetailUseCase();
      const relatorioAtual = await detailUseCase.executar(
        dados.identificadorRelatorio,
      );

      let dadosRelatorioAnterior = null;
      if (dados.identificadorRelatorioAnterior) {
        const relatorioAnterior = await detailUseCase.executar(
          dados.identificadorRelatorioAnterior,
        );
        dadosRelatorioAnterior = relatorioAnterior.dados;
      } else {
        const listUseCase = obterListReportsUseCase();
        const todosRelatorios = await listUseCase.executar();
        const indiceAtual = todosRelatorios.findIndex(
          (relatorio) =>
            relatorio.identificador === dados.identificadorRelatorio,
        );
        if (indiceAtual >= 0 && indiceAtual < todosRelatorios.length - 1) {
          const relatorioAnteriorMeta = todosRelatorios[indiceAtual + 1];
          if (relatorioAnteriorMeta) {
            const relatorioAnterior = await detailUseCase.executar(
              relatorioAnteriorMeta.identificador,
            );
            dadosRelatorioAnterior = relatorioAnterior.dados;
          }
        }
      }

      const promptCompleto = gerarPromptInsightsManual(
        relatorioAtual.dados,
        dadosRelatorioAnterior,
      );

      return NextResponse.json({ prompt: promptCompleto });
    }

    // acao === "salvar"
    const useCase = obterSalvarInsightsManualUseCase();
    const insights = await useCase.executar({
      identificadorRelatorio: dados.identificadorRelatorio,
      jsonBruto: dados.json,
    });

    return NextResponse.json({ sucesso: true, insights });
  } catch (erro) {
    console.error("Erro ao processar insights manual:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json(
        { erro: erro.message, codigo: erro.code },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { erro: "Falha ao processar insights" },
      { status: 500 },
    );
  }
}
