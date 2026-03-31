"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TabelaMarkdownProps {
  readonly children?: ReactNode;
}

export function TabelaMarkdown({ children }: TabelaMarkdownProps) {
  return (
    <div className="my-2 overflow-x-auto rounded-lg border border-border/50">
      <Table>{children}</Table>
    </div>
  );
}

interface CorpoTabelaMarkdownProps {
  readonly children?: ReactNode;
}

export function CorpoTabelaMarkdown({ children }: CorpoTabelaMarkdownProps) {
  return <TableBody>{children}</TableBody>;
}

interface CabecalhoTabelaMarkdownProps {
  readonly children?: ReactNode;
}

export function CabecalhoTabelaMarkdown({ children }: CabecalhoTabelaMarkdownProps) {
  return <TableHeader className="bg-muted/30">{children}</TableHeader>;
}

interface LinhaMarkdownProps {
  readonly children?: ReactNode;
}

export function LinhaMarkdown({ children }: LinhaMarkdownProps) {
  return <TableRow>{children}</TableRow>;
}

interface CelulaCabecalhoMarkdownProps {
  readonly children?: ReactNode;
  readonly fullscreen?: boolean;
}

export function CelulaCabecalhoMarkdown({ children, fullscreen }: CelulaCabecalhoMarkdownProps) {
  return (
    <TableHead className={fullscreen ? "text-base" : "text-[13px]"}>{children}</TableHead>
  );
}

interface CelulaMarkdownProps {
  readonly children?: ReactNode;
  readonly fullscreen?: boolean;
}

export function CelulaMarkdown({ children, fullscreen }: CelulaMarkdownProps) {
  return (
    <TableCell className={fullscreen ? "text-base" : "text-[13px]"}>{children}</TableCell>
  );
}

interface LinkMarkdownProps {
  readonly href?: string;
  readonly children?: ReactNode;
}

export function LinkMarkdown({ href, children }: LinkMarkdownProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export function SeparadorMarkdown() {
  return <Separator className="my-3" />;
}

interface CodigoInlineMarkdownProps {
  readonly children?: ReactNode;
  readonly fullscreen?: boolean;
}

export function CodigoInlineMarkdown({ children, fullscreen }: CodigoInlineMarkdownProps) {
  return (
    <code
      className={cn(
        "bg-muted/70 text-foreground border border-border/50 rounded-md px-1.5 py-0.5 font-mono",
        fullscreen ? "text-base" : "text-[0.85em]",
      )}
    >
      {children}
    </code>
  );
}

interface BlockquoteMarkdownProps {
  readonly children?: ReactNode;
}

export function BlockquoteMarkdown({ children }: BlockquoteMarkdownProps) {
  return (
    <blockquote className="border-l-4 border-primary/40 bg-muted/30 rounded-r-lg pl-4 pr-3 py-2.5 my-3 text-muted-foreground not-italic [&>p]:mb-1.5 [&>p:last-child]:mb-0">
      {children}
    </blockquote>
  );
}

interface ListItemMarkdownProps {
  readonly children?: ReactNode;
}

export function ListItemMarkdown({ children }: ListItemMarkdownProps) {
  return <li className="leading-relaxed">{children}</li>;
}
