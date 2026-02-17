import { NextResponse } from "next/server";
import { lerTarefa } from "@/lib/tarefa-background";
import { requireAuth } from "@/lib/auth-utils";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

export async function GET(_request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { taskId } = await params;
    const tarefa = await lerTarefa(taskId);

    if (!tarefa) {
      return NextResponse.json({ erro: "Tarefa nao encontrada" }, { status: 404 });
    }

    return NextResponse.json(tarefa, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao buscar status da tarefa:", erro);
    return NextResponse.json({ erro: "Falha ao buscar status da tarefa" }, { status: 500 });
  }
}
