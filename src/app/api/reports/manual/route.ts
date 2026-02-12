import { NextResponse } from "next/server";
import { obterSalvarRelatorioManualUseCase } from "@/lib/container";
import { gerarPromptCompletoParaExtracaoManual } from "@/lib/prompt-extracao-manual";
import { AppError } from "@/domain/errors/app-errors";

export async function GET() {
  try {
    const promptCompleto = gerarPromptCompletoParaExtracaoManual();
    return NextResponse.json({ prompt: promptCompleto });
  } catch (erro) {
    console.error("Erro ao gerar prompt de extracao:", erro);
    return NextResponse.json(
      { erro: "Falha ao gerar prompt de extracao" },
      { status: 500 },
    );
  }
}

interface CorpoRequisicaoManual {
  json: string;
}

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as CorpoRequisicaoManual;

    if (!corpo.json || typeof corpo.json !== "string") {
      return NextResponse.json(
        { erro: "Nenhum JSON fornecido" },
        { status: 400 },
      );
    }

    const useCase = obterSalvarRelatorioManualUseCase();
    const resultado = await useCase.executar({ jsonBruto: corpo.json });

    return NextResponse.json({
      sucesso: true,
      metadados: resultado.metadados,
      dadosExtraidos: resultado.dadosExtraidos,
    });
  } catch (erro) {
    console.error("Erro ao processar importacao manual:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json(
        { erro: erro.message, codigo: erro.code },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { erro: "Falha ao processar os dados" },
      { status: 500 },
    );
  }
}
