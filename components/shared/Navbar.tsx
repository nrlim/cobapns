"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Keunggulan", href: "/#kenapa-kami" },
  { label: "Fitur Utama", href: "/#fitur-unggulan" },
  { label: "Artikel", href: "/artikel" },
  { label: "Testimoni", href: "/#testimoni" },
  { label: "Tentang Kami", href: "/#tentang" },
  { label: "Paket Belajar", href: "/#harga" },
  { label: "Kontak", href: "/#kontak" },
];

export function Navbar() {

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 select-none flex-shrink-0">
            <Image
              src="/logo-landing.png"
              alt="COBA PNS Logo"
              width={160}
              height={44}
              className="h-8 sm:h-10 md:h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-sans tracking-tight text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                className="text-slate-600 transition-colors hover:text-[#1E73BE] font-semibold"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="primary-gradient px-5 py-2.5 rounded-lg font-bold text-sm text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Try Out Gratis
            </Link>
          </div>

          {/* Mobile: CTA Only (Menu is now in bottom bar) */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="primary-gradient px-4 py-2 rounded-lg font-bold text-xs text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
