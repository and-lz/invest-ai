import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { HeaderNavigation } from "@/components/layout/header-navigation";
import { AuthProvider } from "@/contexts/auth-provider";
import { ChatPageProvider } from "@/contexts/chat-page-context";
import { LazyChatWidget } from "@/components/chat/lazy-chat-widget";
import { ProvedorSwr } from "@/components/providers/swr-provider";
import { PwaRegistration } from "@/components/providers/pwa-registration";
import { isAiEnabled } from "@/lib/ai-features";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
  const aiEnabled = isAiEnabled();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ProvedorSwr>
              <ChatPageProvider>
                <div className="flex h-screen flex-col">
                  <HeaderNavigation />
                  <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
                {aiEnabled && <LazyChatWidget />}
                <Toaster />
              </ChatPageProvider>
            </ProvedorSwr>
            <PwaRegistration />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
