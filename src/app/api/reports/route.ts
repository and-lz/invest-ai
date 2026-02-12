import { NextResponse } from "next/server";
import { obterUploadReportUseCase, obterListReportsUseCase } from "@/lib/container";
import { AppError } from "@/domain/errors/app-errors";

const TAMANHO_MAXIMO_PDF_BYTES = 32 * 1024 * 1024; // 32MB

export async function GET() {
  try {
    const useCase = obterListReportsUseCase();
    const relatorios = await useCase.executar();
    return NextResponse.json({ relatorios });
  } catch (erro) {
    console.error("Erro ao listar relatorios:", erro);
    return NextResponse.json(
      { erro: "Falha ao listar relatorios" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get("file");

    if (!arquivo || !(arquivo instanceof File)) {
      return NextResponse.json(
        { erro: "Nenhum arquivo PDF enviado" },
        { status: 400 },
      );
    }

    if (!arquivo.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { erro: "Apenas arquivos PDF sao aceitos" },
        { status: 400 },
      );
    }

    if (arquivo.size > TAMANHO_MAXIMO_PDF_BYTES) {
      return NextResponse.json(
        { erro: "Arquivo excede o tamanho maximo de 32MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const useCase = obterUploadReportUseCase();
    const resultado = await useCase.executar({
      nomeArquivoOriginal: arquivo.name,
      pdfBuffer,
    });

    return NextResponse.json({
      sucesso: true,
      metadados: resultado.metadados,
      dadosExtraidos: resultado.dadosExtraidos,
    });
  } catch (erro) {
    console.error("Erro ao processar upload:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json(
        { erro: erro.message, codigo: erro.code },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { erro: "Falha ao processar o relatorio" },
      { status: 500 },
    );
  }
}
