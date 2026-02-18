import { NextResponse, after } from "next/server";
import { z } from "zod/v4";
import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi } from "@/lib/container";
import { cabecalhosSemCache } from "@/lib/cache-headers";
import {
  SYSTEM_PROMPT_EXPLANATION,
  buildExplanationUserPrompt,
} from "@/lib/explain-conclusion-prompt";
import { ExplainTakeawayRequestSchema } from "@/schemas/explain-takeaway.schema";
import { salvarTarefa } from "@/lib/background-task";
import { executeBackgroundTask } from "@/lib/background-task-executor";
import type { TarefaBackground } from "@/lib/background-task";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ExplanationsResponseSchema = z.record(z.string(), z.string());

/**
 * POST /api/explain-takeaway
 *
 * Receives conclusion texts from a TakeawayBox and returns
 * a task ID. AI-generated educational explanations are processed
 * in background and stored in the task's descricaoResultado as JSON.
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
    const userId = authCheck.session.user.userId;

    const tarefa: TarefaBackground = {
      identificador: crypto.randomUUID(),
      usuarioId: userId,
      tipo: "explicar-conclusoes",
      status: "processando",
      iniciadoEm: new Date().toISOString(),
    };

    await salvarTarefa(tarefa);

    after(executeBackgroundTask({
      tarefa,
      rotuloLog: "Explicar Conclusoes",
      usuarioId: userId,
      executarOperacao: async () => {
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
          return {
            descricaoResultado: JSON.stringify({ error: "invalid_format" }),
          };
        }

        return {
          descricaoResultado: JSON.stringify(explanationsValidation.data),
        };
      },
    }));

    return NextResponse.json(
      { identificadorTarefa: tarefa.identificador },
      { status: 202, ...cabecalhosSemCache() },
    );
  } catch (error) {
    console.error("[ExplainTakeaway] Unexpected error:", error);
    return NextResponse.json(
      { erro: "Falha ao iniciar explicacoes" },
      { status: 500 },
    );
  }
}
