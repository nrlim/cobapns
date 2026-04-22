"use client"

import { useState, useCallback } from "react"
import {
  CheckCircle2, Clock, XCircle, AlertCircle, ChevronRight,
  X, HelpCircle, MessageCircle, CreditCard, Loader2
} from "lucide-react"
import { syncMidtransTransaction } from "@/app/actions/billing"
import { useRouter } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string
  externalId: string | null
  planType: string
  amount: number
  status: string
  promoCode: string | null
  discountAmount: number
  paidAt: string | null
  createdAt: string
  expiredAt: string | null
  snapToken: string | null
}

interface PaymentHistoryProps {
  transactions: Transaction[]
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso))
}

// ─── Midtrans Snap loader ─────────────────────────────────────────────────────

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: {
        onSuccess?: (r: Record<string, string>) => void
        onPending?: (r: Record<string, string>) => void
        onError?: (r: Record<string, string>) => void
        onClose?: () => void
        language?: string
      }) => void
    }
  }
}

function loadSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(); return }
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    const src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); return }
    const s = document.createElement("script")
    s.src = src
    s.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "")
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Gagal memuat Snap.js"))
    document.head.appendChild(s)
  })
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUCCESS: { label: "Sukses",     icon: CheckCircle2, cls: "bg-teal-50 text-teal-700 border-teal-200" },
  PENDING: { label: "Menunggu",   icon: Clock,        cls: "bg-amber-50 text-amber-700 border-amber-200" },
  FAILED:  { label: "Gagal",      icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200" },
  EXPIRED: { label: "Kadaluarsa", icon: AlertCircle,  cls: "bg-slate-50 text-slate-500 border-slate-200" },
} as const

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {cfg.label}
    </span>
  )
}

const PLAN_LABEL: Record<string, string> = {
  ELITE: "Elite Prep", MASTER: "Master Strategy", FREE: "Free Access",
}

// ─── Resume Payment Button ────────────────────────────────────────────────────

function ResumePayButton({ snapToken, planLabel }: { snapToken: string; planLabel: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleResume = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      await loadSnapScript()
      if (!window.snap) throw new Error("Snap tidak tersedia")

      window.snap.pay(snapToken, {
        language: "id",
        async onSuccess(result) { 
          if (result && result.order_id) {
            await syncMidtransTransaction(result.order_id as string)
          }
          setDone(true)
          setLoading(false)
          router.refresh()
        },
        onPending() { setLoading(false) },
        onError() { setErr("Pembayaran gagal. Coba lagi."); setLoading(false) },
        onClose() { setLoading(false); router.refresh() },
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Terjadi error")
      setLoading(false)
    }
  }, [snapToken, router])

  if (done) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700">
        <CheckCircle2 className="w-3.5 h-3.5" /> Pembayaran diproses
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleResume}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-black rounded-lg transition-colors shadow-sm shadow-amber-500/20"
      >
        {loading
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyiapkan...</>
          : <><CreditCard className="w-3.5 h-3.5" /> Lanjutkan Bayar {planLabel}</>
        }
      </button>
      {err && <p className="text-[11px] font-bold text-red-600 flex items-center gap-1"><X className="w-3 h-3" />{err}</p>}
    </div>
  )
}

// ─── FAQ Modal ────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "Apakah bisa upgrade dari Elite ke Master?", a: "Bisa. Pilih paket Master dan bayar selisih harga. Masa aktif dihitung dari tanggal pembayaran baru." },
  { q: "Metode pembayaran apa yang tersedia?", a: "Transfer Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, DANA, ShopeePay), QRIS, dan Kartu Kredit/Debit." },
  { q: "Kapan paket aktif setelah pembayaran?", a: "Otomatis aktif dalam < 5 menit setelah pembayaran dikonfirmasi oleh Midtrans." },
  { q: "Bagaimana cara pakai kode promo?", a: "Masukkan kode promo di jendela konfirmasi pembayaran sebelum klik Lanjutkan Pembayaran." },
  { q: "Bagaimana jika pembayaran gagal?", a: "Transaksi berstatus Gagal/Kadaluarsa. Kamu bisa coba lagi dengan memilih paket dan membayar ulang." },
  { q: "Mengapa ada tombol 'Lanjutkan Bayar' di riwayat?", a: "Jika kamu sudah memilih paket tapi belum menyelesaikan pembayaran, kamu bisa melanjutkan dari sini tanpa perlu membuat order baru ke Midtrans." },
]

function FAQModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-black text-slate-900">Pertanyaan Umum</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {FAQS.map((item) => (
            <div key={item.q} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-bold text-slate-900 mb-1.5">{item.q}</p>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <p className="text-xs font-medium text-slate-500">Masih ada pertanyaan lain?</p>
          <a
            href="https://wa.me/62812345678"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Chat WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentHistory({ transactions }: PaymentHistoryProps) {
  const [faqOpen, setFaqOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Separate pending vs others for clear UX priority
  const pendingTx = transactions.filter(tx => tx.status === "PENDING" && tx.snapToken && tx.expiredAt && new Date(tx.expiredAt) > new Date())
  const otherTx = transactions.filter(tx => !pendingTx.includes(tx))

  return (
    <>
      <FAQModal open={faqOpen} onClose={() => setFaqOpen(false)} />

      <div className="max-w-[1000px] mx-auto mt-16 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Riwayat Pembayaran</h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {transactions.length === 0 ? "Belum ada transaksi." : `${transactions.length} transaksi ditemukan`}
            </p>
          </div>
          <button
            onClick={() => setFaqOpen(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors border border-slate-200 hover:border-slate-300 bg-white rounded-lg px-3 py-2"
          >
            <HelpCircle className="w-4 h-4" /> FAQ
          </button>
        </div>

        {/* Empty state */}
        {transactions.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-black text-slate-700 mb-1">Belum ada transaksi</p>
            <p className="text-sm font-medium text-slate-500">Pilih paket di atas untuk memulai perjalananmu.</p>
          </div>
        )}

        {/* Render: pending first, then others */}
        {[...pendingTx, ...otherTx].map((tx) => {
          const isExpanded = expandedId === tx.id
          const isPending = tx.status === "PENDING"
          const isResumable = isPending && !!tx.snapToken && !!tx.expiredAt && new Date(tx.expiredAt) > new Date()

          return (
            <div
              key={tx.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                isResumable
                  ? "border-amber-300 shadow-md shadow-amber-50"
                  : isPending
                    ? "border-amber-200 shadow-sm shadow-amber-50"
                    : "border-slate-200"
              }`}
            >
              {/* Resume banner for active pending orders */}
              {isResumable && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-amber-800">
                      Order menunggu pembayaran · berlaku hingga {fmtDate(tx.expiredAt!)}
                    </span>
                  </div>
                  <ResumePayButton
                    snapToken={tx.snapToken!}
                    planLabel={PLAN_LABEL[tx.planType] ?? tx.planType}
                  />
                </div>
              )}

              {/* Main row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-slate-50/50 transition-colors"
              >
                {/* Plan icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black ${
                  tx.planType === "ELITE" ? "bg-teal-50 text-teal-700" :
                  tx.planType === "MASTER" ? "bg-violet-50 text-violet-700" : "bg-slate-50 text-slate-500"
                }`}>
                  {tx.planType === "ELITE" ? "E" : tx.planType === "MASTER" ? "M" : "F"}
                </div>

                {/* Plan + date */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm">{PLAN_LABEL[tx.planType] ?? tx.planType}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{fmtDate(tx.createdAt)}</p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="font-black text-slate-900 text-sm">{fmtIDR(tx.amount)}</p>
                  {tx.discountAmount > 0 && (
                    <p className="text-[11px] font-bold text-teal-600">- {fmtIDR(tx.discountAmount)}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <StatusBadge status={tx.status} />
                </div>

                <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order ID</p>
                    <p className="font-mono font-bold text-slate-700 text-xs truncate">{tx.externalId ?? tx.id.slice(0, 16)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Bayar</p>
                    <p className="font-bold text-slate-900">{fmtIDR(tx.amount)}</p>
                  </div>
                  {tx.promoCode && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Promo</p>
                      <p className="font-mono font-bold text-teal-700 text-xs">{tx.promoCode}</p>
                    </div>
                  )}
                  {tx.paidAt && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dibayar Pada</p>
                      <p className="font-bold text-slate-700 text-xs">{fmtDate(tx.paidAt)}</p>
                    </div>
                  )}
                  {isPending && tx.expiredAt && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Token Berlaku</p>
                      <p className="font-bold text-amber-700 text-xs">{fmtDate(tx.expiredAt)}</p>
                    </div>
                  )}
                  <div className="col-span-2 sm:col-span-3 flex items-center justify-between flex-wrap gap-3">
                    <StatusBadge status={tx.status} />
                    {isResumable && (
                      <ResumePayButton
                        snapToken={tx.snapToken!}
                        planLabel={PLAN_LABEL[tx.planType] ?? tx.planType}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
