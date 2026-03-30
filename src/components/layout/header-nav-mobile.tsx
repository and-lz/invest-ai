"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { dialog } from "@/lib/design-system";
import { todosItensNavegacao, lastCommitMessage } from "./header-nav-constants";

interface MobileNavDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  handleBackdropClick: (e: React.MouseEvent<HTMLDialogElement>) => void;
  fecharNav: () => void;
  pathname: string;
  version: string;
}

export function MobileNavDialog({
  dialogRef,
  handleBackdropClick,
  fecharNav,
  pathname,
  version,
}: MobileNavDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
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
        </h2>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {todosItensNavegacao.map((item) => {
          const estaAtivo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
  );
}
