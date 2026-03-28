import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fortuna Chat | Fortuna",
  description: "Converse com a Fortuna sobre seus investimentos",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <div className="chat-fullbleed flex min-h-0 flex-1">{children}</div>;
}
