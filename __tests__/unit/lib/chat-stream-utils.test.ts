import { describe, it, expect } from "vitest";
import {
  parsearAcaoPendente,
  stripPartialAcaoMarker,
  parseReasoningStream,
  buildMessagesForApi,
  findLastUserContent,
  removeLastUserAssistantPair,
} from "@/lib/chat-stream-utils";
import type { MensagemChat } from "@/schemas/chat.schema";

describe("parsearAcaoPendente", () => {
  it("Given a response with a valid [ACAO:] marker, When parsing, Then it should extract the action and clean the text", () => {
    const input = "Recomendo reduzir PETR4.\n\n[ACAO:Reduzir PETR4 de 25% para 15%|atencao|PETR4]";
    const result = parsearAcaoPendente(input);

    expect(result.acaoPendente).not.toBeNull();
    expect(result.acaoPendente!.texto).toBe("Reduzir PETR4 de 25% para 15%");
    expect(result.acaoPendente!.tipo).toBe("atencao");
    expect(result.acaoPendente!.ativos).toEqual(["PETR4"]);
    expect(result.cleanText).toBe("Recomendo reduzir PETR4.");
    expect(result.cleanText).not.toContain("[ACAO:");
  });

  it("Given a response with multiple assets, When parsing, Then it should split them by comma", () => {
    const input = "Texto.\n[ACAO:Rebalancear carteira|neutro|PETR4,VALE3,ITUB4]";
    const result = parsearAcaoPendente(input);

    expect(result.acaoPendente!.ativos).toEqual(["PETR4", "VALE3", "ITUB4"]);
  });

  it("Given a response with no assets, When parsing, Then ativos should be an empty array", () => {
    const input = "Texto.\n[ACAO:Revisar diversificacao|positivo|]";
    const result = parsearAcaoPendente(input);

    expect(result.acaoPendente!.ativos).toEqual([]);
    expect(result.acaoPendente!.tipo).toBe("positivo");
  });

  it("Given a response without [ACAO:] marker, When parsing, Then it should return null and unchanged text", () => {
    const input = "Resposta normal sem acao.";
    const result = parsearAcaoPendente(input);

    expect(result.acaoPendente).toBeNull();
    expect(result.cleanText).toBe(input);
  });

  it("Given a response with an invalid tipo, When parsing, Then it should default to 'neutro'", () => {
    const input = "Texto.\n[ACAO:Acao qualquer|invalido|PETR4]";
    const result = parsearAcaoPendente(input);

    expect(result.acaoPendente!.tipo).toBe("neutro");
  });

  it("Given a response with whitespace around values, When parsing, Then it should trim them", () => {
    const input = "Texto.\n[ACAO: Reduzir exposicao | atencao | PETR4 , VALE3 ]";
    const result = parsearAcaoPendente(input);

    expect(result.acaoPendente!.texto).toBe("Reduzir exposicao");
    expect(result.acaoPendente!.tipo).toBe("atencao");
    expect(result.acaoPendente!.ativos).toEqual(["PETR4", "VALE3"]);
  });
});

describe("stripPartialAcaoMarker", () => {
  it("Given text with an incomplete [ACAO: marker, When stripping, Then it should remove the partial marker", () => {
    const input = "Resposta parcial.\n[ACAO:Reduzir PET";
    const result = stripPartialAcaoMarker(input);

    expect(result).toBe("Resposta parcial.");
  });

  it("Given text with a complete [ACAO:] marker, When stripping, Then it should leave it unchanged", () => {
    const input = "Texto.\n[ACAO:Acao|positivo|PETR4]";
    const result = stripPartialAcaoMarker(input);

    expect(result).toBe(input);
  });

  it("Given text without any marker, When stripping, Then it should leave it unchanged", () => {
    const input = "Texto normal.";
    const result = stripPartialAcaoMarker(input);

    expect(result).toBe(input);
  });

  it("Given text with only the opening [ACAO:, When stripping, Then it should remove it", () => {
    const input = "Texto.\n[ACAO:";
    const result = stripPartialAcaoMarker(input);

    expect(result).toBe("Texto.");
  });
});

describe("parseReasoningStream", () => {
  it("Given a stream with thinking and text chunks, When parsing, Then it should separate them", () => {
    const raw = '{"t":0,"c":"Let me think..."}\n{"t":1,"c":"Here is my answer."}';
    const result = parseReasoningStream(raw);

    expect(result.thinking).toBe("Let me think...");
    expect(result.text).toBe("Here is my answer.");
  });

  it("Given a stream with only thinking, When parsing, Then text should be empty", () => {
    const raw = '{"t":0,"c":"Thinking..."}';
    const result = parseReasoningStream(raw);

    expect(result.thinking).toBe("Thinking...");
    expect(result.text).toBe("");
  });

  it("Given a stream with an incomplete JSON line, When parsing, Then it should skip the broken line", () => {
    const raw = '{"t":0,"c":"OK"}\n{"t":1,"c":"Resp';
    const result = parseReasoningStream(raw);

    expect(result.thinking).toBe("OK");
    expect(result.text).toBe("");
  });

  it("Given an empty stream, When parsing, Then both fields should be empty", () => {
    const result = parseReasoningStream("");

    expect(result.thinking).toBe("");
    expect(result.text).toBe("");
  });
});

describe("buildMessagesForApi", () => {
  function msg(papel: "usuario" | "assistente", conteudo: string): MensagemChat {
    return { identificador: crypto.randomUUID(), papel, conteudo, criadaEm: new Date().toISOString() };
  }

  it("Given messages, When building for API, Then it should filter out empty messages", () => {
    const messages = [msg("usuario", "Ola"), msg("assistente", ""), msg("assistente", "Resposta")];
    const result = buildMessagesForApi(messages);

    expect(result).toHaveLength(2);
    expect(result.every((m) => m.conteudo.length > 0)).toBe(true);
  });

  it("Given more than 20 messages, When building for API, Then it should keep only the last 20", () => {
    const messages = Array.from({ length: 25 }, (_, i) => msg("usuario", `Msg ${i}`));
    const result = buildMessagesForApi(messages);

    expect(result).toHaveLength(20);
    expect(result[0]!.conteudo).toBe("Msg 5");
  });

  it("Given a long assistant message, When building for API, Then it should truncate to 4000 chars", () => {
    const longContent = "a".repeat(5000);
    const messages = [msg("assistente", longContent)];
    const result = buildMessagesForApi(messages);

    expect(result[0]!.conteudo.length).toBe(4000);
  });

  it("Given a long user message, When building for API, Then it should NOT truncate it", () => {
    const longContent = "a".repeat(5000);
    const messages = [msg("usuario", longContent)];
    const result = buildMessagesForApi(messages);

    expect(result[0]!.conteudo.length).toBe(5000);
  });
});

describe("findLastUserContent", () => {
  function msg(papel: "usuario" | "assistente", conteudo: string): MensagemChat {
    return { identificador: crypto.randomUUID(), papel, conteudo, criadaEm: new Date().toISOString() };
  }

  it("Given messages ending with a user message, When finding last user content, Then it should return that content", () => {
    const messages = [msg("usuario", "Primeira"), msg("assistente", "Resp"), msg("usuario", "Segunda")];
    expect(findLastUserContent(messages)).toBe("Segunda");
  });

  it("Given no user messages, When finding last user content, Then it should return null", () => {
    const messages = [msg("assistente", "Resp")];
    expect(findLastUserContent(messages)).toBeNull();
  });

  it("Given an empty list, When finding last user content, Then it should return null", () => {
    expect(findLastUserContent([])).toBeNull();
  });
});

describe("removeLastUserAssistantPair", () => {
  function msg(papel: "usuario" | "assistente", conteudo: string): MensagemChat {
    return { identificador: crypto.randomUUID(), papel, conteudo, criadaEm: new Date().toISOString() };
  }

  it("Given a conversation, When removing the last pair, Then it should remove the last assistant and last user messages", () => {
    const messages = [msg("usuario", "A"), msg("assistente", "B"), msg("usuario", "C"), msg("assistente", "D")];
    const result = removeLastUserAssistantPair(messages);

    expect(result).toHaveLength(2);
    expect(result[0]!.conteudo).toBe("A");
    expect(result[1]!.conteudo).toBe("B");
  });

  it("Given a conversation, When removing pair, Then it should not mutate the original array", () => {
    const messages = [msg("usuario", "A"), msg("assistente", "B")];
    const result = removeLastUserAssistantPair(messages);

    expect(result).toHaveLength(0);
    expect(messages).toHaveLength(2);
  });
});
