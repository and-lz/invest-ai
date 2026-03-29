import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi, obterAiConfigParaUsuario } from "@/lib/container";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  mensagens: z.array(
    z.object({
      papel: z.enum(["usuario", "assistente"]),
      conteudo: z.string(),
    }),
  ).min(1).max(6),
});

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return Response.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ erro: "Parametros invalidos" }, { status: 400 });
    }

    const config = await obterAiConfigParaUsuario(auth.session.user.userId);
    const provider = criarProvedorAi(config);

    const conversationSnippet = parsed.data.mensagens
      .slice(0, 4)
      .map((m) => `${m.papel === "usuario" ? "User" : "Assistant"}: ${m.conteudo.slice(0, 200)}`)
      .join("\n");

    const result = await provider.gerar({
      instrucaoSistema:
        "Generate a short conversation title (max 6 words, no quotes, no punctuation at end). " +
        "The title should capture the main topic. Reply with ONLY the title, nothing else. " +
        "Use the same language as the conversation (Portuguese if the user writes in Portuguese).",
      mensagens: [
        {
          papel: "usuario",
          partes: [{ tipo: "texto", dados: conversationSnippet }],
        },
      ],
      maxOutputTokens: 30,
    });

    const titulo = result.texto.trim().replace(/[."]+$/g, "").slice(0, 60);

    return Response.json({ titulo });
  } catch (erro) {
    console.error("[ChatTitle] Failed to generate title:", erro);
    return Response.json({ erro: "Falha ao gerar titulo" }, { status: 500 });
  }
}
