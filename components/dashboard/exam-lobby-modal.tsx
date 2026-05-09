"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  X,
  Clock,
  BookOpen,
  Users,
  Play,
  RotateCcw,
  CheckCircle2,
  Target,
  Zap,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { retakeExam } from "@/app/actions/scoring"

export interface ExamModalData {
  id: string
  title: string
  durationMinutes: number
  questionCount: number
  resultCount: number
  passingGradeTWK: number
  passingGradeTIU: number
  passingGradeTKP: number
  /** true if the user has submitted a previous result */
  hasPreviousResult: boolean
  previousResultId?: string
  previousScore?: number
}

interface ExamLobbyModalProps {
  exam: ExamModalData | null
  onClose: () => void
}

export function ExamLobbyModal({ exam, onClose }: ExamLobbyModalProps) {
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const isOpen = !!exam
  const [isLoading, setIsLoading] = useState(false)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else        document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!exam) return null

  async function handleStart() {
    if (!exam) return
    setIsLoading(true)

    if (exam.hasPreviousResult) {
      const res = await retakeExam(exam.id)
      if (!res?.success) {
        alert(res?.error || "Gagal mengulang ujian.")
        setIsLoading(false)
        return
      }
    }

    // Always go to session — server will redirect to result if already submitted
    router.push(`/dashboard/exams/${exam.id}/session`)
    // Delay onClose slightly to let navigation start
    setTimeout(() => {
      onClose()
      setIsLoading(false)
    }, 500)
  }

  const formatDuration = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)} jam ${m % 60 > 0 ? `${m % 60} mnt` : ""}`.trim() : `${m} menit`

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      >
        {/* Modal Card */}
        <div
          className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] transition-all duration-300 ${
            isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
          }`}
        >
          {/* ── Header ─────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-brand-blue px-6 pt-6 pb-5 text-white">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Simulasi CAT PNS
                </p>
                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
                  {exam.title}
                </h2>
                {exam.hasPreviousResult && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-blue-200 text-xs font-bold">
                      Skor sebelumnya: {exam.previousScore} — Kamu pernah mengerjakan
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Clock,    label: "Durasi",    value: formatDuration(exam.durationMinutes) },
                { icon: BookOpen, label: "Total Soal", value: `${exam.questionCount} soal` },
                { icon: Users,    label: "Peserta",   value: `${exam.resultCount} orang` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-center">
                  <Icon className="w-3.5 h-3.5 text-blue-200 mx-auto mb-1" />
                  <div className="text-xs font-black text-white">{value}</div>
                  <div className="text-[10px] text-blue-200 font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Passing grades */}
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-brand-blue/40">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Passing:</span>
              {[
                { label: "TWK", val: exam.passingGradeTWK, cls: "bg-red-400/20 border-red-300/30 text-red-200" },
                { label: "TIU", val: exam.passingGradeTIU, cls: "bg-blue-400/20 border-blue-300/30 text-blue-200" },
                { label: "TKP", val: exam.passingGradeTKP, cls: "bg-purple-400/20 border-purple-300/30 text-purple-200" },
              ].map(({ label, val, cls }) => (
                <span key={label} className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${cls}`}>
                  {label} ≥ {val}
                </span>
              ))}
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1 min-h-0">

            {/* Rules + Scoring side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Rules */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-brand-blue" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Tata Tertib</span>
                </div>
                <ul className="space-y-2">
                  {[
                    "Timer berjalan sejak kamu klik Mulai.",
                    "Jawaban tersimpan otomatis.",
                    "Submit otomatis saat waktu habis.",
                    "Halaman tertutup? Lanjutkan dengan link ini.",
                  ].map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scoring */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Penilaian</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { cat: "TWK", n: "30 soal", rule: "+5 benar, 0 salah", cls: "text-red-600 bg-red-50 border-red-100" },
                    { cat: "TIU", n: "35 soal", rule: "+5 benar, 0 salah", cls: "text-blue-600 bg-blue-50 border-blue-100" },
                    { cat: "TKP", n: "45 soal", rule: "Poin bertingkat 1–5", cls: "text-purple-600 bg-purple-50 border-purple-100" },
                  ].map(({ cat, n, rule, cls }) => (
                    <div key={cat} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] ${cls}`}>
                      <span className="font-black w-8">{cat}</span>
                      <span className="text-slate-500 font-medium flex-1">{rule}</span>
                      <span className="font-bold text-slate-400">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Tips Cepat</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  "Kerjakan soal yang kamu yakin dulu.",
                  "Gunakan 'Ragu-ragu' untuk ditinjau ulang.",
                  "~54 detik per soal untuk selesai tepat waktu.",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-1.5 flex-1">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-sm font-bold transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex-[2] py-3 rounded-xl bg-brand-blue-deep hover:bg-brand-blue-deep text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-brand-blue-deep/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : exam.hasPreviousResult ? (
                <><RotateCcw className="w-4 h-4" /> Ulangi Ujian</>
              ) : (
                <><Play className="w-4 h-4" /> Mulai Ujian Sekarang</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
