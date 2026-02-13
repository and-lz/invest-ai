"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { PaletteSelector } from "@/components/layout/palette-selector";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

const itensNavegacao = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/upload", rotulo: "Upload", icone: Upload },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
];

export function HeaderNavigation() {
  const pathname = usePathname();
  const scrollDirecao = useScrollDirection();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out",
        scrollDirecao === "baixo"
          ? "h-0 overflow-hidden opacity-0"
          : "bg-background border-border h-16 border-b",
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-lg font-bold">Investimentos</h1>

        <nav className="flex items-center gap-2">
          {itensNavegacao.map((item) => {
            const estaAtivo = pathname === item.href;
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  estaAtivo
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icone className="h-4 w-4" />
                {item.rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <PaletteSelector />
          <AlternarTema />
        </div>
      </div>
    </header>
  );
}
