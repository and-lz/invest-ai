import { NextResponse } from "next/server";
import { obterGetDashboardDataUseCase } from "@/lib/container";

export async function GET() {
  try {
    const useCase = obterGetDashboardDataUseCase();
    const dadosDashboard = await useCase.executar();

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
