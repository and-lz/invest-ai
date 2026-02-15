/**
 * Fetcher padrao compartilhado para todos os hooks SWR.
 * Centraliza tratamento de erros HTTP com tipo tipado.
 */

export class ErroFetch extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = "ErroFetch";
    this.status = status;
  }
}

export async function fetcherPadrao<T>(url: string): Promise<T> {
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new ErroFetch(
      `Erro ao buscar ${url}: ${resposta.status} ${resposta.statusText}`,
      resposta.status,
    );
  }

  return resposta.json() as Promise<T>;
}
