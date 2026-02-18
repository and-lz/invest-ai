import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";

// ============================================================
// Componentes reutilizáveis para estruturar artigos educacionais.
// Garantem consistência visual e tipográfica em todos os artigos.
// ============================================================

// ---- Seção de Artigo ----

interface SecaoArtigoProps {
  readonly titulo: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function SecaoArtigo({ titulo, children, className }: SecaoArtigoProps) {
  return (
    <section className={cn("mb-12", className)}>
      <h2 className={cn(typography.h2, "mb-4")}>{titulo}</h2>
      <div className="space-y-4 text-base leading-relaxed">{children}</div>
    </section>
  );
}

// ---- Parágrafo ----

interface ParagrafoProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Paragrafo({ children, className }: ParagrafoProps) {
  return <p className={cn("text-muted-foreground", className)}>{children}</p>;
}

// ---- Lista com Bullet Points ----

interface ListaProps {
  readonly items: readonly string[];
  readonly className?: string;
}

export function Lista({ items, className }: ListaProps) {
  return (
    <ul className={cn("list-disc space-y-2 pl-6", className)}>
      {items.map((item, index) => (
        <li key={index} className="text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

// ---- Lista Ordenada ----

interface ListaOrdenadaProps {
  readonly items: readonly string[];
  readonly className?: string;
}

export function ListaOrdenada({ items, className }: ListaOrdenadaProps) {
  return (
    <ol className={cn("list-decimal space-y-2 pl-6", className)}>
      {items.map((item, index) => (
        <li key={index} className="text-muted-foreground">
          {item}
        </li>
      ))}
    </ol>
  );
}

// ---- Destaque / Callout ----

interface DestaqueProps {
  readonly children: React.ReactNode;
  readonly tipo?: "info" | "warning" | "success" | "atencao";
  readonly className?: string;
}

export function Destaque({ children, tipo = "info", className }: DestaqueProps) {
  const cores = {
    info: "border-l-primary bg-primary/5",
    warning: "border-l-warning bg-warning/5",
    success: "border-l-success bg-success/5",
    atencao: "border-l-destructive bg-destructive/5",
  };

  return (
    <div className={cn("rounded-lg border-l-4 px-5 py-4", cores[tipo], className)}>{children}</div>
  );
}

// ---- Citação em Bloco ----

interface CitacaoProps {
  readonly children: React.ReactNode;
  readonly autor?: string;
  readonly className?: string;
}

export function Citacao({ children, autor, className }: CitacaoProps) {
  return (
    <blockquote
      className={cn("border-l-muted-foreground/30 border-l-4 py-2 pl-5 italic", className)}
    >
      <p className="text-muted-foreground">{children}</p>
      {autor && (
        <footer className="text-muted-foreground/70 mt-2 text-sm not-italic">— {autor}</footer>
      )}
    </blockquote>
  );
}

// ---- Código Inline ----

interface CodigoProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Codigo({ children, className }: CodigoProps) {
  return (
    <code className={cn("bg-secondary rounded px-1.5 py-0.5 font-mono text-sm", className)}>
      {children}
    </code>
  );
}

// ---- Link Externo ----

interface LinkExternoProps {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function LinkExterno({ href, children, className }: LinkExternoProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-primary hover:underline", className)}
    >
      {children}
    </a>
  );
}

// ---- Divisor de Seção ----

interface DivisorProps {
  readonly className?: string;
}

export function Divisor({ className }: DivisorProps) {
  return <hr className={cn("border-border my-8", className)} />;
}

// ---- Tabela Simples ----

interface TabelaSimplesProps {
  readonly cabecalhos: readonly string[];
  readonly linhas: readonly (readonly string[])[];
  readonly className?: string;
}

export function TabelaSimples({ cabecalhos, linhas, className }: TabelaSimplesProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-border border-b">
            {cabecalhos.map((cabecalho, index) => (
              <th key={index} className="px-4 py-3 text-left text-sm font-medium">
                {cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, indice) => (
            <tr key={indice} className="border-border border-b">
              {linha.map((celula, indiceCelula) => (
                <td key={indiceCelula} className="text-muted-foreground px-4 py-3 text-sm">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
