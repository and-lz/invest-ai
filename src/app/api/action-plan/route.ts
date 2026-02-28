import { NextResponse, after } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterPlanoAcaoRepository, criarProvedorAi } from "@/lib/container";
import { CriarItemPlanoSchema, EnriquecimentoAiSchema } from "@/schemas/action-plan.schema";
import { cabecalhosSemCache } from "@/lib/cache-headers";
import {
  SYSTEM_PROMPT_ENRIQUECER_ACAO,
  buildEnrichUserPrompt,
} from "@/lib/enrich-action-prompt";
import { salvarTarefa } from "@/lib/background-task";
import { executeBackgroundTask } from "@/lib/background-task-executor";
import type { TarefaBackground } from "@/lib/background-task";

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

    // Background AI enrichment via task system (visible in Activity Center)
    const tarefa: TarefaBackground = {
      identificador: crypto.randomUUID(),
      usuarioId: userId,
      tipo: "enriquecer-item-plano",
      status: "processando",
      iniciadoEm: new Date().toISOString(),
      parametros: {
        identificadorItem: item.identificador,
        textoOriginal: validation.data.textoOriginal,
        tipoConclusao: validation.data.tipoConclusao,
      },
    };

    await salvarTarefa(tarefa);

    after(executeBackgroundTask({
      tarefa,
      rotuloLog: "Enriquecer Item Plano",
      usuarioId: userId,
      executarOperacao: async () => {
        const provider = criarProvedorAi();
        const aiResponse = await provider.gerar({
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
        });

        const parsed: unknown = JSON.parse(aiResponse.texto);
        const enrichValidation = EnriquecimentoAiSchema.safeParse(parsed);

        if (!enrichValidation.success) {
          console.warn(
            "[ActionPlan] AI returned invalid JSON structure, writing fallback enrichment",
            enrichValidation.error.issues,
          );
          await repository.atualizarEnriquecimento(userId, item.identificador, {
            recomendacaoEnriquecida: validation.data.textoOriginal,
            fundamentacao: "Recomendação automática indisponível no momento.",
          });
          return {
            descricaoResultado: "Recomendação Fortuna indisponível",
          };
        }

        await repository.atualizarEnriquecimento(userId, item.identificador, enrichValidation.data);

        return {
          descricaoResultado: "Recomendação Fortuna gerada",
          urlRedirecionamento: "/plano-acao",
        };
      },
      aoFalharDefinitivo: async () => {
        await repository.atualizarEnriquecimento(userId, item.identificador, {
          recomendacaoEnriquecida: validation.data.textoOriginal,
          fundamentacao: "Recomendação automática indisponível no momento.",
        });
      },
    }));

    return NextResponse.json({ item }, { status: 201, ...cabecalhosSemCache() });
  } catch (error) {
    console.error("[ActionPlan] Unexpected error:", error);
    return NextResponse.json(
      { erro: "Falha ao criar item do plano" },
      { status: 500 },
    );
  }
}

