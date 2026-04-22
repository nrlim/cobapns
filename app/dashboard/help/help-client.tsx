"use client"

import { useState, useMemo } from "react"
import {
  Search, MessageCircle, Mail, HelpCircle, ChevronDown,
  CheckCircle2, CreditCard, ShieldAlert, AlertCircle,
  X, Clock, ExternalLink
} from "lucide-react"

// ── Data ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    category: "Pembayaran & Berlangganan",
    icon: CreditCard,
    color: "teal",
    items: [
      {
        q: "Bagaimana cara konfirmasi pembayaran Midtrans?",
        a: "Pembayaran via Midtrans (QRIS, Virtual Account, E-Wallet) diverifikasi otomatis dalam < 5 menit. Tidak perlu konfirmasi manual. Jika status belum berubah setelah 10 menit, hubungi support kami.",
      },
      {
        q: "Berapa lama paket aktif setelah dibeli?",
        a: "Paket aktif seketika setelah pembayaran terverifikasi. Masa aktif 1 bulan dihitung sejak tanggal pembelian.",
      },
      {
        q: "Apakah bisa upgrade dari Elite ke Master?",
        a: "Bisa! Pergi ke halaman Pembelian, pilih paket Master. Kamu cukup membayar untuk paket baru tanpa kehilangan riwayat belajar.",
      },
      {
        q: "Apa saja metode pembayaran yang tersedia?",
        a: "Transfer Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, DANA, ShopeePay), QRIS, dan Kartu Kredit/Debit — semua melalui gateway Midtrans yang aman.",
      },
    ],
  },
  {
    category: "Akun & Keamanan",
    icon: ShieldAlert,
    color: "violet",
    items: [
      {
        q: "Bagaimana jika saya lupa password?",
        a: "Hubungi tim WhatsApp Support kami. Kami akan memverifikasi identitasmu melalui email terdaftar sebelum mereset password.",
      },
      {
        q: "Apakah saya bisa mengubah email terdaftar?",
        a: "Email bersifat permanen karena terikat ke riwayat pembelian. Untuk kendala darurat, email kami di support@cobapns.com.",
      },
      {
        q: "Bolehkah saya berbagi akun ke orang lain?",
        a: "Tidak diperbolehkan. Satu akun = satu pengguna sesuai Syarat & Ketentuan kami. Sistem akan otomatis mendeteksi dan membekukan akun yang terindikasi sharing.",
      },
    ],
  },
  {
    category: "Materi & Ujian Tryout",
    icon: CheckCircle2,
    color: "amber",
    items: [
      {
        q: "Kenapa skor tryout saya tidak muncul?",
        a: "Skor muncul otomatis saat waktu habis atau setelah kamu klik 'Selesai Ujian'. Pastikan koneksi internet stabil selama ujian berlangsung.",
      },
      {
        q: "Bagaimana cara menggunakan fitur Ragu-Ragu?",
        a: "Klik ikon 'Ragu-Ragu' saat mengerjakan soal. Soal tersebut ditandai warna kuning di navigasi sehingga mudah di-review sebelum mengakhiri ujian.",
      },
      {
        q: "Apakah tryout bisa dikerjakan berulang kali?",
        a: "Ya! Setiap paket memberikan akses tryout berulang. Kamu bisa melihat perkembangan skor dari waktu ke waktu di halaman Statistik.",
      },
    ],
  },
]

const COLOR_MAP: Record<string, string> = {
  teal:   "bg-teal-50 text-teal-700 border-teal-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
  amber:  "bg-amber-50 text-amber-700 border-amber-100",
}
const ICON_BG_MAP: Record<string, string> = {
  teal:   "bg-teal-50 text-teal-600",
  violet: "bg-violet-50 text-violet-600",
  amber:  "bg-amber-50 text-amber-600",
}

// ── FAQ Accordion Item ─────────────────────────────────────────────────────────

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-200
      ${isOpen ? "border-teal-200 shadow-sm shadow-teal-50" : "border-slate-200"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 p-4 sm:p-5 text-left hover:bg-slate-50/50 transition-colors group"
      >
        <span className={`text-sm font-bold transition-colors ${isOpen ? "text-teal-700" : "text-slate-800 group-hover:text-slate-900"}`}>
          {q}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-all duration-300
          ${isOpen ? "rotate-180 text-teal-600" : "text-slate-400 group-hover:text-slate-600"}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-sm font-medium text-slate-500 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/30">
          {a}
        </div>
      )}
    </div>
  )
}

// ── Main Client Component ──────────────────────────────────────────────────────

export function HelpCenterClient() {
  const [query, setQuery] = useState("")
  const [openKey, setOpenKey] = useState<string | null>(null)

  // Flat search across all FAQs
  const filteredFaqs = useMemo(() => {
    if (!query.trim()) return FAQS

    const q = query.toLowerCase()
    return FAQS.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.items.length > 0)
  }, [query])

  const totalResults = filteredFaqs.reduce((n, c) => n + c.items.length, 0)

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full pb-24">
      <div className="space-y-8">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 rounded-3xl p-8 sm:p-12 overflow-hidden text-center shadow-lg">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-teal-300 mb-3">Pusat Bantuan</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Apa yang bisa kami bantu?
              </h1>
              <p className="text-slate-400 font-medium mt-3 text-sm">
                Cari jawaban dari {FAQS.reduce((n, c) => n + c.items.length, 0)}+ topik yang sering ditanyakan.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari topik... (contoh: lupa password, bayar gagal)"
                className="w-full pl-12 pr-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:bg-white/15 transition-all font-medium text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {query && (
              <p className="text-xs text-slate-400 font-medium">
                {totalResults > 0 ? `${totalResults} hasil ditemukan untuk "${query}"` : `Tidak ada hasil untuk "${query}"`}
              </p>
            )}
          </div>
        </div>

        {/* ── Content Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

          {/* FAQ accordions */}
          <div className="lg:col-span-2 space-y-8">
            {filteredFaqs.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <p className="font-black text-slate-700 mb-1">Topik tidak ditemukan</p>
                <p className="text-sm text-slate-500 font-medium">
                  Coba kata kunci lain, atau hubungi kami langsung via WhatsApp.
                </p>
              </div>
            )}
            {filteredFaqs.map((cat, ci) => {
              const Icon = cat.icon
              return (
                <div key={ci} className="space-y-3">
                  {/* Category header */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${ICON_BG_MAP[cat.color]}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h2 className="text-base font-black text-slate-900">{cat.category}</h2>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black border ${COLOR_MAP[cat.color]}`}>
                      {cat.items.length} topik
                    </span>
                  </div>

                  {/* FAQ items */}
                  <div className="space-y-2">
                    {cat.items.map((item, ii) => {
                      const key = `${ci}-${ii}`
                      return (
                        <FaqItem
                          key={key}
                          q={item.q}
                          a={item.a}
                          isOpen={openKey === key}
                          onToggle={() => setOpenKey(openKey === key ? null : key)}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Support sidebar */}
          <div className="lg:col-span-1 space-y-4">

            {/* Contact card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10 sticky top-6">
              <h3 className="font-black text-lg mb-1">Butuh bantuan langsung?</h3>
              <p className="text-slate-400 text-sm font-medium mb-5 leading-relaxed">
                Tim support kami siap membantu dari <span className="text-slate-300 font-bold">09.00 – 21.00 WIB</span>.
              </p>

              <div className="space-y-3">
                <a
                  href="https://wa.me/628123456789?text=Halo%20COBA%20PNS%2C%20saya%20butuh%20bantuan..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-emerald-500/20 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="flex-1">Chat WhatsApp Admin</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href="mailto:support@cobapns.com?subject=Bantuan%20COBA%20PNS"
                  className="flex items-center gap-3 w-full p-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition-all font-bold text-sm group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="flex-1">support@cobapns.com</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>

            {/* Operating hours */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-amber-900">Di luar jam operasional</p>
                <p className="text-xs font-medium text-amber-800/80 mt-1 leading-relaxed">
                  Pesan tetap diterima 24 jam. Balasan manual akan dilanjutkan pagi hari berikutnya.
                </p>
              </div>
            </div>

            {/* Quick tips */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600" /> Tips Sebelum Menghubungi
              </h4>
              {[
                "Sertakan email terdaftar kamu",
                "Screenshot error / bukti transaksi",
                "Sebutkan langkah yang sudah dicoba",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-teal-100">
                    {i + 1}
                  </span>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
