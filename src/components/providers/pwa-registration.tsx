"use client";

import { useEffect } from "react";

/**
 * Componente que registra o Service Worker para PWA
 * Executado apenas no client-side
 */
export function PwaRegistration() {
  useEffect(() => {
    // Service Worker só funciona em HTTPS (exceto localhost)
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registro) => {
          console.log("[PWA] Service Worker registrado com sucesso:", registro.scope);

          // Verificar atualizações periodicamente (a cada hora)
          setInterval(
            () => {
              registro.update();
            },
            60 * 60 * 1000,
          );
        })
        .catch((erro) => {
          console.error("[PWA] Falha ao registrar Service Worker:", erro);
        });

      // Detectar quando uma nova versão está disponível
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[PWA] Nova versão do app disponível");
        // Você pode exibir um toast aqui informando o usuário
      });
    }
  }, []);

  return null; // Componente não renderiza nada
}
