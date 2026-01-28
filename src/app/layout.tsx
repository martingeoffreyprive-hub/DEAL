import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LocaleProvider } from "@/contexts/locale-context";
import { CommandPalette } from "@/components/command-palette";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeVariantProvider } from "@/contexts/theme-context";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { DemoModeSwitcher } from "@/components/demo/DemoModeSwitcher";
import { BrandingProvider } from "@/contexts/branding-context";
import { ConstructionModeProvider } from "@/components/settings/construction-mode-toggle";
// import { WebVitals } from "@/components/performance/web-vitals"; // Disabled - requires web-vitals package

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252B4A" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "DEAL - Devis Intelligents pour Artisans Belges",
    template: "%s | DEAL",
  },
  description: "Plateforme de gestion et de génération de devis professionnels avec IA. Créez, gérez et envoyez vos devis en quelques clics. Conforme TVA belge et RGPD.",
  keywords: ["devis", "transcription", "IA", "automatisation", "PDF", "facturation", "entreprise", "artisan", "belgique", "TVA"],
  authors: [{ name: "DEAL" }],
  creator: "DEAL",
  publisher: "DEAL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dealofficialapp.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: "/",
    title: "DEAL - Devis Intelligents pour Artisans",
    description: "Plateforme de gestion et de génération de devis professionnels avec IA. Made in Belgium.",
    siteName: "DEAL",
    images: [
      {
        url: "/logos/og-image.svg",
        width: 1200,
        height: 630,
        alt: "DEAL - Digital Estimate Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DEAL - Devis Intelligents",
    description: "Plateforme de gestion et de génération de devis professionnels avec IA",
    images: ["/logos/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logos/deal-icon-d.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logos/deal-icon-d.svg" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DEAL",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch and Preconnect for faster resource loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
          </>
        )}
      </head>
      <body className={`${inter.className} ${inter.variable} min-h-screen-dvh overflow-x-hidden`}>
        {/* <WebVitals /> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeVariantProvider>
            <AccessibilityProvider>
              <ConstructionModeProvider>
                <DemoModeProvider>
                  <BrandingProvider>
                    <LocaleProvider>
                      {children}
                      <CommandPalette />
                      <DemoModeSwitcher />
                    </LocaleProvider>
                  </BrandingProvider>
                </DemoModeProvider>
              </ConstructionModeProvider>
            </AccessibilityProvider>
          </ThemeVariantProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
