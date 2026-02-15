import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

interface CardArtigoProps {
  readonly artigo: Pick<
    ArtigoMetadata,
    "slug" | "titulo" | "descricao" | "categoria" | "tempoLeituraMinutos" | "nivelDificuldade" | "tags"
  >;
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

export function CardArtigo({ artigo, className }: CardArtigoProps) {
  return (
    <Link href={`/aprender/${artigo.categoria}/${artigo.slug}`} className="group">
      <Card
        className={cn(
          "h-full transition-all duration-200",
          "hover:shadow-md hover:border-primary/30",
          className,
        )}
      >
        <CardHeader>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-xs font-medium", CORES_NIVEL[artigo.nivelDificuldade])}>
              <GraduationCap className="mr-1 h-3 w-3" aria-hidden="true" />
              {ROTULOS_NIVEL[artigo.nivelDificuldade]}
            </Badge>

            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
              {artigo.tempoLeituraMinutos} min
            </Badge>
          </div>

          <CardTitle className="group-hover:text-primary line-clamp-2 transition-colors">
            {artigo.titulo}
          </CardTitle>

          <CardDescription className="line-clamp-3 leading-relaxed">{artigo.descricao}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {artigo.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
