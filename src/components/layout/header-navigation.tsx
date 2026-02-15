"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Lightbulb, TrendingUp, BarChart3, BookOpen, Menu, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlternarTema } from "@/components/layout/alternar-tema";
import { ActivityCenter } from "@/components/layout/activity-center";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import packageJson from "../../../package.json";

const itensNavegacaoPrincipais = [
  { href: "/", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/reports", rotulo: "Relatorios", icone: FileText },
  { href: "/insights", rotulo: "Insights", icone: Lightbulb },
  { href: "/desempenho", rotulo: "Desempenho", icone: BarChart3 },
];

const itensNavegacaoSecundarios = [
  { href: "/trends", rotulo: "Tendencias", icone: TrendingUp },
  { href: "/aprender", rotulo: "Aprender", icone: BookOpen },
];

const todosItensNavegacao = [...itensNavegacaoPrincipais, ...itensNavegacaoSecundarios];

export function HeaderNavigation() {
  const pathname = usePathname();
  const [estaVisivel, setEstaVisivel] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

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
        estaVisivel ? "h-14" : "h-0"
      )}
    >
      <header className="relative h-14 border-b border-border/20">

        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
          {/* Mobile menu */}
          <Sheet open={menuMobileAberto} onOpenChange={setMenuMobileAberto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="font-serif text-lg font-semibold tracking-tight">
                  Investimentos <span className="text-xs font-normal text-muted-foreground">v{packageJson.version}</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {todosItensNavegacao.map((item) => {
                  const estaAtivo = pathname === item.href;
                  const Icone = item.icone;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuMobileAberto(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        estaAtivo
                          ? "bg-secondary/50 text-foreground"
                          : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground",
                      )}
                    >
                      <Icone className="h-4 w-4" />
                      {item.rotulo}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="hidden items-center gap-2 md:flex">
            <h1 className="font-serif text-base font-semibold tracking-tight">
              Investimentos <span className="text-xs font-normal text-muted-foreground">v{packageJson.version}</span>
            </h1>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Principais */}
            {itensNavegacaoPrincipais.map((item) => {
              const estaAtivo = pathname === item.href;
              const Icone = item.icone;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.rotulo}
                  className={cn(
                    "group relative flex items-center gap-2 overflow-hidden rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
                    estaAtivo
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <Icone className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200",
                    !estaAtivo && "group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "whitespace-nowrap text-sm font-medium transition-all duration-200",
                    estaAtivo ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100"
                  )}>
                    {item.rotulo}
                  </span>
                  {estaAtivo && (
                    <>
                      {/* Active indicator */}
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-foreground/60" />
                      {/* Subtle background for active item */}
                      <span className="absolute inset-0 -z-10 rounded-lg bg-secondary/30" />
                    </>
                  )}
                </Link>
              );
            })}

            {/* Dropdown "Mais" */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "group relative gap-2 text-sm font-medium transition-all duration-200",
                    itensNavegacaoSecundarios.some(item => pathname === item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Mais
                  {itensNavegacaoSecundarios.some(item => pathname === item.href) && (
                    <>
                      {/* Active indicator */}
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-foreground/60" />
                      {/* Subtle background for active item */}
                      <span className="absolute inset-0 rounded-lg bg-secondary/30" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {itensNavegacaoSecundarios.map((item) => {
                  const estaAtivo = pathname === item.href;
                  const Icone = item.icone;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium",
                          estaAtivo && "bg-secondary/50 text-foreground"
                        )}
                      >
                        <Icone className="h-4 w-4" />
                        {item.rotulo}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ActivityCenter />
            <AlternarTema />
            <UserProfileMenu />
          </div>
        </div>
      </header>
    </div>
  );
}
