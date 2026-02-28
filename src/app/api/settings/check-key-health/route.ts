import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { obterCheckKeyHealthUseCase } from "@/lib/container";

/**
 * GET /api/settings/check-key-health
 * Checks the health status of the user's stored Gemini API key.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const useCase = obterCheckKeyHealthUseCase();
    const result = await useCase.execute(auth.session.user.userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking key health:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno ao verificar chave." },
      { status: 500 },
    );
  }
}
