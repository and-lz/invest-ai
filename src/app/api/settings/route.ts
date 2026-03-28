import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterGetUserSettingsUseCase, obterUpdateClaudeModelTierUseCase } from "@/lib/container";
import { UpdateUserSettingsSchema } from "@/schemas/user-settings.schema";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const useCase = obterGetUserSettingsUseCase();
    const settings = await useCase.executar(auth.session.user.userId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json({ erro: "Erro ao obter configurações" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) return auth.response;

  try {
    const body = await request.json();
    const validated = UpdateUserSettingsSchema.parse(body);

    const useCase = obterUpdateClaudeModelTierUseCase();
    await useCase.executar(auth.session.user.userId, validated.claudeModelTier);

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
    }
    console.error("Error updating user settings:", error);
    return NextResponse.json({ erro: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
