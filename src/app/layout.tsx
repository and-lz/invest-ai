import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Orbitron, Rajdhani } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { HeaderNavigation } from "@/components/layout/header-navigation";
import { CyberpunkPaletteProvider } from "@/contexts/cyberpunk-palette-context";
import { CircuitBoardBackground } from "@/components/layout/circuit-board-background";
import { FloatingParticles } from "@/components/layout/floating-particles";
import { ScanLinesOverlay } from "@/components/layout/scan-lines-overlay";
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

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${orbitron.variable} ${rajdhani.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CyberpunkPaletteProvider>
            <CircuitBoardBackground />
            <FloatingParticles />
            <div className="flex h-screen flex-col">
              <HeaderNavigation />
              <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
            <ScanLinesOverlay />
          </CyberpunkPaletteProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
