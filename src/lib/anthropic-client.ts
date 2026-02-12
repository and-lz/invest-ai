import Anthropic from "@anthropic-ai/sdk";

let clienteAnthropic: Anthropic | null = null;

export function obterClienteAnthropic(): Anthropic {
  if (!clienteAnthropic) {
    clienteAnthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return clienteAnthropic;
}
