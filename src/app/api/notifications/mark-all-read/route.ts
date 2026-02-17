import { NextResponse } from "next/server";
import { marcarTodasComoVisualizadas } from "@/lib/notificacao";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function PATCH() {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    await marcarTodasComoVisualizadas(authCheck.session.user.userId);
    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao marcar todas notificacoes como visualizadas:", erro);
    return NextResponse.json({ erro: "Falha ao marcar todas notificacoes" }, { status: 500 });
  }
}
