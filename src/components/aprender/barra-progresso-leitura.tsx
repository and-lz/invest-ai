"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BarraProgressoLeituraProps {
  readonly className?: string;
}

export function BarraProgressoLeitura({ className }: BarraProgressoLeituraProps) {
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    function calcularProgresso() {
      const alturaDocumento = document.documentElement.scrollHeight - window.innerHeight;
      const scrollAtual = window.scrollY;
      const percentualProgresso = (scrollAtual / alturaDocumento) * 100;

      setProgresso(Math.min(100, Math.max(0, percentualProgresso)));
    }

    calcularProgresso();

    window.addEventListener("scroll", calcularProgresso, { passive: true });
    window.addEventListener("resize", calcularProgresso, { passive: true });

    return () => {
      window.removeEventListener("scroll", calcularProgresso);
      window.removeEventListener("resize", calcularProgresso);
    };
  }, []);

  return (
    <div
      className={cn("bg-muted sticky top-[73px] z-40 h-1 w-full overflow-hidden", className)}
      role="progressbar"
      aria-valuenow={Math.round(progresso)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso de leitura"
    >
      <div
        className="bg-primary h-full transition-all duration-200 ease-out"
        style={{ width: `${progresso}%` }}
      />
    </div>
  );
}
