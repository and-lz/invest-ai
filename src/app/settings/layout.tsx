import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Investimentos",
  description: "Manage your account settings and API keys",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
