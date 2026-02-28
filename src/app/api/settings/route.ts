import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterGetUserSettingsUseCase, obterUpdateGeminiApiKeyUseCase } from "@/lib/container";
import { UpdateGeminiApiKeySchema } from "@/schemas/user-settings.schema";

/**
 * GET /api/settings
 * Obtem as configuracoes do usuario autenticado
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const useCase = obterGetUserSettingsUseCase();
    const settings = await useCase.executar(auth.session.user.userId);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao obter configuracoes:", error);
    return NextResponse.json({ erro: "Erro ao obter configuracoes" }, { status: 500 });
  }
}

/**
 * PATCH /api/settings
 * Atualiza as configuracoes do usuario (chave API Gemini)
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();

    // Valida o body
    const validated = UpdateGeminiApiKeySchema.parse(body);

    // Executa o use case
    const useCase = obterUpdateGeminiApiKeyUseCase();
    await useCase.executar(auth.session.user.userId, validated.geminiApiKey);

    return NextResponse.json({ sucesso: true, mensagem: "Chave de API atualizada com sucesso" });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({ erro: "Validacao falhou: " + error.message }, { status: 400 });
    }

    console.error("Erro ao atualizar configuracoes:", error);
    return NextResponse.json({ erro: "Erro ao atualizar configuracoes" }, { status: 500 });
  }
}
