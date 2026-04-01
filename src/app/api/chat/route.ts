import { requireAuth } from "@/lib/auth-utils";
import {
  criarProvedorAi,
  obterAiConfigParaUsuario,
  obterGetDashboardDataUseCase,
  obterReportRepository,
  obterPlanoAcaoRepository,
} from "@/lib/container";
import { RequisicaoChatSchema } from "@/schemas/chat.schema";
import { construirInstrucaoSistemaChat } from "@/lib/build-chat-system-prompt";
import { serializarContextoCompletoUsuario } from "@/lib/serialize-chat-context";
import { buscarContextoMercado } from "@/infrastructure/services/web-search-service";
import { AiApiTransientError, AiApiQuotaError } from "@/domain/errors/app-errors";
import { resolveClaudeModelId } from "@/lib/model-tiers";
import type { MensagemAi, ConfiguracaoGeracao } from "@/domain/interfaces/ai-provider";

export const dynamic = "force-dynamic";

function classificarMensagemErroChat(erro: unknown): string {
  if (erro instanceof AiApiQuotaError || erro instanceof AiApiTransientError) {
    return "A Fortuna está com dificuldades para responder no momento. Tente novamente em alguns segundos.";
  }
  return "Algo deu errado ao gerar a resposta. Você pode tentar novamente.";
}

export async function POST(request: Request): Promise<Response> {
  const verificacaoAuth = await requireAuth();
  if (!verificacaoAuth.authenticated) {
    return new Response(JSON.stringify({ erro: "Nao autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const corpoRequisicao: unknown = await request.json();
    const resultadoValidacao = RequisicaoChatSchema.safeParse(corpoRequisicao);

    if (!resultadoValidacao.success) {
      return new Response(
        JSON.stringify({
          erro: "Parametros invalidos",
          detalhes: resultadoValidacao.error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { mensagens, contextoPagina, identificadorPagina, raciocinio, modelTier, modoMercado } = resultadoValidacao.data;

    // When no page context is provided (e.g. /chat page), load portfolio data server-side
    let contextoFinal = contextoPagina;
    if (!contextoFinal) {
      try {
        const userId = verificacaoAuth.session.user.userId;
        const [dashboardUseCase, reportRepo, planoAcaoRepo] = await Promise.all([
          obterGetDashboardDataUseCase(),
          obterReportRepository(),
          obterPlanoAcaoRepository(),
        ]);

        const [dadosDashboard, insightsMetadados, itensPendentes] = await Promise.all([
          dashboardUseCase.executar(),
          reportRepo.listarInsightsMetadados().catch(() => []),
          planoAcaoRepo.listarItensDoUsuario(userId).catch(() => []),
        ]);

        if (dadosDashboard) {
          // Load most recent monthly insights (not consolidated)
          const metadadosMaisRecente = insightsMetadados
            .filter((m) => m.identificador !== "consolidado")
            .sort((a, b) => b.mesReferencia.localeCompare(a.mesReferencia))[0];
          const insights = metadadosMaisRecente
            ? await reportRepo.obterInsights(metadadosMaisRecente.identificador).catch(() => null)
            : null;

          contextoFinal = serializarContextoCompletoUsuario(dadosDashboard, {
            insights,
            itensPendentes: itensPendentes.filter((i) => i.status === "pendente"),
          });
        }
      } catch (erro) {
        console.error("[Chat] Falha ao carregar dados do portfolio:", erro);
        // Graceful degradation: proceed without portfolio context
      }
    }

    let marketContext: string | undefined;
    if (modoMercado && mensagens.length > 0) {
      const lastUserMessage = mensagens[mensagens.length - 1]!.conteudo;
      marketContext = (await buscarContextoMercado(lastUserMessage)) ?? undefined;
    }

    const instrucaoSistema = construirInstrucaoSistemaChat(identificadorPagina, contextoFinal, marketContext);

    const mensagensAi: MensagemAi[] = mensagens.map((mensagem) => ({
      papel: mensagem.papel === "assistente" ? ("modelo" as const) : ("usuario" as const),
      partes: [{ tipo: "texto" as const, dados: mensagem.conteudo }],
    }));

    // Use per-request model tier if provided, otherwise fall back to user's DB settings
    const aiConfig = modelTier
      ? { provider: "claude-proxy" as const, modelId: resolveClaudeModelId(modelTier) }
      : await obterAiConfigParaUsuario(verificacaoAuth.session.user.userId);
    const provedor = criarProvedorAi(aiConfig);

    const configBase: ConfiguracaoGeracao = {
      instrucaoSistema,
      mensagens: mensagensAi,
      temperatura: 0.7,
      formatoResposta: "texto",
    };

    const codificadorTexto = new TextEncoder();
    const streamResposta = new ReadableStream({
      async start(controlador) {
        // Helper: safely enqueue — guards against closed controller
        let closed = false;
        function enqueue(data: Uint8Array) {
          if (closed) return;
          try {
            controlador.enqueue(data);
          } catch {
            closed = true;
          }
        }
        function close() {
          if (closed) return;
          closed = true;
          try { controlador.close(); } catch { /* already closed */ }
        }

        try {
          if (raciocinio) {
            const geradorStream = provedor.transmitirComPensamento(configBase);
            for await (const chunk of geradorStream) {
              const t = chunk.type === "thinking" ? 0 : 1;
              enqueue(codificadorTexto.encode(JSON.stringify({ t, c: chunk.content }) + "\n"));
            }
          } else {
            const geradorStream = provedor.transmitir(configBase);
            for await (const pedacoTexto of geradorStream) {
              enqueue(codificadorTexto.encode(pedacoTexto));
            }
          }
          close();
        } catch (erro) {
          console.error("[Chat] Erro durante streaming:", erro);
          enqueue(
            codificadorTexto.encode(`\n\n[ERRO]: ${classificarMensagemErroChat(erro)}`),
          );
          close();
        }
      },
    });

    return new Response(streamResposta, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (erroInesperado) {
    console.error("[Chat] Erro inesperado:", erroInesperado);
    return new Response(JSON.stringify({ erro: "Falha ao processar mensagem" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
