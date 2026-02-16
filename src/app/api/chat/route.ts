import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi } from "@/lib/container";
import { RequisicaoChatSchema } from "@/schemas/chat.schema";
import { construirInstrucaoSistemaChat } from "@/lib/construir-instrucao-sistema-chat";
import { AiApiTransientError } from "@/domain/errors/app-errors";
import type { MensagemAi } from "@/domain/interfaces/provedor-ai";

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

    const provedor = criarProvedorAi();
    const geradorStream = provedor.transmitir({
      instrucaoSistema,
      mensagens: mensagensAi,
      temperatura: 0.7,
      formatoResposta: "texto",
    });

    const codificadorTexto = new TextEncoder();
    const streamResposta = new ReadableStream({
      async start(controlador) {
        try {
          for await (const pedacoTexto of geradorStream) {
            controlador.enqueue(codificadorTexto.encode(pedacoTexto));
          }
          controlador.close();
        } catch (erroStream) {
          const mensagemErro =
            erroStream instanceof AiApiTransientError
              ? "Servico temporariamente indisponivel. Tente novamente em alguns segundos."
              : "Erro ao processar sua mensagem. Tente novamente.";
          controlador.enqueue(codificadorTexto.encode(`\n\n[ERRO]: ${mensagemErro}`));
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
