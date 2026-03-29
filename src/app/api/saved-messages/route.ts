import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterSavedMessageRepository } from "@/lib/container";
import { CreateSavedMessageSchema } from "@/schemas/saved-message.schema";
import { cabecalhosSemCache } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

/**
 * GET /api/saved-messages
 * Lists all saved/bookmarked messages for the authenticated user.
 */
export async function GET() {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const repository = obterSavedMessageRepository();
    const messages = await repository.list(verificacaoAuth.session.user.userId);

    return NextResponse.json({ savedMessages: messages }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[SavedMessages] Erro ao listar:", erro);
    return NextResponse.json({ erro: "Falha ao listar mensagens salvas" }, { status: 500 });
  }
}

/**
 * POST /api/saved-messages
 * Saves (bookmarks) a chat message. Idempotent.
 */
export async function POST(request: Request) {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const corpo = (await request.json()) as Record<string, unknown>;
    const validacao = CreateSavedMessageSchema.safeParse({
      ...corpo,
      usuarioId: verificacaoAuth.session.user.userId,
    });

    if (!validacao.success) {
      return NextResponse.json(
        { erro: "Dados invalidos", detalhes: validacao.error.issues },
        { status: 400 },
      );
    }

    const repository = obterSavedMessageRepository();
    const saved = await repository.save(validacao.data);

    return NextResponse.json({ savedMessage: saved }, { status: 201, ...cabecalhosSemCache() });
  } catch (erro) {
    console.error("[SavedMessages] Erro ao salvar:", erro);
    return NextResponse.json({ erro: "Falha ao salvar mensagem" }, { status: 500 });
  }
}
