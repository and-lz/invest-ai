import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterTestGeminiApiKeyUseCase } from "@/lib/container";
import { TestGeminiApiKeySchema } from "@/schemas/user-settings.schema";

/**
 * POST /api/settings/test-gemini-key
 * Testa se a chave de API Gemini e valida
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();

    // Valida o body
    const validated = TestGeminiApiKeySchema.parse(body);

    // Executa o use case
    const useCase = obterTestGeminiApiKeyUseCase();
    const result = await useCase.executar(validated.geminiApiKey);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({ erro: "Validacao falhou: " + error.message }, { status: 400 });
    }

    console.error("Erro ao testar chave de API:", error);
    return NextResponse.json({ erro: "Erro ao testar chave de API" }, { status: 500 });
  }
}
