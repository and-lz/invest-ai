import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

/**
 * POST /api/settings/test-proxy
 * Verifica se o proxy local do Claude esta acessivel
 */
export async function POST() {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  const proxyUrl = process.env.CLAUDE_PROXY_URL ?? "http://localhost:3099";

  try {
    const response = await fetch(`${proxyUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      return NextResponse.json({
        reachable: true,
        message: `Proxy acessível em ${proxyUrl}`,
      });
    }

    return NextResponse.json({
      reachable: false,
      message: `Proxy respondeu com status ${response.status}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      reachable: false,
      message: `Proxy não acessível em ${proxyUrl}. Inicie com \`npm run proxy\`. Erro: ${message}`,
    });
  }
}
