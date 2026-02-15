// Service Worker para PWA - Cache básico de assets estáticos
const CACHE_NAME = "investimentos-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon-180.png",
];

// Instala o Service Worker e faz cache de assets críticos
self.addEventListener("install", (evento) => {
  console.log("[SW] Instalando Service Worker...");
  evento.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cache aberto, adicionando assets estáticos");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativa o Service Worker e limpa caches antigos
self.addEventListener("activate", (evento) => {
  console.log("[SW] Ativando Service Worker...");
  evento.waitUntil(
    caches
      .keys()
      .then((nomesCache) => {
        return Promise.all(
          nomesCache.map((nome) => {
            if (nome !== CACHE_NAME) {
              console.log("[SW] Removendo cache antigo:", nome);
              return caches.delete(nome);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estratégia: Network First com fallback para cache (ideal para app dinâmico)
self.addEventListener("fetch", (evento) => {
  // Ignorar requests não-HTTP
  if (!evento.request.url.startsWith("http")) {
    return;
  }

  // Ignorar requests para API externa (Gemini, Auth, etc)
  if (
    evento.request.url.includes("/api/auth") ||
    evento.request.url.includes("googleapis.com")
  ) {
    return;
  }

  evento.respondWith(
    fetch(evento.request)
      .then((resposta) => {
        // Clone a resposta para armazenar no cache
        const respostaClonada = resposta.clone();

        // Cachear apenas respostas bem-sucedidas (200-299)
        if (resposta.status >= 200 && resposta.status < 300) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evento.request, respostaClonada);
          });
        }

        return resposta;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar do cache
        return caches.match(evento.request).then((respostaCache) => {
          if (respostaCache) {
            console.log("[SW] Servindo do cache:", evento.request.url);
            return respostaCache;
          }

          // Se não estiver no cache e for navegação, retorna página offline
          if (evento.request.mode === "navigate") {
            return caches.match("/");
          }

          // Para outros recursos, retorna erro
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});
