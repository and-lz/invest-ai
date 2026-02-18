/**
 * Utilitarios para cabecalhos HTTP de cache em API routes.
 *
 * Uso: passar o retorno como segundo argumento de NextResponse.json()
 * Exemplo: NextResponse.json(dados, cabecalhosCachePrivado(60, 300))
 */

interface OpcoesCabecalhoResponse {
  headers: Record<string, string>;
}

/**
 * Cache privado (por usuario) com stale-while-revalidate.
 * Usar para dados especificos do usuario: dashboard, reports, insights, asset-performance.
 */
export function cabecalhosCachePrivado(
  maxAgeSegundos: number,
  staleWhileRevalidateSegundos?: number,
): OpcoesCabecalhoResponse {
  const diretivas = [`private`, `max-age=${maxAgeSegundos}`];

  if (staleWhileRevalidateSegundos !== undefined) {
    diretivas.push(`stale-while-revalidate=${staleWhileRevalidateSegundos}`);
  }

  return { headers: { "Cache-Control": diretivas.join(", ") } };
}

/**
 * Cache publico (compartilhado entre usuarios) com stale-while-revalidate.
 * Usar para dados de mercado: trends.
 */
export function cabecalhosCachePublico(
  maxAgeSegundos: number,
  staleWhileRevalidateSegundos?: number,
): OpcoesCabecalhoResponse {
  const diretivas = [`public`, `max-age=${maxAgeSegundos}`];

  if (staleWhileRevalidateSegundos !== undefined) {
    diretivas.push(`stale-while-revalidate=${staleWhileRevalidateSegundos}`);
  }

  return { headers: { "Cache-Control": diretivas.join(", ") } };
}

/**
 * Sem cache. Usar para mutations (POST/PATCH/DELETE), polling e dados em tempo real.
 */
export function cabecalhosSemCache(): OpcoesCabecalhoResponse {
  return {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  };
}
