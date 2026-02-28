import { NextResponse } from "next/server";
import { lerAnaliseAtivo } from "@/lib/asset-analysis-storage";
import { cabecalhosCachePrivado, cabecalhosSemCache } from "@/lib/cache-headers";
import { requireAuth } from "@/lib/auth-utils";

/**
 * GET /api/asset-performance/analysis?ticker=PETR4
 *
 * Retorna analise cacheada do ativo ou 404 se nao existe.
 */
export async function GET(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { searchParams } = new URL(request.url);
    const tickerParam = searchParams.get("ticker");

    if (!tickerParam) {
      return NextResponse.json({ erro: "Parametro 'ticker' obrigatorio" }, { status: 400 });
    }

    const analise = await lerAnaliseAtivo(tickerParam, authCheck.session.user.userId);

    if (!analise) {
      return NextResponse.json({ analise: null }, cabecalhosSemCache());
    }

    return NextResponse.json({ analise }, cabecalhosCachePrivado(300, 600));
  } catch (erro) {
    console.error("Erro ao buscar analise de ativo:", erro);
    return NextResponse.json({ erro: "Falha ao buscar analise de ativo" }, { status: 500 });
  }
}
