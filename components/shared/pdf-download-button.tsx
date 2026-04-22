"use client"

import { useState } from "react"
import { FileDown, Loader2, Lock } from "lucide-react"

interface PDFDownloadButtonProps {
  type: "TRYOUT" | "IQ" | "PSYCHOLOGY"
  /** Required only for TRYOUT type — the ExamResult ID */
  examResultId?: string
  label?: string
  /** If false, shows a locked/upgrade prompt instead */
  hasAccess: boolean
  requiredTier?: "ELITE" | "MASTER"
  /** Visual variant */
  variant?: "primary" | "ghost" | "outline"
  size?: "sm" | "md"
}

export function PDFDownloadButton({
  type,
  examResultId,
  label,
  hasAccess,
  requiredTier = "ELITE",
  variant = "primary",
  size = "md",
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultLabel = {
    TRYOUT: "Unduh Laporan Try Out",
    IQ: "Unduh Laporan IQ",
    PSYCHOLOGY: "Unduh Laporan Psikometri",
  }[type]

  async function handleDownload() {
    if (!hasAccess) return
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ type })
      if (type === "TRYOUT" && examResultId) params.set("id", examResultId)

      const res = await fetch(`/api/pdf/report?${params.toString()}`)

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `Error ${res.status}`)
      }

      // Trigger download
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      const cd   = res.headers.get("Content-Disposition") ?? ""
      const match = cd.match(/filename="([^"]+)"/)
      a.href = url
      a.download = match?.[1] ?? "laporan-cobapns.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengunduh laporan."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Locked state ────────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none" title={`Requires ${requiredTier} package`}>
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-xs font-bold">{label ?? defaultLabel}</span>
        <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ml-auto">
          {requiredTier}
        </span>
      </div>
    )
  }

  // ── Variant styles ──────────────────────────────────────────────────────────
  const sizeClass = size === "sm"
    ? "text-xs px-3 py-2 gap-1.5"
    : "text-sm px-4 py-2.5 gap-2"

  const variantClass = variant === "primary"
    ? "bg-teal-700 hover:bg-teal-800 text-white shadow-sm shadow-teal-900/10"
    : variant === "outline"
    ? "border border-teal-600 text-teal-700 hover:bg-teal-50"
    : "text-teal-700 hover:bg-teal-50"

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${sizeClass} ${variantClass}`}
      >
        {loading ? (
          <Loader2 className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} animate-spin flex-shrink-0`} />
        ) : (
          <FileDown className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} flex-shrink-0`} />
        )}
        {loading ? "Membuat PDF..." : (label ?? defaultLabel)}
      </button>
      {error && (
        <p className="text-xs text-red-500 font-medium px-1">{error}</p>
      )}
    </div>
  )
}
