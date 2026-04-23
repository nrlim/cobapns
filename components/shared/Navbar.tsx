import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <img src="/logo.png" alt="COBA PNS Logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-sans tracking-tight text-sm font-medium">
          <Link
            className="font-bold border-b-2 pb-1 transition-colors"
            style={{ color: "#1E73BE", borderColor: "#1E73BE" }}
            href="/#tentang"
          >
            Tentang Kami
          </Link>
          <Link
            className="text-slate-600 transition-colors hover:[color:#1E73BE]"
            href="/#program"
          >
            Fitur Unggulan
          </Link>
          <Link
            className="text-slate-600 transition-colors hover:[color:#1E73BE]"
            href="/#harga"
          >
            Paket Belajar
          </Link>
          <Link
            className="text-slate-600 transition-colors hover:[color:#1E73BE]"
            href="/#kontak"
          >
            Hubungi Kami
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="primary-gradient px-6 py-2.5 rounded-lg font-bold text-sm text-white scale-95 hover:scale-100 active:scale-90 transition-transform shadow-lg"
          >
            Try Out Gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
