import { NextResponse, after } from "next/server";
import { obterRegenerateReportUseCase, obterGetReportDetailUseCase, obterAiConfigParaUsuario } from "@/lib/container";
import { salvarTarefa } from "@/lib/background-task";
import { executeBackgroundTask } from "@/lib/background-task-executor";
import type { TarefaBackground } from "@/lib/background-task";
import { requireAuth } from "@/lib/auth-utils";
import { cabecalhosSemCache } from "@/lib/cache-headers";
import { cacheGlobal } from "@/lib/in-memory-cache";
import { ReportNotFoundError } from "@/domain/errors/app-errors";

interface RouteParams {
  params: Promise<{ reportId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { reportId } = await params;

    // Verify report exists and has status "concluido" (PDF available)
    const detailUseCase = await obterGetReportDetailUseCase();
    const detalhe = await detailUseCase.executar(reportId);

    if (detalhe.metadados.statusExtracao !== "concluido") {
      return NextResponse.json(
        { erro: "Apenas relatorios com status 'concluido' podem ser reextraidos" },
        { status: 400 },
      );
    }

    const identificadorTarefa = crypto.randomUUID();

    const tarefa: TarefaBackground = {
      identificador: identificadorTarefa,
      usuarioId: authCheck.session.user.userId,
      tipo: "reextrair-relatorio",
      status: "processando",
      iniciadoEm: new Date().toISOString(),
      parametros: { identificadorRelatorio: reportId },
    };

    await salvarTarefa(tarefa);

    cacheGlobal.invalidarPorPrefixo(`dashboard:${authCheck.session.user.userId}`);

    after(executeBackgroundTask({
      tarefa,
      rotuloLog: "Reextracao",
      usuarioId: authCheck.session.user.userId,
      executarOperacao: async () => {
        const aiConfig = await obterAiConfigParaUsuario(authCheck.session.user.userId);
        const useCase = await obterRegenerateReportUseCase(aiConfig);
        const resultado = await useCase.executar({ identificador: reportId });
        return {
          descricaoResultado: `Relatorio ${resultado.metadados.mesReferencia} reextraido`,
          urlRedirecionamento: "/",
        };
      },
    }));

    return NextResponse.json(
      { identificadorTarefa, status: "processando" },
      { status: 202, ...cabecalhosSemCache() },
    );
  } catch (erro) {
    if (erro instanceof ReportNotFoundError) {
      return NextResponse.json({ erro: erro.message }, { status: 404 });
    }
    console.error("Erro ao iniciar reextracao:", erro);
    return NextResponse.json({ erro: "Falha ao iniciar reextracao" }, { status: 500 });
  }
}
