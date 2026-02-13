import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [scrollDirecao, definirScrollDirecao] = useState<"cima" | "baixo">("cima");
  const [scrollPosicaoAnterior, definirScrollPosicaoAnterior] = useState(0);

  useEffect(() => {
    const elementoScroll = document.querySelector("main");
    if (!elementoScroll) return;

    const manipularScroll = () => {
      const scrollPosicaoAtual = elementoScroll.scrollTop;
      const novaDir = scrollPosicaoAtual > scrollPosicaoAnterior ? "baixo" : "cima";

      if (novaDir !== scrollDirecao) {
        definirScrollDirecao(novaDir);
      }

      definirScrollPosicaoAnterior(scrollPosicaoAtual);
    };

    elementoScroll.addEventListener("scroll", manipularScroll);
    return () => {
      elementoScroll.removeEventListener("scroll", manipularScroll);
    };
  }, [scrollPosicaoAnterior, scrollDirecao]);

  return scrollDirecao;
}
