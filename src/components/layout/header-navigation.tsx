"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Lightbulb, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { IndicadorTarefaAtiva } from "@/components/layout/indicador-tarefa-ativa";
import { CentralNotificacoes } from "@/components/layout/central-notificacoes";
import { useState, useEffect } from "react";

const itensNavegacao = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
  { href: "/trends", rotulo: "Tendencias", icone: TrendingUp },
];

export function HeaderNavigation() {
  const pathname = usePathname();
  const [estaVisivel, setEstaVisivel] = useState(true);

  useEffect(() => {
    let scrollAnteriorLocal = 0;

    const handleScroll = () => {
      const elementoScroll = document.querySelector("main") as HTMLElement | null;
      if (!elementoScroll) return;

      const scrollAtual = elementoScroll.scrollTop;

      if (scrollAtual < 50) {
        setEstaVisivel(true);
      } else if (scrollAtual > scrollAnteriorLocal) {
        setEstaVisivel(false);
      } else {
        setEstaVisivel(true);
      }

      scrollAnteriorLocal = scrollAtual;
    };

    // Find the scrollable main element
    const elementoScroll = document.querySelector("main") as HTMLElement | null;

    if (elementoScroll) {
      elementoScroll.addEventListener("scroll", handleScroll, { passive: true });
      return () => elementoScroll.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 overflow-hidden transition-all duration-300",
        estaVisivel ? "h-16" : "h-0"
      )}
    >
      <header className="relative h-16 border-b border-border/20">

        <div className="flex h-16 items-center justify-between gap-8 px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg font-semibold tracking-tight">
              Investimentos
            </h1>
          </div>

          {/* Navigation with enhanced hover states */}
          <nav className="flex items-center gap-1">
            {itensNavegacao.map((item) => {
              const estaAtivo = pathname === item.href;
              const Icone = item.icone;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    estaAtivo
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <Icone className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    !estaAtivo && "group-hover:scale-110"
                  )} />
                  {item.rotulo}
                  {estaAtivo && (
                    <>
                      {/* Active indicator */}
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-foreground/60" />
                      {/* Subtle background for active item */}
                      <span className="absolute inset-0 rounded-lg bg-secondary/30" />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions with visual separator */}
          <div className="flex items-center gap-4">
            <IndicadorTarefaAtiva />
            <CentralNotificacoes />
            <div className="h-6 w-px bg-border/50" />
            <AlternarTema />
          </div>
        </div>
      </header>
    </div>
  );
}
