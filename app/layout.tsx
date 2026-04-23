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
  title: {
    default: "COBA PNS — Coba Sekarang, Lolos Kemudian",
    template: "%s | COBA PNS",
  },
  description:
    "Platform persiapan CPNS terpintar di Indonesia. Latihan Try Out berbasis AI, ranking nasional, dan analitik mendalam untuk memastikan kamu lolos CPNS.",
  keywords: ["CPNS", "Try Out CAT", "persiapan CPNS", "soal CPNS", "ranking nasional CPNS"],
  authors: [{ name: "COBA PNS" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "COBA PNS",
  },
  openGraph: {
    title: "COBA PNS — Coba Sekarang, Lolos Kemudian",
    description: "Platform CAT CPNS terpintar di Indonesia dengan AI Diagnostic dan Ranking Nasional.",
    type: "website",
    locale: "id_ID",
  },
  icons: {
    icon: "/icon-cpns.png",
    apple: "/icon-cpns.png",
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
      </head>
      <body className="antialiased bg-[#f8f9ff] font-sans">
        <ConsoleEasterEgg />
        {/* Register service worker (production only, no-op in dev) */}
        <ServiceWorkerRegistrar />
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
        {/* Floating PWA install prompt — shown globally across all pages */}
        <GlobalInstallPrompt />
      </body>
    </html>
  );
}
