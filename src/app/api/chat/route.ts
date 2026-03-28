import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi, obterAiConfig } from "@/lib/container";
import { RequisicaoChatSchema } from "@/schemas/chat.schema";
import { construirInstrucaoSistemaChat } from "@/lib/build-chat-system-prompt";
import { AiApiTransientError, AiApiQuotaError } from "@/domain/errors/app-errors";
import type { MensagemAi, ConfiguracaoGeracao } from "@/domain/interfaces/ai-provider";

export const dynamic = "force-dynamic";

function classificarMensagemErroChat(erro: unknown): string {
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

    const aiConfig = obterAiConfig();
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
        try {
          const geradorStream = provedor.transmitir(configBase);
          for await (const pedacoTexto of geradorStream) {
            controlador.enqueue(codificadorTexto.encode(pedacoTexto));
          }
          controlador.close();
        } catch (erro) {
          console.error("[Chat] Erro durante streaming:", erro);
          controlador.enqueue(
            codificadorTexto.encode(`\n\n[ERRO]: ${classificarMensagemErroChat(erro)}`),
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
