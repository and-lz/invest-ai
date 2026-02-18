import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterPlanoAcaoRepository, criarProvedorAi } from "@/lib/container";
import { CriarItemPlanoSchema, EnriquecimentoAiSchema } from "@/schemas/plano-acao.schema";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";
import {
  SYSTEM_PROMPT_ENRIQUECER_ACAO,
  buildEnrichUserPrompt,
} from "@/lib/prompt-enriquecer-acao";
import { AiApiTransientError } from "@/domain/errors/app-errors";
import { retryWithBackoff } from "@/lib/retry-with-backoff";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/action-plan
 * Lists all action plan items for the authenticated user.
 */
export async function GET() {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const repository = await obterPlanoAcaoRepository();
    const itens = await repository.listarItensDoUsuario(
      authCheck.session.user.userId,
    );

    return NextResponse.json({ itens }, cabecalhosSemCache());
  } catch (erro) {
    console.error("[ActionPlan] Error listing items:", erro);
    return NextResponse.json(
      { erro: "Falha ao listar itens do plano" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/action-plan
 * Creates a new action plan item with AI enrichment.
 * Returns 409 if the same text already exists.
 */
export async function POST(request: Request) {
  const authCheck = await requireAuth();
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body: unknown = await request.json();
    const validation = CriarItemPlanoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { erro: "Parametros invalidos", detalhes: validation.error.issues },
        { status: 400 },
      );
    }

    const repository = await obterPlanoAcaoRepository();
    const userId = authCheck.session.user.userId;

    // Check for duplicates
    const existe = await repository.existeComTexto(
      userId,
      validation.data.textoOriginal,
    );
    if (existe) {
      return NextResponse.json(
        { erro: "Este item ja esta no seu plano de acao" },
        { status: 409 },
      );
    }

    // AI enrichment
    const provider = criarProvedorAi();
    const aiResponse = await retryWithBackoff(() =>
      provider.gerar({
        instrucaoSistema: SYSTEM_PROMPT_ENRIQUECER_ACAO,
        mensagens: [
          {
            papel: "usuario",
            partes: [
              {
                tipo: "texto",
                dados: buildEnrichUserPrompt(
                  validation.data.textoOriginal,
                  validation.data.tipoConclusao,
                ),
              },
            ],
          },
        ],
        temperatura: 0.4,
        formatoResposta: "json",
      }),
    );

    const parsed: unknown = JSON.parse(aiResponse.texto);
    const enrichValidation = EnriquecimentoAiSchema.safeParse(parsed);

    if (!enrichValidation.success) {
      console.error("[ActionPlan] AI returned invalid JSON structure");
      return NextResponse.json(
        { erro: "Resposta da IA em formato inesperado" },
        { status: 502 },
      );
    }

    const item = await repository.salvarItem(
      userId,
      validation.data,
      enrichValidation.data,
    );

    return NextResponse.json({ item }, { status: 201, ...cabecalhosSemCache() });
  } catch (error) {
    if (error instanceof AiApiTransientError) {
      return NextResponse.json(
        { erro: "Servico de IA temporariamente indisponivel. Tente novamente." },
        { status: 503 },
      );
    }

    console.error("[ActionPlan] Unexpected error:", error);
    return NextResponse.json(
      { erro: "Falha ao criar item do plano" },
      { status: 500 },
    );
  }
}
