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
  CorpoTabelaMarkdown,
  LinhaMarkdown,
  CelulaCabecalhoMarkdown,
  CelulaMarkdown,
  LinkMarkdown,
  SeparadorMarkdown,
  CodigoInlineMarkdown,
  BlockquoteMarkdown,
  ListItemMarkdown,
} from "@/components/chat/chat-markdown-components";
import { BlocoCodigoChat } from "@/components/chat/chat-code-block";
import { cn } from "@/lib/utils";

interface ConteudoMarkdownChatProps {
  readonly conteudo: string;
  readonly fullscreen?: boolean;
}

export const ConteudoMarkdownChat = React.memo(
  ({ conteudo, fullscreen }: ConteudoMarkdownChatProps) => {
    const fs = fullscreen;
    return (
      <div className={cn("markdown-content max-w-none")}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schemaSegurancaMarkdown]]}
          components={{
            // Tables
            table: TabelaMarkdown,
            thead: CabecalhoTabelaMarkdown,
            tbody: CorpoTabelaMarkdown,
            tr: LinhaMarkdown,
            th: (props) => <CelulaCabecalhoMarkdown {...props} fullscreen={fs} />,
            td: (props) => <CelulaMarkdown {...props} fullscreen={fs} />,
            // Links
            a: LinkMarkdown,
            // Horizontal rule
            hr: SeparadorMarkdown,
            // Blockquote
            blockquote: BlockquoteMarkdown,
            // List items
            li: ListItemMarkdown,
            // Code
            code: (props) => {
              const { children, className, ...rest } = props;
              const inline = !className?.includes("language-");
              const codeText = typeof children === "string" ? children : String(children ?? "");
              return inline ? (
                <CodigoInlineMarkdown fullscreen={fs} {...rest}>{children}</CodigoInlineMarkdown>
              ) : (
                <BlocoCodigoChat className={className} fullscreen={fs} {...rest}>
                  {codeText}
                </BlocoCodigoChat>
              );
            },
          }}
        >
          {conteudo}
        </ReactMarkdown>
      </div>
    );
  },
  (propsAntigas, propsNovas) =>
    propsAntigas.conteudo === propsNovas.conteudo &&
    propsAntigas.fullscreen === propsNovas.fullscreen,
);

ConteudoMarkdownChat.displayName = "ConteudoMarkdownChat";
