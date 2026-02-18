interface EntradaCache<T> {
  dados: T;
  expiraEm: number;
}

const TTL_PADRAO_MS = 30 * 60 * 1000; // 30 minutos

class CacheEmMemoria {
  private readonly entradas = new Map<string, EntradaCache<unknown>>();

  obter<T>(chave: string): T | null {
    const entrada = this.entradas.get(chave);
    if (!entrada) return null;

    if (Date.now() > entrada.expiraEm) {
      this.entradas.delete(chave);
      return null;
    }

    return entrada.dados as T;
  }

  definir<T>(chave: string, dados: T, ttlMs: number = TTL_PADRAO_MS): void {
    this.entradas.set(chave, {
      dados,
      expiraEm: Date.now() + ttlMs,
    });
  }

  invalidar(chave: string): void {
    this.entradas.delete(chave);
  }

  invalidarPorPrefixo(prefixo: string): void {
    for (const chave of this.entradas.keys()) {
      if (chave.startsWith(prefixo)) {
        this.entradas.delete(chave);
      }
    }
  }

  limpar(): void {
    this.entradas.clear();
  }
}

export const cacheGlobal = new CacheEmMemoria();
export { CacheEmMemoria, TTL_PADRAO_MS };
