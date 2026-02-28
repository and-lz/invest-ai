import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi, resolverModeloDoUsuario } from "@/lib/container";
import { RequisicaoChatSchema } from "@/schemas/chat.schema";
import { construirInstrucaoSistemaChat } from "@/lib/build-chat-system-prompt";
import { AiApiTransientError, AiApiQuotaError } from "@/domain/errors/app-errors";
import type { MensagemAi, ConfiguracaoGeracao } from "@/domain/interfaces/ai-provider";

export const dynamic = "force-dynamic";

function classificarMensagemErroChat(erro: unknown): string {
  // Quota and transient errors share the same user-facing message because
  // Gemini uses "Quota exceeded" for both per-minute rate limits AND actual
  // credit exhaustion — we can't reliably distinguish them. The /settings
  // health check is the authoritative source for key health diagnosis.
  if (erro instanceof AiApiQuotaError || erro instanceof AiApiTransientError) {
    return "A Fortuna esta com dificuldades para responder no momento. Tente novamente em alguns segundos.";
  }
  return "Algo deu errado ao gerar a resposta. Voce pode tentar novamente.";
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

    const { mensagens, contextoPagina, identificadorPagina } = resultadoValidacao.data;

    const instrucaoSistema = construirInstrucaoSistemaChat(identificadorPagina, contextoPagina);

    const mensagensAi: MensagemAi[] = mensagens.map((mensagem) => ({
      papel: mensagem.papel === "assistente" ? ("modelo" as const) : ("usuario" as const),
      partes: [{ tipo: "texto" as const, dados: mensagem.conteudo }],
    }));

    const modelo = await resolverModeloDoUsuario(verificacaoAuth.session.user.userId);
    const provedor = criarProvedorAi(modelo);

    const configBase: ConfiguracaoGeracao = {
      instrucaoSistema,
      mensagens: mensagensAi,
      temperatura: 0.7,
      formatoResposta: "texto",
      pesquisaWeb: true,
    };

    const codificadorTexto = new TextEncoder();
    const streamResposta = new ReadableStream({
      async start(controlador) {
        // Try with web search first; if it fails before sending any chunks,
        // retry without web search as fallback.
        let chunksEnviados = 0;

        try {
          const geradorStream = provedor.transmitir(configBase);
          for await (const pedacoTexto of geradorStream) {
            controlador.enqueue(codificadorTexto.encode(pedacoTexto));
            chunksEnviados++;
          }
          controlador.close();
          return;
        } catch (erroPrimario) {
          console.error("[Chat] Erro durante streaming (pesquisaWeb=true):", erroPrimario);

          // If we already sent chunks, report inline (can't retry mid-stream).
          // Quota errors from web search should still fall through to the
          // non-web-search fallback — Google Search grounding has its own quota
          // separate from the generative model quota.
          if (chunksEnviados > 0) {
            controlador.enqueue(
              codificadorTexto.encode(`\n\n[ERRO]: ${classificarMensagemErroChat(erroPrimario)}`),
            );
            controlador.close();
            return;
          }
        }

        // Fallback: retry without web search
        try {
          console.info("[Chat] Tentando fallback sem pesquisaWeb...");
          const geradorFallback = provedor.transmitir({ ...configBase, pesquisaWeb: false });
          for await (const pedacoTexto of geradorFallback) {
            controlador.enqueue(codificadorTexto.encode(pedacoTexto));
          }
          controlador.close();
        } catch (erroFallback) {
          console.error("[Chat] Erro no fallback (pesquisaWeb=false):", erroFallback);
          controlador.enqueue(
            codificadorTexto.encode(`\n\n[ERRO]: ${classificarMensagemErroChat(erroFallback)}`),
          );
          controlador.close();
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
