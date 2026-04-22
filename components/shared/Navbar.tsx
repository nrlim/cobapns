import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-2xl font-black text-teal-700 dark:text-teal-500 tracking-tighter">COBA PNS</Link>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-sans tracking-tight text-sm font-medium">
          <Link className="text-teal-700 dark:text-teal-400 font-bold border-b-2 border-teal-700 dark:border-teal-400 pb-1" href="/#tentang">Tentang Kami</Link>
          <Link className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors" href="/#program">Fitur Unggulan</Link>
          <Link className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors" href="/#harga">Paket Belajar</Link>
          <Link className="text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors" href="/#kontak">Hubungi Kami</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-all">Masuk</Link>
          <Link href="/register" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm scale-95 hover:scale-100 active:scale-90 transition-transform shadow-lg shadow-primary/20">Try Out Gratis</Link>
        </div>
      </div>
    </nav>
  );
}
