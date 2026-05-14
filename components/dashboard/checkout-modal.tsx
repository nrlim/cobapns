"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Tag, CheckCircle2, Loader2, Shield, ChevronRight, Lock, AlertCircle } from "lucide-react"
import { createTransaction, applyPromoCode, syncMidtransTransaction } from "@/app/actions/billing"

// ─── Midtrans window type ─────────────────────────────────────────────────────

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: Record<string, string>) => void
          onPending?: (result: Record<string, string>) => void
          onError?: (result: Record<string, string>) => void
          onClose?: () => void
          language?: string
        }
      ) => void
    }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckoutPlan {
  id: string
  name: string
  price: number
  durationMonths: number
}

interface CheckoutModalProps {
  plan: CheckoutPlan | null
  onClose: () => void
  onSuccess: () => void
}

function fmtIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)
}

// ─── Load Midtrans Snap.js dynamically ───────────────────────────────────────

function loadSnapScript(clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(); return }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    const src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js"

    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (window.snap) {
        resolve()
        return
      }
      // If script exists but window.snap is missing, it probably failed to load previously (e.g. adblocker)
      // Remove it so we can try injecting it again.
      existing.remove()
    }

    const script = document.createElement("script")
    script.src = src
    script.setAttribute("data-client-key", clientKey)
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Gagal memuat modul pembayaran."))
    document.head.appendChild(script)
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

type PaymentState = "idle" | "loading" | "snap_open" | "success" | "pending" | "error"

export function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isOpen = !!plan

  const [promoInput, setPromoInput] = useState("")
  const [promoStatus, setPromoStatus] = useState<null | { valid: boolean; pct: number; message: string }>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [paymentState, setPaymentState] = useState<PaymentState>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPromoInput("")
      setPromoStatus(null)
      setPaymentState("idle")
      setErrorMsg(null)
    }
  }, [isOpen])

  // Escape to close (only when Snap isn't open — Snap has its own close)
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && paymentState !== "snap_open") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose, paymentState])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!plan) return null

  const baseTotal = plan.price // Price is already the total for the selected duration
  const discountAmt = promoStatus?.valid ? Math.round(baseTotal * (promoStatus.pct / 100)) : 0
  const finalTotal = baseTotal - discountAmt

  async function handleApplyPromo() {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    const res = await applyPromoCode(promoInput, plan!.id)
    setPromoStatus({ valid: res.valid, pct: res.discountPct, message: res.message })
    setPromoLoading(false)
  }

  async function handleSubmit() {
    try {
      setPaymentState("loading")
      setErrorMsg(null)

      // 1. Create transaction server-side → get Midtrans snap_token
      const res = await createTransaction({
        planType: plan!.id,
        promoCode: promoStatus?.valid ? promoInput : undefined,
        durationMonths: plan!.durationMonths,
      })

      if (!res.success || !res.snapToken) {
        setPaymentState("error")
        setErrorMsg(res.error ?? "Gagal menghubungi gateway pembayaran.")
        return
      }

      // 2. Load Midtrans Snap.js (cached after first load)
      try {
        await loadSnapScript(res.clientKey ?? "")
      } catch (err) {
        setPaymentState("error")
        setErrorMsg("Gagal memuat halaman Midtrans. Pastikan koneksi internet stabil dan matikan AdBlock jika ada.")
        return
      }

      if (!window.snap) {
        setPaymentState("error")
        setErrorMsg("Modul pembayaran tidak tersedia. Coba refresh halaman.")
        return
      }

      // 3. Open Midtrans Snap popup
      setPaymentState("snap_open")

      window.snap.pay(res.snapToken, {
        language: "id",

        onSuccess(result) {
          console.log("[Midtrans] onSuccess", result)
          if (result && result.order_id) {
            syncMidtransTransaction(result.order_id as string).then(() => {
              setPaymentState("success")
              onSuccess()
            })
          } else {
            setPaymentState("success")
            onSuccess()
          }
        },

        onPending(result) {
          console.log("[Midtrans] onPending", result)
          setPaymentState("pending")
        },

        onError(result) {
          console.error("[Midtrans] onError", result)
          setPaymentState("error")
          setErrorMsg("Pembayaran gagal. Silakan coba metode pembayaran lain.")
        },

        onClose() {
          // User closed Snap popup without completing payment
          if (paymentState === "snap_open") {
            setPaymentState("idle")
          }
        },
      })
    } catch (error) {
      console.error("[Checkout] Fatal error:", error)
      setPaymentState("error")
      setErrorMsg("Terjadi kesalahan sistem yang tidak terduga. Silakan muat ulang halaman.")
    }
  }

  // ── After payment result states ────────────────────────────────────────────

  if (paymentState === "success" || paymentState === "pending") {
    const isSuccess = paymentState === "success"
    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isSuccess ? "bg-blue-50" : "bg-amber-50"}`}>
            {isSuccess
              ? <CheckCircle2 className="w-8 h-8 text-brand-blue" />
              : <AlertCircle className="w-8 h-8 text-amber-500" />
            }
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            {isSuccess ? "Pembayaran Berhasil!" : "Pembayaran Pending"}
          </h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
            {isSuccess
              ? "Paket kamu sedang diaktifkan secara otomatis. Ini biasanya memakan waktu kurang dari 5 menit."
              : "Pembayaran kamu sedang menunggu konfirmasi. Paket akan aktif setelah pembayaran dikonfirmasi."}
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold text-sm rounded-xl transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Main Checkout Sheet ────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => { if (e.target === overlayRef.current && paymentState === "idle") onClose() }}
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div
        className={`relative bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-blue-deep to-brand-blue px-6 py-5 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Konfirmasi Pembelian</p>
              <h2 className="text-xl font-black tracking-tight">{plan.name}</h2>
              <p className="text-blue-200 text-sm font-medium mt-1">Masa aktif {plan.durationMonths} bulan</p>
            </div>
            <button
              onClick={onClose}
              disabled={paymentState === "loading"}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">{plan.name} ({plan.durationMonths} bulan)</span>
                <span className="font-bold text-slate-900">{fmtIDR(baseTotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-blue flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Diskon ({promoStatus?.pct}%)
                  </span>
                  <span className="font-bold text-brand-blue-deep">- {fmtIDR(discountAmt)}</span>
                </div>
              )}
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">Total Pembayaran</span>
                <span className="text-2xl font-black text-brand-blue-deep">{fmtIDR(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Kode Promo (opsional)
            </label>
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") handleApplyPromo() }}
                placeholder="Contoh: COBAPNS10"
                disabled={paymentState === "loading"}
                className="flex-1 px-4 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 tracking-widest disabled:opacity-50"
              />
              <button
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoInput.trim() || paymentState === "loading"}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terapkan"}
              </button>
            </div>
            {promoStatus && (
              <p className={`text-xs font-bold mt-2 flex items-center gap-1.5 ${promoStatus.valid ? "text-brand-blue-deep" : "text-red-600"}`}>
                {promoStatus.valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {promoStatus.message}
              </p>
            )}
          </div>

          {/* Midtrans info note */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-blue-900 mb-0.5">Pembayaran diproses oleh Midtrans</p>
              <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                Setelah klik "Lanjutkan Pembayaran", jendela Midtrans akan muncul. Pilih metode pembayaranmu di sana — Transfer Bank, E-Wallet, QRIS, atau Kartu Kredit.
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Lock className="w-3 h-3" /> SSL 256-bit
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Shield className="w-3 h-3" /> PCI DSS Compliant
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <CheckCircle2 className="w-3 h-3" /> Midtrans Certified
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm font-bold text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={paymentState === "loading"}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={paymentState === "loading"}
            className="flex-[2] py-3 rounded-xl bg-brand-blue-deep hover:bg-brand-blue-deep text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-brand-blue-deep/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {paymentState === "loading" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan Pembayaran...</>
            ) : (
              <><span>Lanjutkan Pembayaran</span> <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
