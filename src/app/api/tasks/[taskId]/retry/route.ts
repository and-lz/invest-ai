import { NextResponse } from "next/server";
import { lerTarefa, salvarTarefa } from "@/lib/background-task";
import { dispatchTaskByType } from "@/lib/dispatch-task";
import { cabecalhosSemCache } from "@/lib/cache-headers";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  const { taskId } = await params;
  const tarefa = await lerTarefa(taskId);

  if (!tarefa) {
    return NextResponse.json({ erro: "Tarefa nao encontrada" }, { status: 404 });
  }

  if (tarefa.status !== "erro") {
    return NextResponse.json(
      { erro: "Apenas tarefas com erro podem ser retentadas" },
      { status: 400 },
    );
  }

  if (!tarefa.erroRecuperavel) {
    return NextResponse.json(
      { erro: "Este tipo de erro nao permite retry automatico" },
      { status: 400 },
    );
  }

  // Resetar tarefa para processando
  const tarefaResetada = {
    ...tarefa,
    status: "processando" as const,
    concluidoEm: undefined,
    erro: undefined,
    erroRecuperavel: false,
    proximaTentativaEm: undefined,
  };

  await salvarTarefa(tarefaResetada);

  const foiDespachada = dispatchTaskByType(tarefaResetada, authCheck.session.user.userId);

  if (!foiDespachada) {
    await salvarTarefa({
      ...tarefa,
      status: "erro",
      erro: "Este tipo de tarefa nao suporta retry",
      erroRecuperavel: false,
    });

    return NextResponse.json({ erro: "Este tipo de tarefa nao suporta retry" }, { status: 400 });
  }

  return NextResponse.json(
    { identificadorTarefa: taskId, status: "processando" },
    { status: 202, ...cabecalhosSemCache() },
  );
}
