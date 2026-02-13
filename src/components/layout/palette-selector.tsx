"use client";

import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useCyberpunkPalette,
  type CyberpunkPalette,
} from "@/contexts/cyberpunk-palette-context";

const PALETTE_OPTIONS: {
  value: CyberpunkPalette;
  label: string;
  cores: [string, string, string];
}[] = [
  {
    value: "none",
    label: "Desativado",
    cores: ["#666666", "#666666", "#666666"],
  },
  {
    value: "synthwave",
    label: "Synthwave Clássico",
    cores: ["#FF10F0", "#00D9FF", "#B74EFF"],
  },
  {
    value: "cyberpunk-2077",
    label: "Cyberpunk 2077",
    cores: ["#FFD500", "#FF10F0", "#00D9FF"],
  },
  {
    value: "blade-runner",
    label: "Blade Runner",
    cores: ["#FF9500", "#00D9FF", "#9D00FF"],
  },
  {
    value: "matrix",
    label: "Matrix Verde",
    cores: ["#00FF41", "#00FFB3", "#7FFF00"],
  },
];

export function PaletteSelector() {
  const { palette: paletaAtual, setPalette: definirPaleta } =
    useCyberpunkPalette();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Seletor de paleta cyberpunk"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {PALETTE_OPTIONS.map((opcao, indice) => (
          <div key={opcao.value}>
            {indice > 0 && opcao.value !== "none" && indice === 1 && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem onClick={() => definirPaleta(opcao.value)}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {opcao.cores.map((cor, idx) => (
                    <div
                      key={idx}
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
                <span>{opcao.label}</span>
                {paletaAtual === opcao.value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
