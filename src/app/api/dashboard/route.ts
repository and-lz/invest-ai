import { NextRequest, NextResponse } from "next/server";
import { obterGetDashboardDataUseCase } from "@/lib/container";
import { validarMesAno } from "@/lib/format-date";
import { requireAuth } from "@/lib/auth-utils";
import { cabecalhosCachePrivado } from "@/lib/cabecalhos-cache";
import { cacheGlobal } from "@/lib/cache-em-memoria";
import type { DashboardData } from "@/application/use-cases/get-dashboard-data";

const TTL_DASHBOARD_MS = 60 * 1000; // 60 segundos

interface DashboardCacheEntry {
  dadosDashboard: DashboardData | null;
  vazio: boolean;
}

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    // Extrair query param mesAno se fornecido
    const { searchParams } = new URL(request.url);
    const mesAnoParam = searchParams.get("mesAno");

    // Validar formato se fornecido
    if (mesAnoParam && !validarMesAno(mesAnoParam)) {
      return NextResponse.json(
        { erro: "Formato de mesAno inválido. Esperado: YYYY-MM" },
        { status: 400 },
      );
    }

    // Verificar cache em memoria (isolado por usuario)
    const chaveCacheDashboard = `dashboard:${authCheck.session.user.userId}:${mesAnoParam ?? "ultimo"}`;
    const dadosEmCache = cacheGlobal.obter<DashboardCacheEntry>(chaveCacheDashboard);
    if (dadosEmCache) {
      return NextResponse.json(dadosEmCache, cabecalhosCachePrivado(60, 300));
    }

    const useCase = await obterGetDashboardDataUseCase();
    const dadosDashboard = await useCase.executar(mesAnoParam ?? undefined);

    if (!dadosDashboard) {
      const respostaVazia: DashboardCacheEntry = { dadosDashboard: null, vazio: true };
      cacheGlobal.definir(chaveCacheDashboard, respostaVazia, TTL_DASHBOARD_MS);
      return NextResponse.json(respostaVazia, cabecalhosCachePrivado(60, 300));
    }

    const resposta: DashboardCacheEntry = { dadosDashboard, vazio: false };
    cacheGlobal.definir(chaveCacheDashboard, resposta, TTL_DASHBOARD_MS);
    return NextResponse.json(resposta, cabecalhosCachePrivado(60, 300));
  } catch (erro) {
    console.error("Erro ao obter dados do dashboard:", erro);
    return NextResponse.json({ erro: "Falha ao obter dados do dashboard" }, { status: 500 });
  }
}
