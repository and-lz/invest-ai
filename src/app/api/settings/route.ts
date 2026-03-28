import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import {
  obterGetUserSettingsUseCase,
  obterUpdateGeminiApiKeyUseCase,
  obterUpdateModelTierUseCase,
  obterUpdateAiProviderUseCase,
} from "@/lib/container";
import { UpdateUserSettingsSchema } from "@/schemas/user-settings.schema";

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
 * Atualiza as configuracoes do usuario (chave API e/ou tier de modelo)
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const validated = UpdateUserSettingsSchema.parse(body);
    const userId = auth.session.user.userId;

    if (validated.geminiApiKey) {
      const useCase = obterUpdateGeminiApiKeyUseCase();
      await useCase.executar(userId, validated.geminiApiKey);
    }

    if (validated.modelTier) {
      const useCase = obterUpdateModelTierUseCase();
      await useCase.executar(userId, validated.modelTier);
    }

    if (validated.aiProvider !== undefined) {
      const useCase = obterUpdateAiProviderUseCase();
      await useCase.executar(
        userId,
        validated.aiProvider,
        validated.claudeModelTier ?? "sonnet",
      );
    } else if (validated.claudeModelTier !== undefined) {
      const useCase = obterUpdateAiProviderUseCase();
      const currentSettings = await obterGetUserSettingsUseCase().executar(userId);
      await useCase.executar(userId, currentSettings.aiProvider, validated.claudeModelTier);
    }

    return NextResponse.json({ sucesso: true, mensagem: "Configurações atualizadas com sucesso" });
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
