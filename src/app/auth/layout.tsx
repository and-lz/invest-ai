import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Investimentos",
  description: "Acesse sua conta para visualizar seus investimentos",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-background fixed inset-0 z-50">{children}</div>;
}
