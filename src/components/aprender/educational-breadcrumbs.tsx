import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  readonly label: string;
  readonly href?: string;
}

interface BreadcrumbsEducacionalProps {
  readonly items: readonly Breadcrumb[];
  readonly className?: string;
}

export function BreadcrumbsEducacional({ items, className }: BreadcrumbsEducacionalProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const ehUltimo = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(ehUltimo ? "text-foreground font-medium" : "text-muted-foreground")}
              >
                {item.label}
              </span>
            )}

            {!ehUltimo && (
              <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
