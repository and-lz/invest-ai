/**
 * Interface generica para provedores de IA (Gemini, OpenAI, Claude, etc.).
 * Suporta tanto geracao estruturada (extracao, insights) quanto streaming (chat).
 */

// ---- Tipos de conteudo ----

export interface ParteConteudoTexto {
  readonly tipo: "texto";
  readonly dados: string;
}

export interface ParteConteudoPdf {
  readonly tipo: "pdf";
  readonly dados: string; // base64
}

export interface ParteConteudoImagem {
  readonly tipo: "imagem";
  readonly dados: string; // base64
  readonly mimeType: string; // e.g. "image/png"
}

export type ParteConteudo = ParteConteudoTexto | ParteConteudoPdf | ParteConteudoImagem;

// ---- Mensagens ----

export interface MensagemAi {
  readonly papel: "usuario" | "modelo";
  readonly partes: readonly ParteConteudo[];
}

// ---- Configuracao de geracao ----

export interface ConfiguracaoGeracao {
  readonly instrucaoSistema: string;
  readonly mensagens: readonly MensagemAi[];
  readonly temperatura?: number;
  readonly formatoResposta?: "json" | "texto";
}

// ---- Resposta ----

export interface RespostaAi {
  readonly texto: string;
  readonly tokensEntrada?: number;
  readonly tokensSaida?: number;
}

// ---- Interface do provedor ----

export interface ProvedorAi {
  /** Geracao estruturada (extracao, insights) - retorna resposta completa */
  gerar(configuracao: ConfiguracaoGeracao): Promise<RespostaAi>;

  /** Geracao com streaming (chat) - produz chunks de texto */
  transmitir(configuracao: ConfiguracaoGeracao): AsyncGenerator<string, void, unknown>;
}
