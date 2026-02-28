"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () =>
    import("@/components/chat/chat-widget").then((m) => ({
      default: m.ChatWidget,
    })),
  { ssr: false },
);

export function LazyChatWidget() {
  return <ChatWidget />;
}
