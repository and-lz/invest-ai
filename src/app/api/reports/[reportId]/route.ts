import { NextResponse } from "next/server";
import { obterGetReportDetailUseCase, obterDeleteReportUseCase } from "@/lib/container";
import { ReportNotFoundError } from "@/domain/errors/app-errors";
import { requireAuth } from "@/lib/auth-utils";

interface RouteParams {
  params: Promise<{ reportId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { reportId } = await params;
    const useCase = await obterGetReportDetailUseCase();
    const resultado = await useCase.executar(reportId);

    return NextResponse.json(resultado);
  } catch (erro) {
    if (erro instanceof ReportNotFoundError) {
      return NextResponse.json({ erro: erro.message }, { status: 404 });
    }
    console.error("Erro ao buscar relatorio:", erro);
    return NextResponse.json({ erro: "Falha ao buscar relatorio" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const { reportId } = await params;
    const useCase = await obterDeleteReportUseCase();
    await useCase.executar(reportId);

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    if (erro instanceof ReportNotFoundError) {
      return NextResponse.json({ erro: erro.message }, { status: 404 });
    }
    console.error("Erro ao remover relatorio:", erro);
    return NextResponse.json({ erro: "Falha ao remover relatorio" }, { status: 500 });
  }
}
