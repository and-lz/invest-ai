import { NextResponse } from "next/server";
import { obterUploadReportUseCase, obterListReportsUseCase } from "@/lib/container";
import { AppError } from "@/domain/errors/app-errors";
import { descriptografarPdf } from "@/lib/pdf-decrypt";
import { salvarTarefa } from "@/lib/tarefa-background";
import { executarTarefaEmBackground } from "@/lib/executor-tarefa-background";
import type { TarefaBackground } from "@/lib/tarefa-background";
import { requireAuth } from "@/lib/auth-utils";

const TAMANHO_MAXIMO_PDF_BYTES = 32 * 1024 * 1024; // 32MB

export async function GET() {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const useCase = await obterListReportsUseCase();
    const relatorios = await useCase.executar();
    return NextResponse.json({ relatorios });
  } catch (erro) {
    console.error("Erro ao listar relatorios:", erro);
    return NextResponse.json({ erro: "Falha ao listar relatorios" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const formData = await request.formData();
    const arquivo = formData.get("file");
    const senhaPdf = formData.get("password");

    if (!arquivo || !(arquivo instanceof File)) {
      return NextResponse.json({ erro: "Nenhum arquivo PDF enviado" }, { status: 400 });
    }

    if (!arquivo.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ erro: "Apenas arquivos PDF sao aceitos" }, { status: 400 });
    }

    if (arquivo.size > TAMANHO_MAXIMO_PDF_BYTES) {
      return NextResponse.json(
        { erro: "Arquivo excede o tamanho maximo de 32MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    let pdfBuffer = Buffer.from(arrayBuffer);

    // Descriptografa o PDF se estiver protegido por senha
    try {
      const senha = senhaPdf && typeof senhaPdf === "string" ? senhaPdf : undefined;
      const pdfDescriptografado = await descriptografarPdf(pdfBuffer, senha);
      pdfBuffer = Buffer.from(pdfDescriptografado);
    } catch (erroDescriptografia) {
      const mensagem =
        erroDescriptografia instanceof Error
          ? erroDescriptografia.message
          : "Falha ao processar PDF protegido";
      return NextResponse.json({ erro: mensagem }, { status: 400 });
    }

    // Criar tarefa e processar em background (fire-and-forget)
    const identificadorTarefa = crypto.randomUUID();
    const nomeArquivoOriginal = arquivo.name;

    const tarefa: TarefaBackground = {
      identificador: identificadorTarefa,
      tipo: "upload-pdf",
      status: "processando",
      iniciadoEm: new Date().toISOString(),
    };

    await salvarTarefa(tarefa);

    void executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Upload",
      executarOperacao: async () => {
        const useCase = await obterUploadReportUseCase();
        const resultado = await useCase.executar({ nomeArquivoOriginal, pdfBuffer });
        return {
          descricaoResultado: `Relatorio ${resultado.metadados.mesReferencia} processado`,
          urlRedirecionamento: "/",
        };
      },
    });

    return NextResponse.json({ identificadorTarefa, status: "processando" }, { status: 202 });
  } catch (erro) {
    console.error("Erro ao processar upload:", erro);

    if (erro instanceof AppError) {
      return NextResponse.json({ erro: erro.message, codigo: erro.code }, { status: 422 });
    }

    return NextResponse.json({ erro: "Falha ao processar o relatorio" }, { status: 500 });
  }
}
