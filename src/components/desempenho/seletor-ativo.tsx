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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AtivoDaCarteira {
  codigoAtivo: string;
  nomeAtivo: string;
  estrategia: string;
}

interface SeletorAtivoProps {
  readonly ativosCarteira: AtivoDaCarteira[];
  readonly tickerSelecionado: string | null;
  readonly aoSelecionarTicker: (ticker: string) => void;
  readonly estaCarregando?: boolean;
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

  const rotuloSelecionado = ativoSelecionado
    ? `${ativoSelecionado.codigoAtivo} - ${ativoSelecionado.nomeAtivo}`
    : tickerSelecionado ?? "Selecionar ativo...";

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
                <span className="text-muted-foreground text-sm">
                  Nenhum ativo encontrado.
                </span>
              )}
            </CommandEmpty>

            {ativosCarteira.length > 0 && (
              <CommandGroup heading="Meus Ativos">
                {ativosCarteira.map((ativo) => (
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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{ativo.codigoAtivo}</span>
                      <span className="text-muted-foreground text-xs">
                        {ativo.nomeAtivo} · {ativo.estrategia}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {termoBusca.trim().length >= 2 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Buscar no Mercado">
                  <CommandItem
                    value={`buscar-${termoBusca}`}
                    onSelect={handleBuscarExterno}
                  >
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
