"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import { useOrdenacaoTabela } from "@/hooks/use-ordenacao-tabela";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_MELHORES_PERFORMERS,
  GLOSSARIO_PIORES_PERFORMERS,
  GLOSSARIO_ATIVO,
  GLOSSARIO_SALDO,
  GLOSSARIO_RENTABILIDADE_MES,
  GLOSSARIO_PARTICIPACAO,
} from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import type { PosicaoAtivo } from "@/schemas/report-extraction.schema";

type ColunaPerformers = "ativo" | "estrategia" | "saldo" | "rentabilidadeMes" | "participacao";

interface TopPerformersTableProps {
  titulo: string;
  ativos: PosicaoAtivo[];
  tipo: "melhores" | "piores";
}

function obterValorColuna(ativo: PosicaoAtivo, coluna: ColunaPerformers): string | number {
  switch (coluna) {
    case "ativo":
      return ativo.codigoAtivo ?? ativo.nomeAtivo;
    case "estrategia":
      return ativo.estrategia;
    case "saldo":
      return ativo.saldoBruto.valorEmCentavos;
    case "rentabilidadeMes":
      return ativo.rentabilidadeMes.valor;
    case "participacao":
      return ativo.participacaoNaCarteira.valor;
  }
}

interface CabecalhoOrdenaveProps {
  coluna: ColunaPerformers;
  colunaAtiva: ColunaPerformers | null;
  direcao: "asc" | "desc";
  onClick: (coluna: ColunaPerformers) => void;
  className?: string;
  children: React.ReactNode;
}

function CabecalhoOrdenavel({
  coluna,
  colunaAtiva,
  direcao,
  onClick,
  className,
  children,
}: CabecalhoOrdenaveProps) {
  const eAtiva = colunaAtiva === coluna;
  const Icone = eAtiva ? (direcao === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      className={`group hover:text-foreground cursor-pointer select-none ${className ?? ""}`}
      onClick={() => onClick(coluna)}
    >
      <div
        className={`flex items-center gap-1 ${className?.includes("text-right") ? "justify-end" : ""}`}
      >
        {children}
        <Icone
          className={`h-3 w-3 ${eAtiva ? "text-foreground" : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"} transition-opacity`}
        />
      </div>
    </TableHead>
  );
}

function gerarConclusaoPerformers(
  ativos: PosicaoAtivo[],
  tipo: "melhores" | "piores",
): Conclusao[] {
  if (ativos.length === 0) return [];

  const primeiroAtivo = ativos[0];
  if (!primeiroAtivo) return [];
  const nomeAtivo = primeiroAtivo.codigoAtivo ?? primeiroAtivo.nomeAtivo;
  const rentabilidade = formatarPercentualSimples(primeiroAtivo.rentabilidadeMes.valor);

  if (tipo === "melhores") {
    return [
      {
        texto: `Seu campeão do mês é ${nomeAtivo} com ${rentabilidade} de retorno. Ele representa ${formatarPercentualSimples(primeiroAtivo.participacaoNaCarteira.valor)} da sua carteira.`,
        tipo: "positivo",
      },
    ];
  }

  if (primeiroAtivo.rentabilidadeMes.valor < 0) {
    return [
      {
        texto: `${nomeAtivo} teve a maior queda: ${rentabilidade}. Prejuízos pontuais são normais — avalie se a estratégia de longo prazo ainda faz sentido.`,
        tipo: "atencao",
      },
    ];
  }

  return [
    {
      texto: `Mesmo o pior resultado (${nomeAtivo}, ${rentabilidade}) foi positivo. Bom mês para a carteira!`,
      tipo: "positivo",
    },
  ];
}

export function TopPerformersTable({ titulo, ativos, tipo }: TopPerformersTableProps) {
  const Icone = tipo === "melhores" ? TrendingUp : TrendingDown;
  const conclusoesPerformer = gerarConclusaoPerformers(ativos, tipo);

  const obterValor = useCallback(
    (ativo: PosicaoAtivo, coluna: ColunaPerformers) => obterValorColuna(ativo, coluna),
    [],
  );

  const { itensOrdenados, colunaOrdenacao, direcaoOrdenacao, alternarOrdenacao } =
    useOrdenacaoTabela<PosicaoAtivo, ColunaPerformers>(ativos, obterValor);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Icone className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          {titulo}
          <InfoTooltip
            conteudo={
              tipo === "melhores"
                ? GLOSSARIO_MELHORES_PERFORMERS.explicacao
                : GLOSSARIO_PIORES_PERFORMERS.explicacao
            }
          />
        </CardTitle>
        <CardDescription className="text-xs">
          {tipo === "melhores"
            ? "Seus investimentos com melhor desempenho neste período."
            : "Investimentos com menor desempenho. Perdas no curto prazo são normais."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <CabecalhoOrdenavel
                coluna="ativo"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
              >
                <span className="flex items-center gap-1">
                  Ativo
                  <InfoTooltip conteudo={GLOSSARIO_ATIVO.explicacao} tamanhoIcone="h-3 w-3" />
                </span>
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel
                coluna="estrategia"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
              >
                Estrategia
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel
                coluna="saldo"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
                className="text-right"
              >
                <span className="flex items-center gap-1">
                  Saldo
                  <InfoTooltip conteudo={GLOSSARIO_SALDO.explicacao} tamanhoIcone="h-3 w-3" />
                </span>
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel
                coluna="rentabilidadeMes"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
                className="text-right"
              >
                <span className="flex items-center gap-1">
                  Rent. Mes
                  <InfoTooltip
                    conteudo={GLOSSARIO_RENTABILIDADE_MES.explicacao}
                    tamanhoIcone="h-3 w-3"
                  />
                </span>
              </CabecalhoOrdenavel>
              <CabecalhoOrdenavel
                coluna="participacao"
                colunaAtiva={colunaOrdenacao}
                direcao={direcaoOrdenacao}
                onClick={alternarOrdenacao}
                className="text-right"
              >
                <span className="flex items-center gap-1">
                  Part.
                  <InfoTooltip
                    conteudo={GLOSSARIO_PARTICIPACAO.explicacao}
                    tamanhoIcone="h-3 w-3"
                  />
                </span>
              </CabecalhoOrdenavel>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itensOrdenados.map((ativo) => (
              <TableRow key={ativo.nomeAtivo}>
                <TableCell className="font-medium">
                  <Link
                    href={`/desempenho?ticker=${encodeURIComponent(ativo.codigoAtivo ?? ativo.nomeAtivo)}`}
                    className="hover:text-primary underline-offset-4 hover:underline"
                  >
                    {ativo.codigoAtivo ?? ativo.nomeAtivo}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {ativo.estrategia}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatarMoeda(ativo.saldoBruto.valorEmCentavos)}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${ativo.rentabilidadeMes.valor >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {formatarPercentualSimples(ativo.rentabilidadeMes.valor)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {formatarPercentualSimples(ativo.participacaoNaCarteira.valor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TakeawayBox conclusoes={conclusoesPerformer} />
      </CardContent>
    </Card>
  );
}
