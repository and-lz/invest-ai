"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { IdentificadorPagina } from "@/schemas/chat.schema";

interface ContextoPaginaChatValor {
  readonly identificadorPagina: IdentificadorPagina;
  readonly dadosContexto: string | undefined;
  readonly definirContexto: (identificador: IdentificadorPagina, dados?: string) => void;
}

const ContextoPaginaChat = createContext<ContextoPaginaChatValor | null>(null);

export function ChatPageProvider({ children }: { children: ReactNode }) {
  const [identificadorPagina, setIdentificadorPagina] = useState<IdentificadorPagina>("dashboard");
  const [dadosContexto, setDadosContexto] = useState<string | undefined>(undefined);

  const definirContexto = useCallback((identificador: IdentificadorPagina, dados?: string) => {
    setIdentificadorPagina(identificador);
    setDadosContexto(dados);
  }, []);

  const valor = useMemo(
    () => ({ identificadorPagina, dadosContexto, definirContexto }),
    [identificadorPagina, dadosContexto, definirContexto],
  );

  return <ContextoPaginaChat.Provider value={valor}>{children}</ContextoPaginaChat.Provider>;
}

export function useChatPageContext(): ContextoPaginaChatValor {
  const contexto = useContext(ContextoPaginaChat);
  if (!contexto) {
    throw new Error("useChatPageContext deve ser usado dentro de ChatPageProvider");
  }
  return contexto;
}
