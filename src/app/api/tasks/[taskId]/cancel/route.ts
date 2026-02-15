import { NextResponse } from "next/server";
import { cancelarTarefa, lerTarefa, descreverTarefa } from "@/lib/tarefa-background";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";
import { adicionarNotificacao } from "@/lib/notificacao";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const tarefa = await lerTarefa(taskId);

  if (!tarefa) {
    return NextResponse.json({ erro: "Tarefa nao encontrada" }, { status: 404 });
  }

  if (tarefa.status !== "processando") {
    return NextResponse.json(
      { erro: "Apenas tarefas em andamento podem ser canceladas" },
      { status: 400 },
    );
  }

  const foiCancelada = await cancelarTarefa(taskId, "usuario");

  if (!foiCancelada) {
    return NextResponse.json(
      { erro: "Nao foi possivel cancelar a tarefa" },
      { status: 500 },
    );
  }

  // Criar notificação de cancelamento (server-side)
  const descricao = descreverTarefa(tarefa);
  await adicionarNotificacao({
    tipo: "info",
    titulo: "Tarefa cancelada",
    descricao: `${descricao} foi cancelada.`,
  });

  return NextResponse.json(
    { identificadorTarefa: taskId, status: "cancelada" },
    { status: 200, ...cabecalhosSemCache() },
  );
}
