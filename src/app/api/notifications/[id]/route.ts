import { NextResponse } from "next/server";
import { marcarComoVisualizada } from "@/lib/notificacao";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await marcarComoVisualizada(id);
    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao marcar notificacao como visualizada:", erro);
    return NextResponse.json({ erro: "Falha ao atualizar notificacao" }, { status: 500 });
  }
}
