import { NextResponse } from "next/server";
import {
  listarNotificacoes,
  adicionarNotificacao,
  limparTodasNotificacoes,
  CriarNotificacaoSchema,
} from "@/lib/notificacao";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notificacoes = await listarNotificacoes();
    return NextResponse.json({ notificacoes }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao listar notificacoes:", erro);
    return NextResponse.json({ erro: "Falha ao listar notificacoes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const corpo = await request.json();

    const validacao = CriarNotificacaoSchema.safeParse(corpo);

    if (!validacao.success) {
      return NextResponse.json(
        { erro: "Dados invalidos", detalhes: validacao.error.issues },
        { status: 400 },
      );
    }

    const notificacao = await adicionarNotificacao(validacao.data);
    return NextResponse.json({ notificacao }, { status: 201, ...cabecalhosSemCache() });
  } catch (erro) {
    console.error("Erro ao criar notificacao:", erro);
    return NextResponse.json({ erro: "Falha ao criar notificacao" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await limparTodasNotificacoes();
    return NextResponse.json({ sucesso: true }, cabecalhosSemCache());
  } catch (erro) {
    console.error("Erro ao limpar notificacoes:", erro);
    return NextResponse.json({ erro: "Falha ao limpar notificacoes" }, { status: 500 });
  }
}
