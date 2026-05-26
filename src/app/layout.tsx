import type { Metadata } from "next";
import { DM_Serif_Display, Sora } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { Shell } from "@/components/layout/Shell";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Lumenos - Estudos Inteligentes",
  description:
    "Plataforma pessoal de estudos focada em produtividade, revisao ativa e filosofia viva.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${dmSerif.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Shell>{children}</Shell>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
