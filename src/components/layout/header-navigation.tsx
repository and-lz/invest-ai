"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  TrendingUp,
  BarChart3,
  BookOpen,
  ClipboardList,
  Menu,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ActivityCenter } from "@/components/layout/activity-center";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { dialog } from "@/lib/design-system";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAiEnabled } from "@/lib/ai-features";
import packageJson from "../../../package.json";

const lastCommitMessage = process.env.NEXT_PUBLIC_LAST_COMMIT_MESSAGE || "";

const AI_ONLY_ROUTES = new Set(["/insights"]);

const todosItensPrincipais = [
  { href: "/", label: "Dashboard", icone: LayoutDashboard },
  { href: "/reports", label: "Relatorios", icone: FileText },
  { href: "/insights", label: "Análises", icone: Lightbulb },
  { href: "/desempenho", label: "Desempenho", icone: BarChart3 },
];

const todosItensSecundarios = [
  { href: "/trends", label: "Tendencias", icone: TrendingUp },
  { href: "/plano-acao", label: "Plano de Ação", icone: ClipboardList },
  { href: "/aprender", label: "Aprender", icone: BookOpen },
];

const aiEnabled = isAiEnabled();
const itensNavegacaoPrincipais = aiEnabled
  ? todosItensPrincipais
  : todosItensPrincipais.filter((item) => !AI_ONLY_ROUTES.has(item.href));
const itensNavegacaoSecundarios = aiEnabled
  ? todosItensSecundarios
  : todosItensSecundarios.filter((item) => !AI_ONLY_ROUTES.has(item.href));
const todosItensNavegacao = [...itensNavegacaoPrincipais, ...itensNavegacaoSecundarios];

export function HeaderNavigation() {
  const pathname = usePathname();
  const {
    dialogRef: navDialogRef,
    open: abrirNav,
    close: fecharNav,
    handleBackdropClick: handleNavBackdrop,
  } = useNativeDialog();

  return (
    <div className="sticky top-0 z-50">
      {/* Mobile nav dialog */}
      <dialog
        ref={navDialogRef}
        onClick={handleNavBackdrop}
        aria-label="Menu de navegação"
        className={cn(
          "bg-background flex flex-col border-r p-0 shadow-lg",
          dialog.backdrop,
          dialog.drawerLeft,
        )}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(288px, 75vw)",
          height: "100dvh",
          margin: 0,
        }}
      >
        <div className="border-b px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Link href="/" onClick={fecharNav} className="hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            <Link href="/" onClick={fecharNav} className="hover:text-foreground/80 transition-colors">
              Investimentos
            </Link>{" "}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground cursor-default text-xs font-normal">
                    v{packageJson.version}
                  </span>
                </TooltipTrigger>
                {lastCommitMessage && (
                  <TooltipContent>
                    {lastCommitMessage}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </h2>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {todosItensNavegacao.map((item) => {
            const estaAtivo = pathname === item.href;
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={fecharNav}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  estaAtivo
                    ? "bg-secondary/50 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground",
                )}
              >
                <Icone className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </dialog>

      <header className="border-border/20 relative h-14 border-b">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
          {/* Mobile menu trigger */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={abrirNav}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>

          {/* Logo */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            <h1 className="text-base font-semibold tracking-tight">
              <Link href="/" className="hover:text-foreground/80 transition-colors">
                Investimentos
              </Link>{" "}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground cursor-default text-xs font-normal">
                      v{packageJson.version}
                    </span>
                  </TooltipTrigger>
                  {lastCommitMessage && (
                    <TooltipContent>
                      {lastCommitMessage}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
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
                  title={item.label}
                  className={cn(
                    "group relative flex items-center gap-2 overflow-hidden rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
                    estaAtivo
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <Icone
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      !estaAtivo && "group-hover:scale-110",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-all duration-200",
                      estaAtivo
                        ? "max-w-[100px] opacity-100"
                        : "max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                  {estaAtivo && (
                    <>
                      {/* Active indicator */}
                      <span className="bg-foreground/60 absolute right-2 bottom-0 left-2 h-0.5 rounded-full" />
                      {/* Subtle background for active item */}
                      <span className="bg-secondary/30 absolute inset-0 -z-10 rounded-lg" />
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
                    itensNavegacaoSecundarios.some((item) => pathname === item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Mais
                  {itensNavegacaoSecundarios.some((item) => pathname === item.href) && (
                    <>
                      {/* Active indicator */}
                      <span className="bg-foreground/60 absolute right-3 bottom-0 left-3 h-0.5 rounded-full" />
                      {/* Subtle background for active item */}
                      <span className="bg-secondary/30 absolute inset-0 rounded-lg" />
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
                          estaAtivo && "bg-secondary/50 text-foreground",
                        )}
                      >
                        <Icone className="h-4 w-4" />
                        {item.label}
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
            <UserProfileMenu />
          </div>
        </div>
      </header>
    </div>
  );
}
