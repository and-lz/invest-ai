"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Monitor, Moon, Sun, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isAiEnabled } from "@/lib/ai-features";

const OPCOES_TEMA = [
  { valor: "light", rotulo: "Claro", icone: Sun },
  { valor: "dark", rotulo: "Escuro", icone: Moon },
  { valor: "system", rotulo: "Sistema", icone: Monitor },
] as const;

export function UserProfileMenu() {
  const { data: session } = useSession();
  const { theme: temaSelecionado, setTheme: definirTema } = useTheme();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!session?.user) return null;

  const iniciais =
    session.user.name
      ?.split(" ")
      .map((nome) => nome[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name ?? "Usuario"}
            />
            <AvatarFallback>{iniciais}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-muted-foreground text-xs">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPCOES_TEMA.map(({ valor, rotulo, icone: Icone }) => (
          <DropdownMenuItem
            key={valor}
            onClick={() => definirTema(valor)}
          >
            <Icone className="mr-2 h-4 w-4" />
            <span className="flex-1">{rotulo}</span>
            {montado && temaSelecionado === valor && (
              <Check className={cn("ml-2 h-3.5 w-3.5", "text-muted-foreground")} />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {isAiEnabled() && (
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
