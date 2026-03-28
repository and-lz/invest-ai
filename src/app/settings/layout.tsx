import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações | Fortuna",
  description: "Gerencie suas configurações de IA",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
