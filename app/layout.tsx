import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catalyx AI — From Vague Ideas to Production-Ready Prompts",
  description:
    "Catalyx AI transforms vague ideas into structured, production-ready prompts for Cursor, Bolt, Lovable, Claude Code, Gemini CLI, ChatGPT, and other AI coding assistants.",
  keywords: [
    "AI prompt optimizer",
    "prompt engineering",
    "Cursor",
    "Claude",
    "ChatGPT",
    "coding assistant",
    "prompt generator",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-dvh flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-paper-3)",
              border: "1px solid var(--color-border)",
              color: "var(--color-ink)",
            },
          }}
        />
      </body>
    </html>
  );
}
