import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterPlanoAcaoRepository, criarProvedorAi } from "@/lib/container";
import { CriarItemPlanoSchema, EnriquecimentoAiSchema } from "@/schemas/plano-acao.schema";
import { cabecalhosSemCache } from "@/lib/cabecalhos-cache";
import {
  SYSTEM_PROMPT_ENRIQUECER_ACAO,
  buildEnrichUserPrompt,
} from "@/lib/prompt-enriquecer-acao";
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
 * Creates a new action plan item. AI enrichment is best-effort:
 * the item is saved immediately, and AI enrichment is attempted
 * afterwards. If AI fails, the item remains with null enrichment.
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

    // Save immediately without AI enrichment
    const item = await repository.salvarItem(userId, validation.data, null);

    // Best-effort AI enrichment (fire-and-forget)
    void enrichItemInBackground(repository, userId, item.identificador, validation.data);

    return NextResponse.json({ item }, { status: 201, ...cabecalhosSemCache() });
  } catch (error) {
    console.error("[ActionPlan] Unexpected error:", error);
    return NextResponse.json(
      { erro: "Falha ao criar item do plano" },
      { status: 500 },
    );
  }
}

/**
 * Attempts AI enrichment in background. If it succeeds, updates the item.
 * If it fails, the item remains with null enrichment — no user impact.
 */
async function enrichItemInBackground(
  repository: Awaited<ReturnType<typeof obterPlanoAcaoRepository>>,
  userId: string,
  identificador: string,
  dados: { textoOriginal: string; tipoConclusao: string },
): Promise<void> {
  try {
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
                dados: buildEnrichUserPrompt(dados.textoOriginal, dados.tipoConclusao),
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
      console.warn("[ActionPlan] AI returned invalid JSON structure, skipping enrichment");
      return;
    }

    await repository.atualizarEnriquecimento(userId, identificador, enrichValidation.data);
    console.info(`[ActionPlan] AI enrichment completed for item ${identificador}`);
  } catch (error) {
    console.warn("[ActionPlan] AI enrichment failed (item saved without enrichment):", error);
  }
}
