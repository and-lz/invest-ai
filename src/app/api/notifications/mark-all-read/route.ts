import { NextResponse } from "next/server";
import { marcarTodasComoVisualizadas } from "@/lib/notificacao";

export async function PATCH() {
  try {
    await marcarTodasComoVisualizadas();
    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro ao marcar todas notificacoes como visualizadas:", erro);
    return NextResponse.json({ erro: "Falha ao marcar todas notificacoes" }, { status: 500 });
  }
}
