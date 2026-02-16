import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Lora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { HeaderNavigation } from "@/components/layout/header-navigation";
import { AuthProvider } from "@/contexts/auth-provider";
import { ProvedorContextoPaginaChat } from "@/contexts/contexto-pagina-chat";
import { ChatWidget } from "@/components/chat/chat-widget";
import { ProvedorSwr } from "@/components/providers/provedor-swr";
import { PwaRegistration } from "@/components/providers/pwa-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c14" },
  ],
};

export const metadata: Metadata = {
  title: "Investimentos Dashboard",
  description: "Dashboard pessoal de investimentos - Inter Prime",
  applicationName: "Investimentos",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Investimentos",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ProvedorSwr>
              <ProvedorContextoPaginaChat>
                <div className="flex h-screen flex-col">
                  <HeaderNavigation />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
                <ChatWidget />
                <Toaster />
              </ProvedorContextoPaginaChat>
            </ProvedorSwr>
            <PwaRegistration />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
