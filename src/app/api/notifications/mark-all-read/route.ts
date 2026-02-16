import { NextResponse } from "next/server";
import { marcarTodasComoVisualizadas } from "@/lib/notificacao";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

export const dynamic = "force-dynamic";

export async function PATCH() {
  try {
    await marcarTodasComoVisualizadas();
    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao marcar todas notificacoes como visualizadas:", erro);
    return NextResponse.json({ erro: "Falha ao marcar todas notificacoes" }, { status: 500 });
  }
}
