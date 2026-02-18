import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterPlanoAcaoRepository } from "@/lib/container";
import { AtualizarItemPlanoSchema } from "@/schemas/plano-acao.schema";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/action-plan/[id]
 * Updates the status of an action plan item.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body: unknown = await request.json();
    const validation = AtualizarItemPlanoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: validation.error.issues },
        { status: 400 },
      );
    }

    const repository = await obterPlanoAcaoRepository();
    await repository.atualizarStatus(
      authCheck.session.user.userId,
      id,
      validation.data.status,
    );

    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[ActionPlan] Error updating status:", erro);
    return NextResponse.json(
      { erro: "Falha ao atualizar status do item" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/action-plan/[id]
 * Permanently removes an action plan item.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const repository = await obterPlanoAcaoRepository();
    await repository.removerItem(authCheck.session.user.userId, id);

    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[ActionPlan] Error deleting item:", erro);
    return NextResponse.json(
      { erro: "Falha ao remover item do plano" },
      { status: 500 },
    );
  }
}
