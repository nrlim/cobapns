import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-slate-900 items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden border border-slate-100">
        
        {/* Aesthetic Background flare */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500 rounded-full blur-3xl opacity-10"></div>

        <div className="relative z-10 w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-slate-100">
          <SearchX className="w-10 h-10 text-slate-400" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-700 mb-4">Halaman Tidak Ditemukan</h2>
        
        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau sementara tidak tersedia.
        </p>

        <Link 
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-tr from-teal-700 to-teal-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-[13px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
