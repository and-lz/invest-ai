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
  readonly fullscreen?: boolean;
}

export function CelulaCabecalhoMarkdown({ children, fullscreen }: CelulaCabecalhoMarkdownProps) {
  return <TableHead className={fullscreen ? "text-sm" : "text-xs"}>{children}</TableHead>;
}

interface CelulaMarkdownProps {
  readonly children?: ReactNode;
  readonly fullscreen?: boolean;
}

export function CelulaMarkdown({ children, fullscreen }: CelulaMarkdownProps) {
  return <TableCell className={fullscreen ? "text-sm" : "text-xs"}>{children}</TableCell>;
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
    <code className={cn("bg-muted text-foreground rounded px-1 py-0.5 font-mono", fullscreen ? "text-sm" : "text-xs")}>
      {children}
    </code>
  );
}
