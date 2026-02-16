import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterConversaRepository } from "@/lib/container";
import { CriarConversaSchema } from "@/schemas/conversa.schema";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/conversations
 * Lista metadata de conversas do usuario autenticado (sem mensagens completas).
 */
export async function GET() {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const repository = await obterConversaRepository();
    const conversas = await repository.listarConversasDoUsuario(
      verificacaoAuth.session.user.userId,
    );

    // Retornar apenas metadados (sem mensagens completas) para performance
    const conversasMetadata = conversas.map(
      ({ identificador, titulo, identificadorPagina, criadaEm, atualizadaEm, mensagens }) => ({
        identificador,
        titulo,
        identificadorPagina,
        criadaEm,
        atualizadaEm,
        previewMensagem: mensagens[0]?.conteudo.slice(0, 100) ?? "",
        contagemMensagens: mensagens.length,
      }),
    );

    return NextResponse.json({ conversas: conversasMetadata }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[Conversas] Erro ao listar:", erro);
    return NextResponse.json({ erro: "Falha ao listar conversas" }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * Cria nova conversa do chat.
 */
export async function POST(request: Request) {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const corpo = (await request.json()) as Record<string, unknown>;
    const validacao = CriarConversaSchema.safeParse({
      ...corpo,
      usuarioId: verificacaoAuth.session.user.userId,
    });

    if (!validacao.success) {
      return NextResponse.json(
        { erro: "Dados invalidos", detalhes: validacao.error.issues },
        { status: 400 },
      );
    }

    const repository = await obterConversaRepository();
    const conversa = await repository.salvarConversa(validacao.data);

    return NextResponse.json({ conversa }, { status: 201, ...cabecalhosSemCache() });
  } catch (erro) {
    console.error("[Conversas] Erro ao criar:", erro);
    return NextResponse.json({ erro: "Falha ao criar conversa" }, { status: 500 });
  }
}
