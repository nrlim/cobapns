"use client"

import { useState, useTransition } from "react"
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Crown,
  Lock,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { generateAIFeedback } from "@/app/actions/ai-feedback"
import type { AIFeedbackStatus, AIFeedbackData } from "@/app/actions/ai-feedback"
import { AI_FEEDBACK_QUOTA_LABEL } from "@/lib/ai-feedback-quota"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  if (!isoString) return ""
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "baru saja"
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  return `${diffDays} hari lalu`
}

function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null
  const rendered = content
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-black text-slate-800 mt-5 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-black text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-100">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-black text-slate-900 mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-800">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>')
    .replace(/^- (.*$)/gm, '<li class="flex gap-2 text-sm text-slate-700 leading-relaxed my-1"><span class="text-brand-blue-deep mt-0.5 flex-shrink-0">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="flex gap-2 text-sm text-slate-700 leading-relaxed my-1"><span class="font-black text-brand-blue-deep mt-0.5 flex-shrink-0 w-4">$1.</span><span>$2</span></li>')
    .replace(/^---$/gm, '<hr class="border-slate-100 my-4" />')
    .replace(/\n\n/g, '</p><p class="text-sm text-slate-700 leading-relaxed mb-3">')

  return (
    <div
      className="prose prose-sm max-w-none [&_li]:my-0.5 [&_h2]:mt-4"
      dangerouslySetInnerHTML={{
        __html: `<p class="text-sm text-slate-700 leading-relaxed mb-3">${rendered}</p>`,
      }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIFeedbackCard({ initialStatus }: { initialStatus: AIFeedbackStatus }) {
  const [status, setStatus] = useState<AIFeedbackStatus>(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(!!initialStatus?.feedback)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleGenerate = () => {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const result = await generateAIFeedback()
        if (result.success && result.feedback) {
          setStatus((prev) => ({
            ...prev,
            feedback: result.feedback as AIFeedbackData,
            quotaUsed: prev.quotaUsed + 1,
            quotaRemaining: Math.max(0, prev.quotaRemaining - 1),
            canGenerate: prev.quotaRemaining - 1 > 0,
          }))
          setIsExpanded(true)
        } else {
          setErrorMsg(result.error ?? "Terjadi kesalahan.")
        }
      } catch {
        setErrorMsg("Terjadi kesalahan sistem.")
      }
    })
  }

  if (!status) return null

  const { feedback, tier, quotaUsed, quotaLimit, quotaRemaining, totalExams, canGenerate, reason } = status
  const isStale = feedback?.isStale && (feedback?.newExamsSinceGen ?? 0) > 0
  const pct = quotaLimit > 0 ? Math.round((quotaUsed / quotaLimit) * 100) : 0

  // FREE tier — show upgrade prompt
  if (tier === "FREE") {
    return (
      <div className="relative bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-brand-blue rounded-2xl p-6 text-white shadow-sm overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <p className="text-blue-200 text-[10px] font-bold tracking-widest uppercase">Fitur Terkunci</p>
          </div>
          <h3 className="text-xl font-black mb-1 tracking-tight">Rekomendasi Belajar Personal</h3>
          <p className="text-blue-100 text-sm font-medium mb-5 max-w-md leading-relaxed">
            Upgrade ke paket Elite untuk mendapatkan rekomendasi belajar yang dipersonalisasi dari profil dan riwayat try out kamu.
          </p>
          <Link
            href="/dashboard/pembelian?plan=elite&from=diagnostik"
            className="inline-flex items-center gap-2 bg-white text-brand-blue-deep px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade ke Elite
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Sparkles className="absolute right-4 bottom-4 w-28 h-28 text-white/10" />
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500/20 rounded-full" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-blue-deep uppercase tracking-widest mb-0.5">
                Panduan Belajar Personal
              </p>
              <h3 className="font-black text-slate-900 text-base">Rekomendasi Untukmu</h3>
            </div>
          </div>

          {/* Tier Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex-shrink-0 ${
            tier === "MASTER"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-blue-50 border-blue-200 text-brand-blue-deep"
          }`}>
            {tier === "MASTER" ? <Crown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            {tier}
          </div>
        </div>

        <p className="text-slate-500 text-xs font-medium mt-3 leading-relaxed">
          Sistem membaca seluruh riwayat try out, profil psikometri, dan tujuan belajar kamu untuk menyusun panduan yang spesifik dan actionable.
        </p>
      </div>

      {/* ── Quota & Stats ───────────────────────────────────────── */}
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-4">

          {/* Quota Card */}
          <div className={`rounded-xl border p-4 ${
            quotaRemaining === 0
              ? "bg-red-50 border-red-200"
              : quotaRemaining <= 1
              ? "bg-amber-50 border-amber-200"
              : "bg-blue-50 border-blue-100"
          }`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Kuota Bulan Ini</span>
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-2xl font-black text-slate-900">{quotaRemaining}</span>
              <span className="text-slate-400 text-sm font-bold mb-0.5">/ {quotaLimit}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-white/70">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  backgroundColor: quotaRemaining === 0 ? "#ef4444" : quotaRemaining <= 1 ? "#f59e0b" : "#1E73BE",
                }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">
              {AI_FEEDBACK_QUOTA_LABEL[tier]} · Reset tiap bulan
            </p>
          </div>

          {/* Exam Count Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Data Try Out</span>
            </div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-2xl font-black text-slate-900">{totalExams}</span>
              <span className="text-slate-400 text-sm font-bold mb-0.5">ujian</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              {totalExams < 2
                ? "Minimal 2 ujian untuk generate"
                : feedback
                ? (feedback.newExamsSinceGen > 0 ? `+${feedback.newExamsSinceGen} baru sejak rekomendasi terakhir` : "Semua data sudah dianalisis")
                : "Siap untuk dianalisis"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stale Warning ────────────────────────────────────────── */}
      {isStale && (
        <div className="mx-5 mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Ada <strong>{feedback!.newExamsSinceGen} try out baru</strong> sejak rekomendasi terakhir. Perbarui agar rekomendasinya tetap relevan.
          </p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="mx-5 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">{errorMsg}</p>
        </div>
      )}

      {/* ── CTA Button ──────────────────────────────────────────── */}
      <div className="px-5 sm:px-6 pt-4 pb-5 sm:pb-6">
        <button
          id="btn-generate-recommendation"
          onClick={handleGenerate}
          disabled={!canGenerate || isPending}
          className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all duration-200 ${
            canGenerate && !isPending
              ? "bg-brand-blue-deep hover:bg-brand-blue text-white shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          {isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Sedang Menganalisis...
            </>
          ) : isStale ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Perbarui Rekomendasi
            </>
          ) : feedback ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Generate Ulang
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Rekomendasi Belajar
            </>
          )}
        </button>

        {!canGenerate && reason && (
          <p className="text-center text-[11px] text-slate-400 font-medium mt-2">{reason}</p>
        )}
      </div>

      {/* ── Feedback Content ─────────────────────────────────────── */}
      {feedback && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 font-bold">
                Rekomendasi dihasilkan {formatRelativeTime(feedback.generatedAt)}
              </span>
              {isStale && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Perlu Update
                </span>
              )}
            </div>
            {isExpanded
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />
            }
          </button>

          {isExpanded && (
            <div className="mx-4 sm:mx-6 mb-5 sm:mb-6 bg-slate-50 border border-slate-100 rounded-xl p-5">
              <MarkdownRenderer content={feedback.content} />
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {isPending && (
        <div className="border-t border-slate-100 px-5 sm:px-6 py-5">
          <div className="space-y-3 animate-pulse">
            <div className="h-3 bg-slate-200 rounded-full w-3/4" />
            <div className="h-3 bg-slate-200 rounded-full w-full" />
            <div className="h-3 bg-slate-200 rounded-full w-5/6" />
            <div className="h-3 bg-slate-200 rounded-full w-2/3" />
            <div className="h-3 bg-slate-200 rounded-full w-full" />
          </div>
          <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
            ✨ Sedang membaca profil dan riwayat try out kamu...
          </p>
        </div>
      )}
    </div>
  )
}
