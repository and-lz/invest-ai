"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";

const itensNavegacao = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const [sidebarCompactada, definirSidebarCompactada] = useState(false);
  const [apenasInicializouNoCliente, definirApenasInicializouNoCliente] = useState(false);

  useEffect(() => {
    const sidebarCompactadaArmazenada = localStorage.getItem("sidebarCompactada");
    const sidebarEstaCompactada = sidebarCompactadaArmazenada === "true";
    definirSidebarCompactada(sidebarEstaCompactada);
    definirApenasInicializouNoCliente(true);
  }, []);

  const alternarModoBotao = () => {
    const novoModo = !sidebarCompactada;
    definirSidebarCompactada(novoModo);
    localStorage.setItem("sidebarCompactada", String(novoModo));
  };

  if (!apenasInicializouNoCliente) {
    return null;
  }

  return (
    <aside
      className={cn(
        "bg-card flex h-screen flex-col border-r transition-all duration-300",
        sidebarCompactada ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b",
          sidebarCompactada ? "justify-center px-2" : "justify-between px-6",
        )}
      >
        {!sidebarCompactada && <h1 className="text-lg font-semibold">Investimentos</h1>}
        <div className="flex items-center gap-2">
          <AlternarTema />
          <Button
            variant="ghost"
            size="icon"
            onClick={alternarModoBotao}
            className="h-8 w-8"
            aria-label={sidebarCompactada ? "Expandir menu lateral" : "Compactar menu lateral"}
          >
            {sidebarCompactada ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <nav
        className={cn("flex-1 space-y-1 p-4", sidebarCompactada && "flex flex-col items-center")}
      >
        {itensNavegacao.map((item) => {
          const estaAtivo = pathname === item.href;
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                sidebarCompactada && "justify-center px-2",
                estaAtivo
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              title={sidebarCompactada ? item.rotulo : undefined}
            >
              <Icone className="h-4 w-4" />
              {!sidebarCompactada && item.rotulo}
            </Link>
          );
        })}
      </nav>
      <div className={cn("border-t p-4", sidebarCompactada && "flex justify-center")}>
        <UserProfileMenu />
      </div>
    </aside>
  );
}
