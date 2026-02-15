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

interface TabelaMarkdownProps {
  readonly children?: ReactNode;
}

export function TabelaMarkdown({ children }: TabelaMarkdownProps) {
  return (
    <div className="my-2 overflow-x-auto rounded-lg border">
      <Table>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
}

interface CabecalhoTabelaMarkdownProps {
  readonly children?: ReactNode;
}

export function CabecalhoTabelaMarkdown({ children }: CabecalhoTabelaMarkdownProps) {
  return <TableHeader>{children}</TableHeader>;
}

interface LinhaMarkdownProps {
  readonly children?: ReactNode;
}

export function LinhaMarkdown({ children }: LinhaMarkdownProps) {
  return <TableRow>{children}</TableRow>;
}

interface CelulaCabecalhoMarkdownProps {
  readonly children?: ReactNode;
}

export function CelulaCabecalhoMarkdown({ children }: CelulaCabecalhoMarkdownProps) {
  return <TableHead className="text-xs">{children}</TableHead>;
}

interface CelulaMarkdownProps {
  readonly children?: ReactNode;
}

export function CelulaMarkdown({ children }: CelulaMarkdownProps) {
  return <TableCell className="text-xs">{children}</TableCell>;
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
}

export function CodigoInlineMarkdown({ children }: CodigoInlineMarkdownProps) {
  return (
    <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono text-foreground">
      {children}
    </code>
  );
}
