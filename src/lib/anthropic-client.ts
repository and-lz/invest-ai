import Anthropic from "@anthropic-ai/sdk";

let clienteAnthropic: Anthropic | null = null;

export function obterClienteAnthropic(): Anthropic {
  if (!clienteAnthropic) {
    clienteAnthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // Timeout de 20 minutos (1200000ms) para PDFs grandes de 16 páginas
      // Padrão do SDK é 10 minutos
      timeout: 20 * 60 * 1000,
      maxRetries: 2,
    });
  }
  return clienteAnthropic;
}
