import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "next-themes";
import { MoodProvider } from "@/components/layout/MoodProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Agent Town - AI Agent Workspace",
  description: "A pixel RPG where AI agents work together. Merged from Agent Town and Pixel Agents, powered by OpenClaw.",
  keywords: ["AI agents", "OpenClaw", "pixel art", "Phaser", "Next.js", "collaboration"],
  authors: [{ name: "Merged Project" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Agent Town - AI Agent Workspace",
    description: "A pixel RPG where AI agents work together",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${rajdhani.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MoodProvider>
            {children}
          </MoodProvider>
          <Toaster />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
