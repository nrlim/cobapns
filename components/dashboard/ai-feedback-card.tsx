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
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Milestone,
  Target,
  ArrowDownCircle,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Layers3,
  Route,
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

// Strip markdown fences + extract first {...} block from any AI response string
function extractJSON(raw: string): Record<string, unknown> | null {
  if (!raw) return null
  try {
    // Fast path: already valid JSON
    return JSON.parse(raw)
  } catch {
    // Strip ```json ... ``` or ``` ... ``` wrappers
    let cleaned = raw.trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim()
    // Extract the outermost { ... } block
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")
    if (start !== -1 && end > start) {
      cleaned = cleaned.slice(start, end + 1)
    }
    try {
      return JSON.parse(cleaned)
    } catch {
      return null
    }
  }
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

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: { label: "Prioritas Utama", ring: "ring-rose-200",   text: "text-rose-700",        nodeBg: "bg-rose-500"         },
  high:     { label: "Penting",         ring: "ring-amber-200",  text: "text-amber-700",       nodeBg: "bg-amber-500"        },
  medium:   { label: "Dianjurkan",      ring: "ring-blue-200",   text: "text-brand-blue-deep", nodeBg: "bg-brand-blue-deep"  },
} as const

const URGENCY_CONFIG = {
  low:    { label: "Stabil",       caption: "Pertahankan ritme",      width: "45%", tone: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  medium: { label: "Perlu Fokus",  caption: "Rapikan prioritas",     width: "68%", tone: "from-blue-500 to-indigo-500",   bg: "bg-blue-50",    text: "text-brand-blue-deep", border: "border-blue-100" },
  high:   { label: "Fokus Tinggi", caption: "Mulai dari area utama", width: "86%", tone: "from-amber-400 to-orange-500", bg: "bg-amber-50",   text: "text-amber-700", border: "border-amber-100" },
} as const

function VisualMetricCard({ icon: Icon, label, value, helper }: { icon: typeof Sparkles; label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-100/80">{label}</span>
        <Icon className="w-4 h-4 text-blue-100" />
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold text-blue-100/80 mt-1">{helper}</p>
    </div>
  )
}

function ModernFeedbackRenderer({ data }: { data: any }) {
  if (!data) return null

  const urgency = data.urgencyLevel ?? "medium"
  const urgencyCfg = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.medium
  const strengths = Array.isArray(data.strengths) ? data.strengths : []
  const roadmap = Array.isArray(data.roadmap) ? data.roadmap : []
  const weeklyPlan = Array.isArray(data.weeklyPlan) ? data.weeklyPlan : []

  return (
    <div className="space-y-5">

      {/* ── Visual Summary / Learning Compass ───────────── */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-blue-deep via-slate-900 to-indigo-950 p-5 sm:p-6 text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-brand-blue/30 blur-2xl" />
        <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-200 bg-white/10 border border-white/10 rounded-full px-3 py-1 mb-3">
                <Sparkles className="w-3 h-3" /> AI Learning Compass
              </span>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Ringkasan rekomendasi kamu</h4>
              {(data.personalMessage || data.summary) && (
                <p className="text-sm font-medium leading-relaxed text-blue-50/90 max-w-2xl">
                  {data.personalMessage ?? data.summary}
                </p>
              )}
            </div>

            <div className={`min-w-[190px] rounded-2xl ${urgencyCfg.bg} ${urgencyCfg.border} border p-4 text-slate-900 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${urgencyCfg.text}`}>Level Fokus</span>
                <Zap className={`w-4 h-4 ${urgencyCfg.text}`} />
              </div>
              <p className="text-lg font-black text-slate-900">{urgencyCfg.label}</p>
              <p className="text-[11px] font-bold text-slate-500 mb-3">{urgencyCfg.caption}</p>
              <div className="h-2 rounded-full bg-white overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${urgencyCfg.tone}`} style={{ width: urgencyCfg.width }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <VisualMetricCard icon={ShieldCheck} label="Kekuatan" value={strengths.length || "—"} helper="pola positif" />
            <VisualMetricCard icon={Route} label="Roadmap" value={roadmap.length || "—"} helper="langkah aksi" />
            <VisualMetricCard icon={CalendarDays} label="Rencana" value={weeklyPlan.length || "—"} helper="blok belajar" />
            <VisualMetricCard icon={Layers3} label="Sinyal" value={data.psychInsight ? "4/4" : "2+"} helper="data dianalisis" />
          </div>
        </div>
      </div>

      {/* ── Emotional Insight ───────────────────────────── */}
      {data.emotionalInsight && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center mt-0.5">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h4 className="font-black text-violet-900 text-sm mb-1.5">Apa yang Terlihat dari Data Kamu</h4>
              <p className="text-xs text-violet-800 font-medium leading-relaxed">{data.emotionalInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Mindset Reframe ─────────────────────────────── */}
      {data.mindsetNote && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center mt-0.5">
              <Info className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h4 className="font-black text-sky-900 text-sm mb-1.5">Ubah Cara Pandang Kamu</h4>
              <p className="text-xs text-sky-800 font-medium leading-relaxed">{data.mindsetNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Strengths ───────────────────────────────────── */}
      {data.strengths?.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <h4 className="font-black text-emerald-900 text-sm">Kekuatan yang Perlu Kamu Pertahankan</h4>
          </div>
          <ul className="space-y-2">
            {data.strengths.map((item: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-[11px] text-emerald-800 font-medium leading-relaxed">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-black">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Roadmap Timeline ─────────────────────────────── */}
      {data.roadmap?.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Milestone className="w-4 h-4 text-brand-blue-deep" />
            <h4 className="font-black text-slate-900 text-sm">Langkah Nyata yang Bisa Kamu Mulai</h4>
          </div>
          <div className="space-y-0">
            {data.roadmap.map((step: any, i: number) => {
              const pcfg = PRIORITY_CONFIG[step.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium
              const isLast = i === data.roadmap.length - 1
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${pcfg.nodeBg} flex items-center justify-center shadow-sm ring-4 ${pcfg.ring} flex-shrink-0`}>
                      <span className="text-[10px] font-black text-white">{step.step}</span>
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
                  </div>
                  <div className={`pb-5 flex-1 min-w-0`}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h5 className="font-black text-slate-900 text-sm">{step.title}</h5>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${pcfg.text} bg-white border ${pcfg.ring.replace("ring-", "border-")}`}>
                        {pcfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{step.description}</p>
                    {step.estimasi && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">{step.estimasi}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Weekly Study Plan ────────────────────────── */}
      {data.weeklyPlan?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-brand-blue-deep" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Rencana Belajar Mingguan</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.weeklyPlan.map((plan: any, i: number) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-blue-deep/40 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-black text-slate-900 text-xs">{plan.day}</span>
                  <span className="text-[10px] font-bold text-brand-blue-deep bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{plan.duration}
                  </span>
                </div>
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-wide mb-2">{plan.focus}</p>
                <div className="flex flex-wrap gap-1">
                  {plan.topics.map((t: string, ti: number) => (
                    <span key={ti} className="text-[10px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Integrated 4-Parameter Insight ───────────── */}
      {data.integratedInsight && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-indigo-900 text-sm mb-1">Benang Merah Perjalanan Kamu</h4>
              <p className="text-xs text-indigo-800 font-medium leading-relaxed">{data.integratedInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Psychometric Insight ─────────────────────── */}
      {data.psychInsight && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-purple-900 text-sm mb-1">Insight Profil Kepribadian</h4>
              <p className="text-xs text-purple-800 font-medium leading-relaxed">{data.psychInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Target ───────────────────────────────────── */}
      {data.target && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Target className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm text-amber-900 mb-1">Target Realistis</h4>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">{data.target}</p>
            </div>
          </div>
        </div>
      )}
    </div>
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
            <div className="px-5 sm:px-6 pb-6 pt-2">
              {(() => {
                const parsed = extractJSON(feedback.content)
                if (parsed && (parsed.personalMessage || parsed.summary || parsed.roadmap)) {
                  return <ModernFeedbackRenderer data={parsed} />
                }
                // Legacy format or completely unparseable — render as markdown so user doesn't lose old data
                return (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <MarkdownRenderer content={feedback.content} />
                    <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Klik &ldquo;Generate Ulang&rdquo; di atas untuk mendapatkan format rekomendasi terbaru.
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {isPending && (
        <div className="border-t border-slate-100 px-5 sm:px-6 py-6 space-y-4 animate-pulse">
          {/* Personal message banner */}
          <div className="h-20 bg-slate-200 rounded-2xl" />
          {/* Emotional insight + mindset */}
          <div className="h-16 bg-violet-100 rounded-2xl" />
          <div className="h-14 bg-sky-50 rounded-2xl" />
          {/* Strengths */}
          <div className="h-20 bg-emerald-50 rounded-2xl" />
          {/* Roadmap */}
          <div className="space-y-3">
            <div className="h-3 bg-slate-200 rounded-full w-2/5" />
            <div className="h-16 bg-slate-100 rounded-2xl" />
            <div className="h-16 bg-slate-100 rounded-2xl" />
            <div className="h-16 bg-slate-100 rounded-2xl" />
          </div>
          <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
            Mentor AI sedang membaca profil dan riwayat belajar kamu...
          </p>
        </div>
      )}
    </div>
  )
}
