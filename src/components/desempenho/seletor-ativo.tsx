"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AtivoDaCarteira {
  codigoAtivo: string;
  nomeAtivo: string;
  estrategia: string;
  rentabilidade12Meses: number | null;
}

interface SeletorAtivoProps {
  readonly ativosCarteira: AtivoDaCarteira[];
  readonly tickerSelecionado: string | null;
  readonly aoSelecionarTicker: (ticker: string) => void;
  readonly estaCarregando?: boolean;
}

interface GrupoAtivos {
  label: string;
  ativos: AtivoDaCarteira[];
}

function agruparAtivosPorPerformance(ativos: AtivoDaCarteira[]): GrupoAtivos[] {
  const excelentes: AtivoDaCarteira[] = [];
  const bons: AtivoDaCarteira[] = [];
  const moderados: AtivoDaCarteira[] = [];
  const negativos: AtivoDaCarteira[] = [];
  const semDados: AtivoDaCarteira[] = [];

  for (const ativo of ativos) {
    if (ativo.rentabilidade12Meses === null) {
      semDados.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 15) {
      excelentes.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 5) {
      bons.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 0) {
      moderados.push(ativo);
    } else {
      negativos.push(ativo);
    }
  }

  const grupos: GrupoAtivos[] = [];

  if (excelentes.length > 0) {
    grupos.push({ label: "🔥 Excelentes (12m ≥ +15%)", ativos: excelentes });
  }
  if (bons.length > 0) {
    grupos.push({ label: "📈 Bons (12m +5% a +15%)", ativos: bons });
  }
  if (moderados.length > 0) {
    grupos.push({ label: "📊 Moderados (12m 0% a +5%)", ativos: moderados });
  }
  if (negativos.length > 0) {
    grupos.push({ label: "📉 Negativos (12m < 0%)", ativos: negativos });
  }
  if (semDados.length > 0) {
    grupos.push({ label: "❓ Sem Dados (12m)", ativos: semDados });
  }

  return grupos;
}

export function SeletorAtivo({
  ativosCarteira,
  tickerSelecionado,
  aoSelecionarTicker,
  estaCarregando,
}: SeletorAtivoProps) {
  const [aberto, setAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");

  const ativoSelecionado = useMemo(
    () =>
      ativosCarteira.find(
        (ativo) => ativo.codigoAtivo.toUpperCase() === tickerSelecionado?.toUpperCase(),
      ),
    [ativosCarteira, tickerSelecionado],
  );

  const gruposAtivos = useMemo(() => agruparAtivosPorPerformance(ativosCarteira), [ativosCarteira]);

  const rotuloSelecionado = ativoSelecionado
    ? `${ativoSelecionado.codigoAtivo} - ${ativoSelecionado.nomeAtivo}`
    : (tickerSelecionado ?? "Selecionar ativo...");

  const handleSelecionarAtivo = (ticker: string) => {
    aoSelecionarTicker(ticker);
    setAberto(false);
    setTermoBusca("");
  };

  const handleBuscarExterno = () => {
    const termoNormalizado = termoBusca.trim().toUpperCase();
    if (termoNormalizado.length >= 2) {
      handleSelecionarAtivo(termoNormalizado);
    }
  };

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className="w-full justify-between md:w-[400px]"
          disabled={estaCarregando}
        >
          <span className="truncate">{rotuloSelecionado}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 md:w-[400px]" align="start">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Buscar ativo..."
            value={termoBusca}
            onValueChange={setTermoBusca}
          />
          <CommandList>
            <CommandEmpty>
              {termoBusca.trim().length >= 2 ? (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center gap-2 p-2 text-sm"
                  onClick={handleBuscarExterno}
                >
                  <Search className="h-4 w-4" />
                  Buscar &quot;{termoBusca.trim().toUpperCase()}&quot; no mercado
                </button>
              ) : (
                <span className="text-muted-foreground text-sm">Nenhum ativo encontrado.</span>
              )}
            </CommandEmpty>

            {ativosCarteira.length > 0 &&
              gruposAtivos.map((grupo, indiceGrupo) => (
                <CommandGroup key={grupo.label} heading={grupo.label}>
                  {grupo.ativos.map((ativo) => {
                    const ativoTemTicker = ativo.codigoAtivo !== ativo.nomeAtivo;
                    const rentabilidadeTexto =
                      ativo.rentabilidade12Meses !== null
                        ? `${ativo.rentabilidade12Meses > 0 ? "+" : ""}${ativo.rentabilidade12Meses.toFixed(1)}%`
                        : null;

                    return (
                      <CommandItem
                        key={ativo.codigoAtivo}
                        value={`${ativo.codigoAtivo} ${ativo.nomeAtivo}`}
                        onSelect={() => handleSelecionarAtivo(ativo.codigoAtivo)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            tickerSelecionado?.toUpperCase() === ativo.codigoAtivo.toUpperCase()
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">
                              {ativo.codigoAtivo}
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                              {ativoTemTicker ? `${ativo.nomeAtivo} · ` : ""}
                              {ativo.estrategia}
                            </span>
                          </div>
                          {rentabilidadeTexto && (
                            <span
                              className={cn(
                                "text-xs font-medium",
                                ativo.rentabilidade12Meses! >= 0
                                  ? "text-success"
                                  : "text-destructive",
                              )}
                            >
                              {rentabilidadeTexto}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                  {indiceGrupo < gruposAtivos.length - 1 && <CommandSeparator />}
                </CommandGroup>
              ))}

            {termoBusca.trim().length >= 2 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Buscar no Mercado">
                  <CommandItem value={`buscar-${termoBusca}`} onSelect={handleBuscarExterno}>
                    <Search className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      Buscar &quot;{termoBusca.trim().toUpperCase()}&quot; via brapi
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
