import { NextResponse, after } from "next/server";
import { z } from "zod/v4";
import { obterAnalyzeAssetPerformanceUseCase } from "@/lib/container";
import { salvarTarefa } from "@/lib/background-task";
import { executeBackgroundTask } from "@/lib/background-task-executor";
import { salvarAnaliseAtivo } from "@/lib/asset-analysis-storage";
import type { TarefaBackground } from "@/lib/background-task";
import { AppError } from "@/domain/errors/app-errors";
import { cabecalhosSemCache } from "@/lib/cache-headers";
import { requireAuth } from "@/lib/auth-utils";

const AnalisarAtivoRequestSchema = z.object({
  codigoAtivo: z.string().min(1),
});

/**
 * POST /api/asset-performance/analyze
 *
 * Dispara analise de desempenho de ativo via IA em background.
 * Retorna 202 Accepted com identificador da tarefa para polling.
 */
export async function POST(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  const usuarioId = authCheck.session.user.userId;

  try {
    const corpo: unknown = await request.json();
    const resultado = AnalisarAtivoRequestSchema.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: resultado.error.issues },
        { status: 400 },
      );
    }

    const codigoAtivo = resultado.data.codigoAtivo.toUpperCase();
    const identificadorTarefa = crypto.randomUUID();

    const tarefa: TarefaBackground = {
      identificador: identificadorTarefa,
      usuarioId,
      tipo: "analisar-ativo",
      status: "processando",
      iniciadoEm: new Date().toISOString(),
      parametros: { codigoAtivo },
    };

    await salvarTarefa(tarefa);

    after(executeBackgroundTask({
      tarefa,
      rotuloLog: "Analise Ativo",
      usuarioId,
      executarOperacao: async () => {
        const useCase = await obterAnalyzeAssetPerformanceUseCase();
        const analise = await useCase.executar({ codigoAtivo });

        // Persistir resultado para cache
        await salvarAnaliseAtivo(analise, usuarioId);

        return {
          descricaoResultado: `Analise de ${codigoAtivo} concluida`,
          urlRedirecionamento: `/desempenho?ticker=${encodeURIComponent(codigoAtivo)}`,
        };
      },
    }));

    return NextResponse.json(
      { identificadorTarefa, status: "processando" },
      { status: 202, ...cabecalhosSemCache() },
    );
  } catch (erro) {
    console.error("Erro ao iniciar analise de ativo:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Falha ao iniciar analise de ativo" }, { status: 500 });
  }
}
