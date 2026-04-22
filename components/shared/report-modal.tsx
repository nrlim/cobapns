"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Printer, Loader2, Lock, X, RefreshCw, FileText, Sparkles, Maximize2, Minimize2 } from "lucide-react"

interface ReportButtonProps {
  type: "TRYOUT" | "IQ" | "PSYCHOLOGY"
  examResultId?: string
  label?: string
  hasAccess: boolean
  requiredTier?: "ELITE" | "MASTER"
  variant?: "primary" | "ghost" | "outline"
  size?: "sm" | "md"
}

const REPORT_META = {
  TRYOUT:     { title: "Laporan Try Out",     subtitle: "Resume Hasil Simulasi CAT",     icon: "📋" },
  IQ:         { title: "Laporan Kognitif",    subtitle: "Profil IQ Multi-Dimensi",       icon: "🧠" },
  PSYCHOLOGY: { title: "Laporan Psikometri",  subtitle: "Personality & Career Mapping",  icon: "🎯" },
} as const

/* ─── Trigger Button ──────────────────────────────────────────── */
export function ReportButton({
  type, examResultId, label, hasAccess,
  requiredTier = "ELITE", variant = "primary", size = "md",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false)

  const defaultLabel = {
    TRYOUT:     "Cetak / Simpan Laporan",
    IQ:         "Cetak / Simpan Laporan IQ",
    PSYCHOLOGY: "Cetak / Simpan Laporan Psikometri",
  }[type]

  if (!hasAccess) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none"
        title={`Membutuhkan paket ${requiredTier}`}
      >
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-bold">{label ?? defaultLabel}</span>
        <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ml-auto">
          {requiredTier}
        </span>
      </div>
    )
  }

  const sizeClass    = size === "sm" ? "text-xs px-3 py-2 gap-1.5" : "text-sm px-4 py-2.5 gap-2"
  const iconSize     = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
  const variantClass =
    variant === "primary" ? "bg-teal-700 hover:bg-teal-800 text-white shadow-sm shadow-teal-900/10"
    : variant === "outline" ? "border border-teal-600 text-teal-700 hover:bg-teal-50"
    : "text-teal-700 hover:bg-teal-50"

  return (
    <>
      <button
        id={`btn-report-${type.toLowerCase()}`}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 ${sizeClass} ${variantClass}`}
      >
        <Printer className={`${iconSize} flex-shrink-0`} />
        {label ?? defaultLabel}
      </button>

      {open && (
        <ReportModal type={type} examResultId={examResultId} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

/* ─── Modal ───────────────────────────────────────────────────── */
function ReportModal({
  type, examResultId, onClose,
}: { type: "TRYOUT" | "IQ" | "PSYCHOLOGY"; examResultId?: string; onClose: () => void }) {
  const meta      = REPORT_META[type]
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [phase, setPhase]       = useState<"loading" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [blobUrl, setBlobUrl]   = useState<string | null>(null)
  const [filename, setFilename] = useState("laporan-cobapns.pdf")
  const [isFullscreen, setIsFullscreen] = useState(false)


  /* ── Fetch PDF ─────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setPhase("loading")
    setErrorMsg(null)
    try {
      const params = new URLSearchParams({ type })
      if (type === "TRYOUT" && examResultId) params.set("id", examResultId)

      const res = await fetch(`/api/pdf/preview?${params.toString()}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `Error ${res.status}`)
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)

      const cd      = res.headers.get("Content-Disposition") ?? ""
      const fnMatch = cd.match(/filename="([^"]+)"/)
      const xFn     = res.headers.get("X-Report-Filename") ?? ""
      setFilename((fnMatch?.[1] ?? xFn) || "laporan-cobapns.pdf")

      setBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
      setPhase("ready")
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Gagal memuat laporan.")
      setPhase("error")
    }
  }, [type, examResultId])

  useEffect(() => {
    load()
    return () => { setBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null }) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── ESC + body scroll lock ────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])



  return (
    /* ── Full-screen centred overlay ── */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(2,20,36,0.75)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`relative flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? "w-full h-full rounded-none max-w-none" 
            : "w-[92vw] h-[88vh] max-h-[820px] max-w-4xl rounded-2xl border"
        }`}
        style={{
          background: "#0f172a",
          borderColor: isFullscreen ? "transparent" : "rgba(255,255,255,0.08)",
          animation: "modalPop .22s cubic-bezier(.34,1.56,.64,1) both",
        }}
      >

        {/* ── Header ───────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#0d1525" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "rgba(20,184,166,0.15)" }}>
              {meta.icon}
            </div>
            <div>
              <p className="text-white font-black text-sm leading-tight">{meta.title}</p>
              <p className="text-slate-400 text-[11px] font-medium">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
              style={{ color: "#94a3b8" }}
              title={isFullscreen ? "Perkecil ukuran" : "Perbesar penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
              style={{ color: "#64748b" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "#1e293b" }}>

          {/* Loading */}
          {phase === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.2)" }}>
                  <FileText className="w-7 h-7 text-teal-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#0f172a" }}>
                  <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm mb-1">Memuat laporan…</p>
                <p className="text-slate-500 text-xs">Mohon tunggu sebentar</p>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <p className="text-white font-bold text-sm">{errorMsg}</p>
              <button onClick={load}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(20,184,166,0.15)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.25)" }}>
                <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
              </button>
            </div>
          )}

          {/* PDF iframe */}
          {phase === "ready" && blobUrl && (
            <iframe
              ref={iframeRef}
              src={blobUrl}
              title={meta.title}
              className="w-full h-full"
              style={{ display: "block", border: "none" }}
            />
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        {phase === "ready" && (
          <div
            className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0d1525" }}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal-500" />
              <span className="text-[11px] text-slate-500 font-medium">
                Laporan resmi COBA PNS · Rahasia
              </span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium hidden sm:block">
              Tekan ESC untuk menutup
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity:0; transform:scale(.93) translateY(14px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  )
}
