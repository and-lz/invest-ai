import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fortuna Chat | Fortuna",
  description: "Converse com a Fortuna sobre seus investimentos",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
