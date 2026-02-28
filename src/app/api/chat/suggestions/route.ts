import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { requireAuth } from "@/lib/auth-utils";
import { criarProvedorAi } from "@/lib/container";
import { IdentificadorPaginaEnum } from "@/schemas/chat.schema";

export const dynamic = "force-dynamic";

const SuggestionsRequestSchema = z.object({
  input: z.string().min(2).max(200),
  pageId: IdentificadorPaginaEnum,
  recentMessages: z.array(z.string().max(200)).max(4).optional(),
});

const SYSTEM_PROMPT = `Voce gera sugestoes de perguntas sobre investimentos para autocomplete.
Retorne um JSON array com exatamente 3 strings curtas (max 50 chars cada).
Cada string deve ser uma pergunta natural em portugues brasileiro que complete ou expanda o que o usuario comecou a digitar.
As perguntas devem ser relevantes para um dashboard de investimentos pessoal.
Retorne APENAS o JSON array, sem explicacao.`;

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return NextResponse.json({ erro: "Nao autenticado" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = SuggestionsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ erro: "Parametros invalidos" }, { status: 400 });
    }

    const { input, recentMessages } = parsed.data;

    let userPrompt = `O usuario comecou a digitar: "${input}"`;
    if (recentMessages && recentMessages.length > 0) {
      userPrompt += `\nUltimas mensagens da conversa: ${recentMessages.join(" | ")}`;
    }

    const provedor = criarProvedorAi();
    const resposta = await provedor.gerar({
      instrucaoSistema: SYSTEM_PROMPT,
      mensagens: [{ papel: "usuario", partes: [{ tipo: "texto", dados: userPrompt }] }],
      temperatura: 0.4,
      formatoResposta: "json",
      maxOutputTokens: 150,
    });

    const suggestions: unknown = JSON.parse(resposta.texto);

    if (!Array.isArray(suggestions)) {
      return NextResponse.json({ suggestions: [] });
    }

    const validated = suggestions
      .filter((s): s is string => typeof s === "string" && s.length > 0)
      .slice(0, 3)
      .map((s) => s.slice(0, 60));

    return NextResponse.json({ suggestions: validated });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
