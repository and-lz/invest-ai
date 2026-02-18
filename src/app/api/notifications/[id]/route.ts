import { NextResponse } from "next/server";
import { marcarComoVisualizada } from "@/lib/notification";
import { cabecalhosSemCache } from "@/lib/cache-headers";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { id } = await params;
    await marcarComoVisualizada(authCheck.session.user.userId, id);
    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao marcar notificacao como visualizada:", erro);
    return NextResponse.json({ erro: "Falha ao atualizar notificacao" }, { status: 500 });
  }
}
