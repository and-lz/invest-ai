import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterSavedMessageRepository } from "@/lib/container";
import { cabecalhosSemCache } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/saved-messages/[id]
 * Removes a saved message by its original message ID.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const { id: mensagemId } = await params;
    const repository = obterSavedMessageRepository();
    await repository.remove(verificacaoAuth.session.user.userId, mensagemId);

    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[SavedMessages] Erro ao remover:", erro);
    return NextResponse.json({ erro: "Falha ao remover mensagem salva" }, { status: 500 });
  }
}
