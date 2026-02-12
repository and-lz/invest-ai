"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const itensNavegacao = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/upload", rotulo: "Upload", icone: Upload },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
];

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold">Investimentos</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {itensNavegacao.map((item) => {
          const estaAtivo = pathname === item.href;
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
    </aside>
  );
}
