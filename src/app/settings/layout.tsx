import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações | Investimentos",
  description: "Gerencie suas configurações e chaves de API",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
