/**
 * Classifica erros de APIs de IA como transientes (recuperaveis) ou permanentes.
 * Erros transientes justificam retry automatico com backoff exponencial.
 */

const PADROES_ERRO_TRANSIENTE: readonly RegExp[] = [
  /429/,
  /too many requests/i,
  /rate limit/i,
  /quota/i,
  /503/,
  /service unavailable/i,
  /500.*internal/i,
  /502.*bad gateway/i,
  /timeout/i,
  /ECONNRESET/,
  /ETIMEDOUT/,
  /ECONNREFUSED/,
  /fetch.*failed/i,
  /network/i,
  /socket hang up/i,
  /ENOTFOUND/,
];

export function ehErroTransienteDeAi(mensagem: string): boolean {
  return PADROES_ERRO_TRANSIENTE.some((padrao) => padrao.test(mensagem));
}
