"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ActivityCenter } from "@/components/layout/activity-center";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { isAiEnabled } from "@/lib/ai-features";
import { useUserSettings } from "@/hooks/use-user-settings";
import { icon } from "@/lib/design-system";
import { MobileNavDialog } from "./header-nav-mobile";
import {
  lastCommitMessage,
  itensNavegacaoPrincipais,
  itensNavegacaoSecundarios,
  TIER_ICONS,
  TIER_LABELS,
} from "./header-nav-constants";

const aiEnabled = isAiEnabled();

export function HeaderNavigation() {
  const pathname = usePathname();
  const [version, setVersion] = useState("");
  const { claudeModelTier } = useUserSettings();
  const {
    dialogRef: navDialogRef,
    open: abrirNav,
    close: fecharNav,
    handleBackdropClick: handleNavBackdrop,
  } = useNativeDialog();

  useEffect(() => {
    setVersion(process.env.NEXT_PUBLIC_APP_VERSION || "");
  }, []);

  // Track last non-chat page for smart back navigation
  useEffect(() => {
    if (!pathname.startsWith("/chat")) {
      sessionStorage.setItem("lastNonChatPage", pathname);
    }
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50">
      {/* Mobile nav dialog */}
      <MobileNavDialog
        dialogRef={navDialogRef}
        handleBackdropClick={handleNavBackdrop}
        fecharNav={fecharNav}
        pathname={pathname}
        version={version}
      />

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
                Fortuna
              </Link>{" "}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground cursor-default text-xs font-normal" suppressHydrationWarning>
                      {version ? `v${version}` : ""}
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
            {itensNavegacaoPrincipais.map((item) => {
              const estaAtivo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
                      <span className="bg-foreground/60 absolute right-2 bottom-0 left-2 h-0.5 rounded-full" />
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
                      <span className="bg-foreground/60 absolute right-3 bottom-0 left-3 h-0.5 rounded-full" />
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
            {aiEnabled && claudeModelTier && (() => {
              const TierIcon = TIER_ICONS[claudeModelTier];
              const tierLabel = TIER_LABELS[claudeModelTier];
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/settings">
                          <TierIcon className={icon.button} />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Modelo: {tierLabel}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })()}
            <ActivityCenter />
            <UserProfileMenu />
          </div>
        </div>
      </header>
    </div>
  );
}
