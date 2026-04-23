"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ExamStatus, ExamAccessTier } from "@prisma/client"
import { upsertExam } from "@/app/actions/exams"
import {
  Save,
  Loader2,
  ArrowLeft,
  ClipboardList,
  Timer,
  Target,
  Shield,
  Star,
  Crown,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Zap,
} from "lucide-react"
import { CURRENT_YEAR } from "@/lib/utils"
import Link from "next/link"

interface ExamData {
  id?: string
  title: string
  durationMinutes: number
  passingGradeTWK: number
  passingGradeTIU: number
  passingGradeTKP: number
  status: ExamStatus
  accessTier: ExamAccessTier
}

interface ExamFormClientProps {
  initialData?: ExamData
}

// ── Design tokens ──────────────────────────────────────────────────────────
const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-brand-blue-light transition-all placeholder:text-slate-400 shadow-sm"

const labelBase = "block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2"

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_OPTIONS: {
  value: ExamStatus
  label: string
  desc: string
  icon: React.ReactNode
  ring: string
  bg: string
  text: string
}[] = [
  {
    value: "DRAFT",
    label: "Draft",
    desc: "Hanya terlihat oleh admin",
    icon: <ClipboardList className="w-4 h-4" />,
    ring: "ring-slate-400",
    bg: "bg-slate-50",
    text: "text-slate-600",
  },
  {
    value: "SCHEDULED",
    label: "Scheduled",
    desc: "Akan dipublikasikan sesuai jadwal",
    icon: <Timer className="w-4 h-4" />,
    ring: "ring-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    value: "PUBLISHED",
    label: "Published",
    desc: "Aktif dan dapat diakses siswa",
    icon: <CheckCircle2 className="w-4 h-4" />,
    ring: "ring-blue-500",
    bg: "bg-blue-50",
    text: "text-brand-blue-deep",
  },
]

// ── Tier config ────────────────────────────────────────────────────────────
const TIER_OPTIONS: {
  value: ExamAccessTier
  label: string
  desc: string
  icon: React.ReactNode
  ring: string
  bg: string
  text: string
  badge: string
}[] = [
  {
    value: "FREE",
    label: "Free",
    desc: "Semua siswa dapat mengakses",
    icon: <Shield className="w-4 h-4" />,
    ring: "ring-slate-400",
    bg: "bg-slate-50",
    text: "text-slate-600",
    badge: "bg-slate-100 text-slate-600",
  },
  {
    value: "ELITE",
    label: "Elite",
    desc: "Khusus paket Elite & Master",
    icon: <Star className="w-4 h-4" />,
    ring: "ring-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    value: "MASTER",
    label: "Master",
    desc: "Eksklusif paket Master saja",
    icon: <Crown className="w-4 h-4" />,
    ring: "ring-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
  },
]

// ── Category passing grade config ──────────────────────────────────────────
const GRADE_CONFIG = [
  {
    key: "passingGradeTWK" as const,
    label: "TWK",
    full: "Tes Wawasan Kebangsaan",
    max: 150,
    hint: "30 soal × 5 poin",
    color: {
      bar: "bg-red-500",
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      ring: "focus:ring-red-500/25 focus:border-red-400",
    },
  },
  {
    key: "passingGradeTIU" as const,
    label: "TIU",
    full: "Tes Intelegensia Umum",
    max: 175,
    hint: "35 soal × 5 poin",
    color: {
      bar: "bg-blue-500",
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      ring: "focus:ring-blue-500/25 focus:border-blue-400",
    },
  },
  {
    key: "passingGradeTKP" as const,
    label: "TKP",
    full: "Tes Karakteristik Pribadi",
    max: 225,
    hint: "45 soal × 1–5 poin",
    color: {
      bar: "bg-purple-500",
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      ring: "focus:ring-purple-500/25 focus:border-purple-400",
    },
  },
]

export function ExamFormClient({ initialData }: ExamFormClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<ExamData>({
    id: initialData?.id,
    title: initialData?.title ?? "",
    durationMinutes: initialData?.durationMinutes ?? 100,
    passingGradeTWK: initialData?.passingGradeTWK ?? 65,
    passingGradeTIU: initialData?.passingGradeTIU ?? 80,
    passingGradeTKP: initialData?.passingGradeTKP ?? 166,
    status: initialData?.status ?? "DRAFT",
    accessTier: initialData?.accessTier ?? "FREE",
  })

  function update<K extends keyof ExamData>(key: K, value: ExamData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await upsertExam(form)
      if (res.success) {
        setSuccess(true)
        setTimeout(() => router.push("/admin/content/exams"), 900)
      } else {
        setError(res.error ?? "Terjadi kesalahan.")
      }
    })
  }

  const totalMax = 150 + 175 + 225
  const totalPassing = form.passingGradeTWK + form.passingGradeTIU + form.passingGradeTKP

  const selectedTier = TIER_OPTIONS.find((t) => t.value === form.accessTier)!
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === form.status)!

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* ── Two-column grid: form (left) + preview panel (right) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

        {/* ── LEFT: Main Form (spans 2 cols on xl) ──────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Section 1: Basic Info ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-brand-blue-deep" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Informasi Dasar</h3>
                <p className="text-[11px] text-slate-400 font-medium">Identitas dan durasi ujian</p>
              </div>
            </div>
            <div className="p-6 space-y-5">

              {/* Title */}
              <div>
                <label className={labelBase}>Judul Ujian *</label>
                <input
                  className={inputBase}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={`Contoh: Try Out CAT SKD #12 — Sesi April ${CURRENT_YEAR}`}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Gunakan nama yang jelas dan mudah dikenali siswa.
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className={labelBase}>Durasi Ujian *</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      className={inputBase}
                      value={form.durationMinutes}
                      onChange={(e) => update("durationMinutes", Number(e.target.value))}
                      min={1}
                      max={300}
                      required
                    />
                  </div>
                  <div className="flex-shrink-0 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-500">
                    Menit
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {[60, 90, 100, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => update("durationMinutes", m)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                        form.durationMinutes === m
                          ? "bg-brand-blue text-white border-brand-blue"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-blue-light hover:text-brand-blue"
                      }`}
                    >
                      {m} mnt
                    </button>
                  ))}
                  <span className="text-[11px] text-slate-400 font-medium ml-1">
                    Standar SKD: 100 mnt / 110 soal
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Passing Grades ────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Ambang Batas Nilai</h3>
                <p className="text-[11px] text-slate-400 font-medium">Passing Grade per kategori soal</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {GRADE_CONFIG.map(({ key, label, full, max, hint, color }) => {
                  const val = form[key] as number
                  const pct = Math.round((val / max) * 100)
                  return (
                    <div key={key} className={`rounded-2xl border ${color.border} ${color.bg} p-4 space-y-3`}>
                      <div>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${color.text} mb-0.5`}>
                          {label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{full}</div>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-2xl font-black ${color.text} outline-none focus:ring-2 ${color.ring} transition-all shadow-sm text-center`}
                          value={val}
                          onChange={(e) => update(key, Number(e.target.value))}
                          min={0}
                          max={max}
                          required
                        />
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${color.bar}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                          <span>{pct}%</span>
                          <span>maks {max}</span>
                        </div>
                        <div className={`text-[10px] font-bold mt-1 ${color.text}`}>{hint}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total combined passing */}
              <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-slate-500">Total Nilai Kelulusan</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900">{totalPassing}</span>
                  <span className="text-xs text-slate-400 font-bold">/ {totalMax}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue-deep border border-blue-200">
                    {Math.round((totalPassing / totalMax) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Status ────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Status Publikasi</h3>
                <p className="text-[11px] text-slate-400 font-medium">Kontrol visibilitas ujian</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STATUS_OPTIONS.map((opt) => {
                  const isActive = form.status === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("status", opt.value)}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? `${opt.bg} border-current ring-2 ${opt.ring} ring-offset-1 ${opt.text}`
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? opt.bg : "bg-slate-100"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <div className="text-sm font-black">{opt.label}</div>
                        <div className="text-[11px] font-medium opacity-70 mt-0.5">{opt.desc}</div>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 opacity-80" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Access Tier ───────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-violet-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Akses Paket</h3>
                <p className="text-[11px] text-slate-400 font-medium">Siapa yang bisa mengakses ujian ini?</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TIER_OPTIONS.map((opt) => {
                  const isActive = form.accessTier === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("accessTier", opt.value)}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        isActive
                          ? `${opt.bg} border-current ring-2 ${opt.ring} ring-offset-1 ${opt.text}`
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? opt.bg : "bg-slate-100"
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <div className="text-sm font-black">{opt.label}</div>
                        <div className="text-[11px] font-medium opacity-70 mt-0.5">{opt.desc}</div>
                      </div>
                      {isActive && (
                        <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 opacity-80" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Error / Success ──────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-brand-blue-deep rounded-2xl px-5 py-4">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-bold">Tersimpan! Mengarahkan kembali...</span>
            </div>
          )}

          {/* Action Bar ────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
            <Link
              href="/admin/content/exams"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Batal
            </Link>
            <button
              type="submit"
              disabled={isPending || success}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-brand-blue-deep hover:bg-brand-blue-deep active:scale-95 text-white text-sm font-black shadow-md shadow-brand-blue-deep/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {form.id ? "Perbarui Ujian" : "Simpan & Lanjutkan"}
              {!isPending && !success && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Preview / Summary Panel ───────────────────── */}
        <div className="space-y-4 xl:sticky xl:top-6">

          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Pratinjau Ujian
              </h3>
            </div>
            <div className="p-5 space-y-4">

              {/* Exam Title Preview */}
              <div className="bg-gradient-to-br from-brand-blue-deep to-brand-blue rounded-xl p-4 text-white">
                <div className="text-[9px] font-bold uppercase tracking-widest text-blue-200 mb-1">Simulasi CAT</div>
                <div className="text-sm font-black leading-snug line-clamp-2">
                  {form.title || "Nama ujian akan tampil di sini..."}
                </div>
                <div className="flex items-center gap-3 mt-3 text-blue-200 text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {form.durationMinutes} mnt
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    110 soal
                  </span>
                </div>
              </div>

              {/* Status + Tier badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${selectedStatus.bg} ${selectedStatus.text}`}>
                  {selectedStatus.icon}
                  {selectedStatus.label}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${selectedTier.badge}`}>
                  {selectedTier.icon}
                  {selectedTier.label}
                </span>
              </div>

              {/* Passing Grade Summary */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ambang Batas</div>
                {GRADE_CONFIG.map(({ key, label, max, color }) => {
                  const val = form[key] as number
                  const pct = Math.min(Math.round((val / max) * 100), 100)
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className={color.text}>{label}</span>
                        <span className="text-slate-600">{val} / {max}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${color.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tips Panel */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-black text-amber-900">Tips Admin</h4>
            </div>
            <ul className="space-y-2 text-[11px] text-amber-800 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="font-black">•</span>
                Simpan sebagai <strong>Draft</strong> dulu, lalu kelola soal sebelum publish.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black">•</span>
                Passing Grade SKD {CURRENT_YEAR}: TWK 65, TIU 80, TKP 166.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black">•</span>
                Setelah simpan, kamu akan diarahkan ke halaman kelola soal.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-black">•</span>
                Ujian <strong>Master</strong> hanya bisa diakses siswa dengan paket tertinggi.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </form>
  )
}
