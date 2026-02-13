"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { useState, useEffect } from "react";

const itensNavegacao = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/upload", rotulo: "Upload", icone: Upload },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
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
      <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md backdrop-saturate-150">
        <div className="flex h-16 items-center justify-between px-6">
        <h1 className="font-serif text-lg font-semibold tracking-tight">Investimentos</h1>

        <nav className="flex items-center gap-1">
          {itensNavegacao.map((item) => {
            const estaAtivo = pathname === item.href;
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  estaAtivo
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icone className="h-4 w-4" />
                {item.rotulo}
                {estaAtivo && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-foreground/60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <AlternarTema />
        </div>
      </div>
      </header>
    </div>
  );
}
