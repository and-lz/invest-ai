"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/components/layout/alternar-tema";

const itensNavegacao = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/upload", rotulo: "Upload", icone: Upload },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
];

export function HeaderNavigation() {
  const pathname = usePathname();

  return (
    <header className="bg-background border-border sticky top-0 z-50 h-16 border-b">
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
          <AlternarTema />
        </div>
      </div>
    </header>
  );
}
