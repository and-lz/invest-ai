import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SidebarNavigation } from "@/components/layout/sidebar-navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Investimentos Dashboard",
  description: "Dashboard pessoal de investimentos - Inter Prime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <SidebarNavigation />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
