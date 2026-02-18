import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  abrirChatComPergunta,
  EVENTO_ABRIR_CHAT_COM_PERGUNTA,
} from "@/components/ui/botao-explicar-ia";

describe("abrirChatComPergunta", () => {
  const mockDispatchEvent = vi.fn();

  beforeEach(() => {
    // Simulate browser window in Node test environment
    globalThis.window = { dispatchEvent: mockDispatchEvent } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockDispatchEvent.mockReset();
    // @ts-expect-error — cleaning up mock
    delete globalThis.window;
  });

  it("Given a question string, When calling abrirChatComPergunta, Then it should dispatch a custom event with the question as detail", () => {
    const pergunta = "Explique este gráfico de forma simples.";

    abrirChatComPergunta(pergunta);

    expect(mockDispatchEvent).toHaveBeenCalledOnce();
    const event = mockDispatchEvent.mock.calls[0]![0] as CustomEvent<{ pergunta: string }>;
    expect(event.type).toBe(EVENTO_ABRIR_CHAT_COM_PERGUNTA);
    expect(event.detail.pergunta).toBe(pergunta);
  });

  it("Given the event constant, When checking its value, Then it should be a descriptive string", () => {
    expect(EVENTO_ABRIR_CHAT_COM_PERGUNTA).toBe("abrir-chat-com-pergunta");
  });
});
