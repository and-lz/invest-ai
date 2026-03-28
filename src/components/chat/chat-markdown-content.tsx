"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import { schemaSegurancaMarkdown } from "@/lib/markdown-config";
import {
  TabelaMarkdown,
  CabecalhoTabelaMarkdown,
  LinhaMarkdown,
  CelulaCabecalhoMarkdown,
  CelulaMarkdown,
  LinkMarkdown,
  SeparadorMarkdown,
  CodigoInlineMarkdown,
} from "@/components/chat/chat-markdown-components";
import { BlocoCodigoChat } from "@/components/chat/chat-code-block";
import { cn } from "@/lib/utils";

interface ConteudoMarkdownChatProps {
  readonly conteudo: string;
  readonly ehUsuario: boolean;
  readonly fullscreen?: boolean;
}

export const ConteudoMarkdownChat = React.memo(
  ({ conteudo, fullscreen }: ConteudoMarkdownChatProps) => {
    const fs = fullscreen;
    return (
      <div className={cn("markdown-content prose max-w-none", fs ? "prose-lg" : "prose-sm")}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schemaSegurancaMarkdown]]}
          components={{
            // Tables
            table: TabelaMarkdown,
            thead: CabecalhoTabelaMarkdown,
            tr: LinhaMarkdown,
            th: (props) => <CelulaCabecalhoMarkdown {...props} fullscreen={fs} />,
            td: (props) => <CelulaMarkdown {...props} fullscreen={fs} />,
            // Links
            a: LinkMarkdown,
            // Horizontal rule
            hr: SeparadorMarkdown,
            // Code
            code: (props) => {
              const { children, className, ...rest } = props;
              const inline = !className?.includes("language-");
              return inline ? (
                <CodigoInlineMarkdown fullscreen={fs} {...rest}>{children}</CodigoInlineMarkdown>
              ) : (
                <BlocoCodigoChat className={className} {...rest}>
                  {children}
                </BlocoCodigoChat>
              );
            },
            // Lists
            ul: ({ children }) => (
              <ul className="my-2 list-inside list-disc space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2 list-inside list-decimal space-y-1">{children}</ol>
            ),
            // Paragraphs
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            // Emphasis
            strong: ({ children }) => (
              <strong className="text-foreground font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            // Headings
            h1: ({ children }) => <h1 className={cn("mt-4 mb-2 font-semibold", fs ? "text-3xl" : "text-lg")}>{children}</h1>,
            h2: ({ children }) => <h2 className={cn("mt-3 mb-2 font-semibold", fs ? "text-2xl" : "text-base")}>{children}</h2>,
            h3: ({ children }) => <h3 className={cn("mt-3 mb-1 font-semibold", fs ? "text-xl" : "text-sm")}>{children}</h3>,
          }}
        >
          {conteudo}
        </ReactMarkdown>
      </div>
    );
  },
  (propsAntigas, propsNovas) =>
    propsAntigas.conteudo === propsNovas.conteudo &&
    propsAntigas.ehUsuario === propsNovas.ehUsuario &&
    propsAntigas.fullscreen === propsNovas.fullscreen,
);

ConteudoMarkdownChat.displayName = "ConteudoMarkdownChat";
