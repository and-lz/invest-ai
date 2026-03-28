import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

/**
 * GET /api/admin/proxy-stats
 * Fetches health + request history from the Claude proxy's /stats endpoint.
 */
export async function GET() {
  const auth = await requireAuth();
  if (!auth.authenticated) {
    return auth.response;
  }

  const proxyUrl = process.env.CLAUDE_PROXY_URL ?? "http://localhost:3099";

  try {
    const response = await fetch(`${proxyUrl}/stats`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json({
        reachable: false,
        error: `Proxy responded with status ${response.status}`,
      });
    }

    const data = await response.json();
    return NextResponse.json({ reachable: true, ...data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      reachable: false,
      error: `Proxy not reachable at ${proxyUrl}. Start with \`npm run proxy\`. Error: ${message}`,
    });
  }
}
