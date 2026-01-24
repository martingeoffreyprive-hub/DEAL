import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "QuoteVoice - Devis par transcription vocale",
  description: "Générez automatiquement des devis professionnels à partir de vos transcriptions vocales grâce à l'IA",
  keywords: ["devis", "transcription", "IA", "automatisation", "PDF"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} ${inter.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
