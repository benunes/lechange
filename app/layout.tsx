import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "LéChange - Échange, Partage, Connecte-toi !",
    template: "%s | LéChange",
  },
  description:
    "Découvre LéChange, la plateforme d'échange nouvelle génération pour les jeunes. Vends, achète, pose tes questions et partage tes connaissances avec une communauté dynamique !",
  keywords: [
    "échange",
    "vente",
    "achat",
    "forum",
    "communauté",
    "jeunes",
    "questions",
    "réponses",
    "annonces",
  ],
  authors: [{ name: "LéChange Team" }],
  creator: "LéChange",
  publisher: "LéChange",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://lechange.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LéChange - Échange, Partage, Connecte-toi !",
    description:
      "La plateforme d'échange nouvelle génération pour les jeunes. Rejoins une communauté dynamique !",
    url: "https://lechange.app",
    siteName: "LéChange",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LéChange - Plateforme d'échange pour jeunes",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LéChange - Échange, Partage, Connecte-toi !",
    description:
      "La plateforme d'échange nouvelle génération pour les jeunes. Rejoins une communauté dynamique !",
    images: ["/og-image.png"],
    creator: "@lechange_app",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            <Header />
            <main className="w-full mt-3 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {children}
            </main>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
