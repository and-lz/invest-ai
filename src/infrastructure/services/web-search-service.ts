const TAVILY_API_URL = "https://api.tavily.com/search";
const MAX_MARKET_CONTEXT_CHARS = 3000;

interface TavilyResult {
  content: string;
  url: string;
  title: string;
}

interface TavilyResponse {
  answer?: string;
  results?: TavilyResult[];
}

/**
 * Searches Tavily for real-time market context based on the user's query.
 * Returns a formatted string for injection into the system prompt, or null on any failure.
 *
 * Silent fail: never throws — callers treat null as "no market context available".
 */
export async function buscarContextoMercado(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    console.log("[Chat] Modo mercado ativo: buscando contexto de mercado...");

    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} mercado financeiro Brasil investimentos`,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      console.error(`[Chat] Tavily retornou status ${response.status}`);
      return null;
    }

    const data = (await response.json()) as TavilyResponse;

    const parts: string[] = [];

    if (data.answer) {
      parts.push(data.answer);
    }

    if (data.results) {
      for (const result of data.results.slice(0, 3)) {
        if (result.content) {
          parts.push(`[${result.title}]\n${result.content}`);
        }
      }
    }

    if (parts.length === 0) return null;

    const combined = parts.join("\n\n");
    return combined.length > MAX_MARKET_CONTEXT_CHARS
      ? combined.slice(0, MAX_MARKET_CONTEXT_CHARS) + "..."
      : combined;
  } catch (error) {
    console.error("[Chat] Erro ao buscar contexto de mercado:", error);
    return null;
  }
}
