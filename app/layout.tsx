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

import NextTopLoader from 'nextjs-toploader';
import { ConsoleEasterEgg } from "@/components/shared/ConsoleEasterEgg";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="antialiased bg-[#f8f9ff] font-sans">
        <ConsoleEasterEgg />
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
