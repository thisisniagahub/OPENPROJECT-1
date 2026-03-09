import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
