import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// Hook para gerenciar síntese de voz (text-to-speech) usando Web Speech API.
// Seleciona automaticamente a melhor voz pt-BR disponível no dispositivo.
// ============================================================

interface UseSpeechSynthesisOptions {
  readonly rate?: number; // Velocidade (0.1 - 10, padrão 1)
  readonly pitch?: number; // Tom (0 - 2, padrão 1)
  readonly volume?: number; // Volume (0 - 1, padrão 1)
  readonly lang?: string; // Idioma (padrão "pt-BR")
}

export type SpeechStatus = "idle" | "loading" | "speaking" | "paused" | "error";

interface UseSpeechSynthesisReturn {
  readonly status: SpeechStatus;
  readonly error: Error | null;
  readonly isSupported: boolean;
  readonly speak: (texto: string) => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly stop: () => void;
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {},
): UseSpeechSynthesisReturn {
  const { rate = 0.95, pitch = 1, volume = 0.9, lang = "pt-BR" } = options;

  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Detect support only on client to avoid hydration mismatch
  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Score a voice by quality — higher is better.
  // Goal: always pick the most powerful/natural voice the OS provides.
  const scoreVoice = useCallback((voice: SpeechSynthesisVoice): number => {
    const name = voice.name.toLowerCase();
    let score = 0;

    // — Language match —
    // Exact pt-BR is strongly preferred over pt-PT or generic pt
    if (voice.lang === "pt-BR" || voice.lang === "pt_BR") score += 100;
    else if (voice.lang.startsWith("pt")) score += 10;

    // — Apple platform voices (macOS/iOS) —
    // Tier: premium > enhanced > compact (com.apple.voice.{tier})
    if (name.includes("premium")) score += 50;
    if (name.includes("enhanced")) score += 40;
    // Siri voices are Apple's highest-quality neural voices
    if (name.includes("siri")) score += 48;

    // — Google neural voices (Chrome/Android) —
    if (name.includes("google")) score += 45;

    // — Microsoft neural voices (Edge/Windows) —
    // "Online (Natural)" voices are the best tier on Edge
    if (name.includes("microsoft") && name.includes("natural")) score += 48;
    else if (name.includes("microsoft") && name.includes("online")) score += 40;

    // — Samsung voices (Android) —
    if (name.includes("samsung")) score += 30;

    // — Generic quality indicators (cross-platform) —
    if (name.includes("neural")) score += 35;
    if (name.includes("natural") && !name.includes("microsoft")) score += 35;

    // Network voices are generally neural/high-quality
    if (!voice.localService) score += 5;

    // — Penalize low-quality voices —
    if (name.includes("compact")) score -= 30;
    if (name.includes("eloquence")) score -= 20;
    if (name.includes("espeak")) score -= 40;

    return score;
  }, []);

  // Select the best available pt-BR voice by quality score
  const obterMelhorVoz = useCallback((): SpeechSynthesisVoice | null => {
    if (!isSupported) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Filter to Portuguese voices, then sort by quality score descending
    const portugueseVoices = voices
      .filter((v) => v.lang.startsWith("pt"))
      .sort((a, b) => scoreVoice(b) - scoreVoice(a));

    const best = portugueseVoices[0] ?? voices[0] ?? null;

    if (best && process.env.NODE_ENV === "development") {
      console.log(`[TTS] Selected voice: "${best.name}" (lang=${best.lang}, local=${best.localService}, score=${scoreVoice(best)})`);
    }

    return best;
  }, [isSupported, scoreVoice]);

  // Falar texto
  const speak = useCallback(
    (texto: string) => {
      if (!isSupported) {
        setError(new Error("Web Speech API não é suportada neste navegador"));
        setStatus("error");
        return;
      }

      // Parar qualquer fala em andamento
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(texto);
      const voz = obterMelhorVoz();

      if (voz) {
        utterance.voice = voz;
      }

      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setStatus("speaking");
        setError(null);
      };

      utterance.onend = () => {
        setStatus("idle");
      };

      utterance.onerror = (event) => {
        setError(new Error(`Erro na síntese de voz: ${event.error}`));
        setStatus("error");
      };

      utterance.onpause = () => {
        setStatus("paused");
      };

      utterance.onresume = () => {
        setStatus("speaking");
      };

      utteranceRef.current = utterance;
      setStatus("loading");

      // Pequeno delay para garantir que vozes foram carregadas
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    },
    [isSupported, obterMelhorVoz, lang, rate, pitch, volume],
  );

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setStatus("idle");
    }
  }, [isSupported]);

  // Garantir que vozes sejam carregadas
  useEffect(() => {
    if (!isSupported) return;

    const carregarVozes = () => {
      window.speechSynthesis.getVoices();
    };

    carregarVozes();
    window.speechSynthesis.addEventListener("voiceschanged", carregarVozes);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", carregarVozes);
    };
  }, [isSupported]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    status,
    error,
    isSupported,
    speak,
    pause,
    resume,
    stop,
  };
}
