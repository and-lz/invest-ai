import { NextRequest, NextResponse } from "next/server";
import { obterGetDashboardDataUseCase } from "@/lib/container";
import { validarMesAno } from "@/lib/format-date";

export async function GET(request: NextRequest) {
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

    const useCase = obterGetDashboardDataUseCase();
    const dadosDashboard = await useCase.executar(mesAnoParam ?? undefined);

    if (!dadosDashboard) {
      return NextResponse.json({ dadosDashboard: null, vazio: true });
    }

    return NextResponse.json({ dadosDashboard, vazio: false });
  } catch (erro) {
    console.error("Erro ao obter dados do dashboard:", erro);
    return NextResponse.json(
      { erro: "Falha ao obter dados do dashboard" },
      { status: 500 },
    );
  }
}
