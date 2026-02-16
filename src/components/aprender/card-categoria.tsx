import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardCategoriaProps {
  readonly slug: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly Icone: LucideIcon;
  readonly quantidadeArtigos: number;
  readonly className?: string;
}

export function CardCategoria({
  slug,
  titulo,
  descricao,
  Icone,
  quantidadeArtigos,
  className,
}: CardCategoriaProps) {
  return (
    <Link href={`/aprender/${slug}`} className="group">
      <Card
        className={cn(
          "h-full transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-lg",
          "border-border hover:border-primary/30",
          className,
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <Icone
              className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-colors"
              aria-hidden="true"
            />
            <Badge variant="secondary" className="text-xs">
              {quantidadeArtigos} {quantidadeArtigos === 1 ? "artigo" : "artigos"}
            </Badge>
          </div>
          <CardTitle className="group-hover:text-primary mt-4 transition-colors">
            {titulo}
          </CardTitle>
          <CardDescription className="leading-relaxed">{descricao}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-primary text-sm font-medium group-hover:underline">
            Explorar artigos →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
