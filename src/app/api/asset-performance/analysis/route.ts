import { NextResponse } from "next/server";
import { lerAnaliseAtivo } from "@/lib/analise-ativo-storage";

/**
 * GET /api/asset-performance/analysis?ticker=PETR4
 *
 * Retorna analise cacheada do ativo ou 404 se nao existe.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tickerParam = searchParams.get("ticker");

    if (!tickerParam) {
      return NextResponse.json(
        { erro: "Parametro 'ticker' obrigatorio" },
        { status: 400 },
      );
    }

    const analise = await lerAnaliseAtivo(tickerParam);

    if (!analise) {
      return NextResponse.json(
        { analise: null },
        { status: 200 },
      );
    }

    return NextResponse.json({ analise });
  } catch (erro) {
    console.error("Erro ao buscar analise de ativo:", erro);
    return NextResponse.json(
      { erro: "Falha ao buscar analise de ativo" },
      { status: 500 },
    );
  }
}
