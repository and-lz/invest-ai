import { Link } from "next-view-transitions";
import { ChevronLeft, ChevronRight, Clock, GraduationCap, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbsEducacional } from "./breadcrumbs-educacional";
import { BarraProgressoLeitura } from "./barra-progresso-leitura";
import { BotaoLerArtigo } from "./botao-ler-artigo";
import { cn } from "@/lib/utils";
import { tipografia, icone } from "@/lib/design-system";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";
import { INFORMACOES_CATEGORIAS } from "@/schemas/artigo-educacional.schema";

interface LayoutArtigoProps {
  readonly metadata: ArtigoMetadata;
  readonly children: React.ReactNode;
  readonly artigoAnterior?: { titulo: string; slug: string; categoria: string } | null;
  readonly proximoArtigo?: { titulo: string; slug: string; categoria: string } | null;
  readonly className?: string;
}

const CORES_NIVEL = {
  iniciante: "bg-success/10 text-success border-success/30",
  intermediario: "bg-warning/10 text-warning border-warning/30",
  avancado: "bg-destructive/10 text-destructive border-destructive/30",
} as const;

const ROTULOS_NIVEL = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
} as const;

function formatarData(dataISO: string): string {
  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LayoutArtigo({
  metadata,
  children,
  artigoAnterior,
  proximoArtigo,
  className,
}: LayoutArtigoProps) {
  const categoriaInfo = INFORMACOES_CATEGORIAS.find((c) => c.slug === metadata.categoria);

  return (
    <>
      <BarraProgressoLeitura />

      <article className={cn("mx-auto max-w-3xl space-y-8", className)}>
        {/* Breadcrumbs */}
        <BreadcrumbsEducacional
          items={[
            { rotulo: "Aprender", href: "/aprender" },
            {
              rotulo: categoriaInfo?.titulo ?? metadata.categoria,
              href: `/aprender/${metadata.categoria}`,
            },
            { rotulo: metadata.titulo },
          ]}
        />

        {/* Header do Artigo */}
        <header className="space-y-4">
          <div className="flex items-start gap-3">
            <h1 className={cn(tipografia.h1Grande, "flex-1")}>{metadata.titulo}</h1>
            <BotaoLerArtigo className="mt-1" />
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed">{metadata.descricao}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge
              variant="outline"
              className={cn("font-medium", CORES_NIVEL[metadata.nivelDificuldade])}
            >
              <GraduationCap className={cn("mr-1.5", icone.micro)} aria-hidden="true" />
              {ROTULOS_NIVEL[metadata.nivelDificuldade]}
            </Badge>

            <Badge variant="secondary">
              <Clock className={cn("mr-1.5", icone.micro)} aria-hidden="true" />
              {metadata.tempoLeituraMinutos} min de leitura
            </Badge>

            <Badge variant="secondary">
              <Calendar className={cn("mr-1.5", icone.micro)} aria-hidden="true" />
              {formatarData(metadata.atualizadoEm ?? metadata.publicadoEm)}
            </Badge>
          </div>

          <hr className="border-border mt-6" />
        </header>

        {/* Conteúdo do Artigo */}
        <div className="prose prose-sm max-w-none">{children}</div>

        {/* Tags */}
        {metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-8">
            <span className="text-muted-foreground text-sm font-medium">Tags:</span>
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <hr className="border-border my-8" />

        {/* Navegação Anterior/Próximo */}
        {(artigoAnterior || proximoArtigo) && (
          <nav className="grid gap-4 md:grid-cols-2" aria-label="Navegação entre artigos">
            {/* Artigo Anterior */}
            {artigoAnterior ? (
              <Link href={`/aprender/${artigoAnterior.categoria}/${artigoAnterior.slug}`}>
                <Card className="hover:border-primary/30 h-full transition-colors">
                  <CardContent className="flex items-center gap-3 p-4">
                    <ChevronLeft
                      className={cn(icone.tituloCard, "text-muted-foreground shrink-0")}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className={cn(tipografia.auxiliar, "tracking-wide uppercase")}>Anterior</p>
                      <p className="hover:text-primary mt-1 truncate text-sm font-semibold transition-colors">
                        {artigoAnterior.titulo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div /> // Espaço vazio para manter grid alinhado
            )}

            {/* Próximo Artigo */}
            {proximoArtigo && (
              <Link href={`/aprender/${proximoArtigo.categoria}/${proximoArtigo.slug}`}>
                <Card className="hover:border-primary/30 h-full transition-colors">
                  <CardContent className="flex items-center justify-end gap-3 p-4">
                    <div className="min-w-0 text-right">
                      <p className={cn(tipografia.auxiliar, "tracking-wide uppercase")}>Próximo</p>
                      <p className="hover:text-primary mt-1 truncate text-sm font-semibold transition-colors">
                        {proximoArtigo.titulo}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(icone.tituloCard, "text-muted-foreground shrink-0")}
                      aria-hidden="true"
                    />
                  </CardContent>
                </Card>
              </Link>
            )}
          </nav>
        )}

        {/* Botão Voltar para Categoria */}
        <div className="flex justify-center pt-8">
          <Link href={`/aprender/${metadata.categoria}`}>
            <Button variant="outline">
              <ChevronLeft className={cn("mr-2", icone.botao)} aria-hidden="true" />
              Voltar para {categoriaInfo?.titulo}
            </Button>
          </Link>
        </div>
      </article>
    </>
  );
}
