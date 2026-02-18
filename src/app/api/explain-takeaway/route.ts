import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi } from "@/lib/container";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";
import {
  SYSTEM_PROMPT_EXPLANATION,
  buildExplanationUserPrompt,
} from "@/lib/prompt-explicacao-conclusao";
import { ExplainTakeawayRequestSchema } from "@/schemas/explain-takeaway.schema";
import { AiApiTransientError } from "@/domain/errors/app-errors";

export const dynamic = "force-dynamic";

const ExplanationsResponseSchema = z.record(z.string(), z.string());

/**
 * POST /api/explain-takeaway
 *
 * Receives conclusion texts from a TakeawayBox and returns
 * AI-generated educational explanations for each one.
 */
export async function POST(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body: unknown = await request.json();
    const validation = ExplainTakeawayRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: validation.error.issues },
        { status: 400 },
      );
    }

    const { conclusions } = validation.data;
    const userPrompt = buildExplanationUserPrompt(conclusions);

    const provider = criarProvedorAi();
    const response = await provider.gerar({
      instrucaoSistema: SYSTEM_PROMPT_EXPLANATION,
      mensagens: [
        {
          papel: "usuario",
          partes: [{ tipo: "texto", dados: userPrompt }],
        },
      ],
      temperatura: 0.4,
      formatoResposta: "json",
    });

    const parsed: unknown = JSON.parse(response.texto);
    const explanationsValidation = ExplanationsResponseSchema.safeParse(parsed);

    if (!explanationsValidation.success) {
      console.error("[ExplainTakeaway] AI returned invalid JSON structure");
      return NextResponse.json(
        { erro: "Resposta da IA em formato inesperado" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { explanations: explanationsValidation.data },
      cabecalhosSemCache(),
    );
  } catch (error) {
    if (error instanceof AiApiTransientError) {
      return NextResponse.json(
        {
          erro: "Servico de IA temporariamente indisponivel. Tente novamente.",
        },
        { status: 503 },
      );
    }

    console.error("[ExplainTakeaway] Unexpected error:", error);
    return NextResponse.json(
      { erro: "Falha ao gerar explicacoes" },
      { status: 500 },
    );
  }
}
