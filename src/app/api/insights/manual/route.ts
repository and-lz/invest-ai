import { NextResponse } from "next/server";
import {
  obterSalvarInsightsManualUseCase,
  obterGetReportDetailUseCase,
  obterListReportsUseCase,
} from "@/lib/container";
import {
  gerarPromptInsightsManual,
  gerarPromptInsightsConsolidadoManual,
} from "@/lib/prompt-insights-manual";
import { AppError } from "@/domain/errors/app-errors";
import { requireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const GerarPromptRequestSchema = z.object({
  acao: z.literal("gerar-prompt"),
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
  consolidado: z.boolean().optional(),
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
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

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
      // Modo consolidado: gerar prompt com todos os relatórios
      if (dados.consolidado) {
        const detailUseCase = await obterGetReportDetailUseCase();
        const listUseCase = await obterListReportsUseCase();
        const todosMetadados = await listUseCase.executar();

        const todosRelatorios = await Promise.all(
          todosMetadados.map(async (metadados) => {
            const detalhe = await detailUseCase.executar(metadados.identificador);
            return detalhe.dados;
          }),
        );

        // Ordenar cronologicamente (mais antigo primeiro)
        const relatoriosOrdenados = todosRelatorios.sort((relatorioA, relatorioB) =>
          relatorioA.metadados.mesReferencia.localeCompare(relatorioB.metadados.mesReferencia),
        );

        const promptCompleto = gerarPromptInsightsConsolidadoManual(relatoriosOrdenados);
        return NextResponse.json({ prompt: promptCompleto });
      }

      // Modo mensal: gerar prompt com relatório atual + anterior
      const detailUseCase = await obterGetReportDetailUseCase();
      const relatorioAtual = await detailUseCase.executar(dados.identificadorRelatorio);

      let dadosRelatorioAnterior = null;
      if (dados.identificadorRelatorioAnterior) {
        const relatorioAnterior = await detailUseCase.executar(
          dados.identificadorRelatorioAnterior,
        );
        dadosRelatorioAnterior = relatorioAnterior.dados;
      } else {
        const listUseCase = await obterListReportsUseCase();
        const todosRelatorios = await listUseCase.executar();
        const indiceAtual = todosRelatorios.findIndex(
          (relatorio) => relatorio.identificador === dados.identificadorRelatorio,
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
    const useCase = await obterSalvarInsightsManualUseCase();
    const insights = await useCase.executar({
      identificadorRelatorio: dados.identificadorRelatorio,
      jsonBruto: dados.json,
    });

    return NextResponse.json({ sucesso: true, insights });
  } catch (erro) {
    console.error("Erro ao processar insights manual:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Falha ao processar insights" }, { status: 500 });
  }
}
