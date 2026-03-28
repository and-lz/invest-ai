import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proxy Monitor | Fortuna",
  description: "Claude proxy health and request monitoring dashboard",
};

export default function ProxyMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
