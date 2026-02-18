import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Content, Part } from "@google/generative-ai";
import type {
  ProvedorAi,
  ConfiguracaoGeracao,
  RespostaAi,
  ParteConteudo,
} from "@/domain/interfaces/ai-provider";
import { AiApiError, AiApiTransientError } from "@/domain/errors/app-errors";
import { ehErroTransienteDeAi } from "@/lib/classify-ai-error";
import { formatarFontesGrounding } from "@/lib/format-grounding-sources";

const MODELO_PADRAO = "models/gemini-2.5-flash";

/**
 * Implementacao do ProvedorAi usando Google Gemini.
 * Centraliza: criacao de cliente, log de tokens, classificacao de erros.
 */
export class GeminiProvedorAi implements ProvedorAi {
  private readonly client: GoogleGenerativeAI;
  private readonly modelo: string;

  constructor(apiKey: string, modelo?: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelo = modelo ?? MODELO_PADRAO;
  }

  async gerar(configuracao: ConfiguracaoGeracao): Promise<RespostaAi> {
    const tempoInicio = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.modelo,
        systemInstruction: configuracao.instrucaoSistema,
        generationConfig: {
          temperature: configuracao.temperatura,
          responseMimeType:
            configuracao.formatoResposta === "json" ? "application/json" : undefined,
        },
      });

      const contents = this.converterMensagensParaContents(configuracao);
      const resultado = await model.generateContent({ contents });
      const resposta = resultado.response;
      const textoResposta = resposta.text();

      if (!textoResposta) {
        throw new AiApiError("Resposta do Gemini API nao contem conteudo");
      }

      const tempoDecorrido = Date.now() - tempoInicio;
      const tokensEntrada = resposta.usageMetadata?.promptTokenCount;
      const tokensSaida = resposta.usageMetadata?.candidatesTokenCount;

      console.info(
        `[ProvedorAi] Geracao concluida em ${tempoDecorrido}ms` +
          (tokensEntrada !== undefined
            ? ` | Tokens: ${tokensEntrada} entrada, ${tokensSaida} saida`
            : ""),
      );

      return { texto: textoResposta, tokensEntrada, tokensSaida };
    } catch (erro) {
      throw this.classificarErro(erro);
    }
  }

  async *transmitir(configuracao: ConfiguracaoGeracao): AsyncGenerator<string, void, unknown> {
    try {
      const requestOptions = configuracao.pesquisaWeb
        ? { apiVersion: "v1beta" as const }
        : undefined;

      const model = this.client.getGenerativeModel(
        {
          model: this.modelo,
          systemInstruction: configuracao.instrucaoSistema,
          generationConfig: {
            temperature: configuracao.temperatura,
            responseMimeType:
              configuracao.formatoResposta === "json" ? "application/json" : undefined,
          },
        },
        requestOptions,
      );

      // gemini-2.x uses `googleSearch` tool (SDK v0.24 types only define
      // `googleSearchRetrieval` for 1.5 models, so we cast here)
      const searchTools = configuracao.pesquisaWeb
        ? [{ googleSearch: {} } as Record<string, unknown>]
        : undefined;

      const contents = this.converterMensagensParaContents(configuracao);
      const resultadoStream = await model.generateContentStream({
        contents,
        ...(searchTools && { tools: searchTools }),
      });

      for await (const chunk of resultadoStream.stream) {
        const textoChunk = chunk.text();
        if (textoChunk) {
          yield textoChunk;
        }
      }

      // Log de tokens apos o stream completo
      const respostaFinal = await resultadoStream.response;
      const tokensEntrada = respostaFinal.usageMetadata?.promptTokenCount;
      const tokensSaida = respostaFinal.usageMetadata?.candidatesTokenCount;

      if (tokensEntrada !== undefined) {
        console.info(
          `[ProvedorAi] Stream concluido | Tokens: ${tokensEntrada} entrada, ${tokensSaida} saida`,
        );
      }

      // Yield grounding sources as formatted markdown at the end of the stream
      if (configuracao.pesquisaWeb) {
        const groundingMetadata = respostaFinal.candidates?.[0]?.groundingMetadata;
        const sourcesMarkdown = formatarFontesGrounding(groundingMetadata);
        if (sourcesMarkdown) {
          yield sourcesMarkdown;
        }
      }
    } catch (erro) {
      throw this.classificarErro(erro);
    }
  }

  /**
   * Converte as mensagens do formato generico para Content[] do Gemini SDK.
   * Preserva a distincao de turnos (user/model) para suportar chat multi-turn.
   */
  private converterMensagensParaContents(configuracao: ConfiguracaoGeracao): Content[] {
    return configuracao.mensagens.map((mensagem) => ({
      role: mensagem.papel === "usuario" ? "user" : "model",
      parts: mensagem.partes.map((parte) => this.converterParteParaGeminiPart(parte)),
    }));
  }

  private converterParteParaGeminiPart(parte: ParteConteudo): Part {
    switch (parte.tipo) {
      case "texto":
        return { text: parte.dados };
      case "pdf":
        return {
          inlineData: { mimeType: "application/pdf", data: parte.dados },
        };
      case "imagem":
        return {
          inlineData: { mimeType: parte.mimeType, data: parte.dados },
        };
    }
  }

  /**
   * Classifica o erro como transiente (recuperavel) ou permanente.
   * Erros ja classificados (AiApiError, AiApiTransientError) sao repassados.
   */
  private classificarErro(erro: unknown): AiApiError {
    if (erro instanceof AiApiError) return erro;

    const mensagem = erro instanceof Error ? erro.message : String(erro);

    if (ehErroTransienteDeAi(mensagem)) {
      return new AiApiTransientError(`Falha transiente na API Gemini: ${mensagem}`);
    }

    return new AiApiError(`Falha na API Gemini: ${mensagem}`);
  }
}
