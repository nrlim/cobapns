"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Tentang Kami", href: "/#tentang" },
  { label: "Fitur Unggulan", href: "/#program" },
  { label: "Paket Belajar", href: "/#harga" },
  { label: "Hubungi Kami", href: "/#kontak" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 select-none flex-shrink-0" onClick={() => setOpen(false)}>
            <img src="/logo-landing.png" alt="COBA PNS Logo" className="h-8 sm:h-10 md:h-11 w-auto object-contain" />
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

          {/* Mobile: CTA + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="primary-gradient px-4 py-2 rounded-lg font-bold text-xs text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Mulai Gratis
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } border-t border-slate-100 bg-white`}
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1E73BE] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Masuk ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
