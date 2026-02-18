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
} from "@/components/chat/componentes-markdown-chat";
import { BlocoCodigoChat } from "@/components/chat/bloco-codigo-chat";

interface ConteudoMarkdownChatProps {
  readonly conteudo: string;
  readonly ehUsuario: boolean;
}

export const ConteudoMarkdownChat = React.memo(
  ({ conteudo }: ConteudoMarkdownChatProps) => {
    return (
      <div className="markdown-content prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schemaSegurancaMarkdown]]}
          components={{
            // Tables
            table: TabelaMarkdown,
            thead: CabecalhoTabelaMarkdown,
            tr: LinhaMarkdown,
            th: CelulaCabecalhoMarkdown,
            td: CelulaMarkdown,
            // Links
            a: LinkMarkdown,
            // Horizontal rule
            hr: SeparadorMarkdown,
            // Code
            code: (props) => {
              const { children, className, ...rest } = props;
              const inline = !className?.includes("language-");
              return inline ? (
                <CodigoInlineMarkdown {...rest}>{children}</CodigoInlineMarkdown>
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
            // Headings (caso AI retorne)
            h1: ({ children }) => <h1 className="mt-4 mb-2 text-lg font-semibold">{children}</h1>,
            h2: ({ children }) => <h2 className="mt-3 mb-2 text-base font-semibold">{children}</h2>,
            h3: ({ children }) => <h3 className="mt-3 mb-1 text-sm font-semibold">{children}</h3>,
          }}
        >
          {conteudo}
        </ReactMarkdown>
      </div>
    );
  },
  (propsAntigas, propsNovas) =>
    propsAntigas.conteudo === propsNovas.conteudo &&
    propsAntigas.ehUsuario === propsNovas.ehUsuario,
);

ConteudoMarkdownChat.displayName = "ConteudoMarkdownChat";
