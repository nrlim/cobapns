import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cobapns.com"),
  title: {
    default: "COBA PNS — Platform Try Out CAT CPNS #1 dengan AI",
    template: "%s | COBA PNS",
  },
  description:
    "Persiapan CPNS 2024/2025 terpintar di Indonesia. Latihan Try Out CAT berbasis AI, ranking nasional, analitik mendalam, dan materi terupdate untuk memastikan kamu lolos CPNS.",
  keywords: [
    "CPNS 2024",
    "Try Out CPNS",
    "Bimbel CPNS Online",
    "Soal CPNS 2024",
    "CAT CPNS",
    "Latihan Soal CPNS",
    "Ranking Nasional CPNS",
    "COBA PNS",
  ],
  authors: [{ name: "COBA PNS" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "COBA PNS",
  },
  openGraph: {
    title: "COBA PNS — Coba Sekarang, Lolos Kemudian",
    description: "Platform Try Out CAT CPNS terpintar dengan AI Diagnostic, Ranking Nasional, dan Pembahasan Lengkap.",
    url: "https://cobapns.com",
    siteName: "COBA PNS",
    images: [
      {
        url: "/thumbnail-sosmed.jpeg",
        width: 1200,
        height: 630,
        alt: "COBA PNS — Coba Sekarang, Lolos Kemudian",
      },
    ],
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "COBA PNS — Platform Try Out CAT CPNS #1 dengan AI",
    description: "Latihan Try Out CPNS dengan sistem CAT asli, ranking nasional, dan bantuan AI Diagnostic.",
    images: ["/thumbnail-sosmed.jpeg"],
    creator: "@cobapns",
  },
  icons: {
    icon: "/icon-cpns.png",
    apple: "/icon-cpns.png",
  },
  alternates: {
    canonical: "https://cobapns.com",
  },
};

import NextTopLoader from "nextjs-toploader";
import { ConsoleEasterEgg } from "@/components/shared/ConsoleEasterEgg";
import { ServiceWorkerRegistrar } from "@/components/shared/ServiceWorkerRegistrar";
import { GlobalInstallPrompt } from "@/components/shared/GlobalInstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        {/* PWA theme color for browser chrome */}
        <meta name="theme-color" content="#1E73BE" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Proper mobile viewport — prevents unwanted zoom on form focus */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Structured Data / JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "COBA PNS",
              "url": "https://cobapns.com",
              "logo": "https://cobapns.com/logo-landing.png",
              "sameAs": [
                "https://www.instagram.com/cobapns",
                "https://www.tiktok.com/@cobapns"
              ],
              "description": "Platform persiapan CPNS terpintar di Indonesia dengan AI Diagnostic dan Ranking Nasional."
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "COBA PNS",
              "url": "https://cobapns.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://cobapns.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="antialiased bg-[#f8f9ff] font-sans">
        <ConsoleEasterEgg />
        {/* Register service worker (production only, no-op in dev) */}
        <ServiceWorkerRegistrar />
        {/* Floating PWA install prompt — shown globally across all pages */}
        <GlobalInstallPrompt />
        <NextTopLoader
          color="#1E73BE"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1E73BE,0 0 5px #1E73BE"
        />
        {children}
      </body>
    </html>
  );
}
