import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterConversaRepository } from "@/lib/container";
import { AtualizarConversaSchema } from "@/schemas/conversa.schema";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

/**
 * GET /api/conversations/[id]
 * Obtem conversa completa (com todas as mensagens).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const repository = await obterConversaRepository();
    const conversa = await repository.obterConversaPorUsuario(
      verificacaoAuth.session.user.userId,
      id,
    );

    if (!conversa) {
      return NextResponse.json({ erro: "Conversa nao encontrada" }, { status: 404 });
    }

    return NextResponse.json({ conversa }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[Conversas] Erro ao buscar:", erro);
    return NextResponse.json({ erro: "Falha ao buscar conversa" }, { status: 500 });
  }
}

/**
 * PATCH /api/conversations/[id]
 * Atualiza titulo e/ou mensagens da conversa.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const corpo = (await request.json()) as unknown;
    const validacao = AtualizarConversaSchema.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: "Dados invalidos", detalhes: validacao.error.issues },
        { status: 400 },
      );
    }

    const repository = await obterConversaRepository();
    await repository.atualizarConversa(
      verificacaoAuth.session.user.userId,
      id,
      validacao.data,
    );

    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[Conversas] Erro ao atualizar:", erro);
    return NextResponse.json({ erro: "Falha ao atualizar conversa" }, { status: 500 });
  }
}

/**
 * DELETE /api/conversations/[id]
 * Deleta conversa permanentemente.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const repository = await obterConversaRepository();
    await repository.removerConversa(verificacaoAuth.session.user.userId, id);

    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[Conversas] Erro ao deletar:", erro);
    return NextResponse.json({ erro: "Falha ao deletar conversa" }, { status: 500 });
  }
}
