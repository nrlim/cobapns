"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { saveSKBUserAnswer, submitSKBExam } from "@/app/actions/skb-exams"
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Clock,
  AlertTriangle,
  X,
  BookMarked,
} from "lucide-react"
import { NotificationToast } from "@/components/ui/notification-toast"

interface Option {
  id: string
  text: string
  score: number
}

interface Question {
  id: string
  category: "TEKNIS" | "MANAJERIAL" | "SOSIAL_KULTURAL"
  bidang: string
  subCategory: string
  content: string
  options: Option[]
}

interface SavedAnswer {
  optionId: string | null
  isRagu: boolean
}

interface SKBCATSessionClientProps {
  examId: string
  examTitle: string
  examBidang: string
  durationMinutes: number
  questions: Question[]
  savedAnswerMap: Record<string, SavedAnswer>
}

const SKB_KEY = (examId: string) => `skb_started_at_${examId}`

const CATEGORY_COLORS = {
  TEKNIS: { bg: "bg-orange-500", light: "bg-orange-50 text-orange-700 border-orange-200", label: "Teknis" },
  MANAJERIAL: { bg: "bg-purple-500", light: "bg-purple-50 text-purple-700 border-purple-200", label: "Manajerial" },
  SOSIAL_KULTURAL: { bg: "bg-teal-500", light: "bg-teal-50 text-teal-700 border-teal-200", label: "Sosial Kultural" },
}

type QStatus = "unvisited" | "answered" | "ragu" | "current"

const STATUS_CLASSES: Record<QStatus, string> = {
  unvisited: "bg-slate-200 text-slate-500 hover:bg-slate-300",
  answered: "bg-orange-500 text-white",
  ragu: "bg-amber-400 text-white",
  current: "bg-orange-700 text-white ring-2 ring-orange-300 ring-offset-1 scale-110",
}

const OPTION_LABELS = ["A", "B", "C", "D", "E"]

export function SKBCATSessionClient({
  examId,
  examTitle,
  examBidang,
  durationMinutes,
  questions,
  savedAnswerMap,
}: SKBCATSessionClientProps) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, SavedAnswer>>(() => {
    const init: Record<string, SavedAnswer> = {}
    for (const q of questions) {
      init[q.id] = savedAnswerMap[q.id] ?? { optionId: null, isRagu: false }
    }
    return init
  })
  const [visited, setVisited] = useState<Set<string>>(() => {
    const init = new Set<string>()
    for (const [qid, ans] of Object.entries(savedAnswerMap)) {
      if (ans.optionId || ans.isRagu) init.add(qid)
    }
    return init
  })
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SKB_KEY(examId))
      if (stored) {
        const startedAt = Number(stored)
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        return Math.max(0, durationMinutes * 60 - elapsed)
      }
      localStorage.setItem(SKB_KEY(examId), String(Date.now()))
    }
    return durationMinutes * 60
  })
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: "success" | "error" | "info"
    title: string
    message?: string
  }>({ isOpen: false, type: "info", title: "" })

  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentQ = questions[currentIdx]

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }
    const tick = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  // Mark visited
  useEffect(() => {
    setVisited((prev) => new Set(prev).add(currentQ.id))
  }, [currentIdx, currentQ.id])

  // Answer selection
  const selectOption = useCallback(
    (optionId: string) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: { ...prev[currentQ.id], optionId },
      }))

      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
      saveDebounceRef.current = setTimeout(() => {
        saveSKBUserAnswer(examId, currentQ.id, optionId, answers[currentQ.id]?.isRagu ?? false)
      }, 600)
    },
    [currentQ.id, examId, answers]
  )

  const toggleRagu = useCallback(() => {
    const current = answers[currentQ.id]
    const newRagu = !current?.isRagu
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], isRagu: newRagu },
    }))
    saveSKBUserAnswer(examId, currentQ.id, current?.optionId ?? null, newRagu)
  }, [currentQ.id, examId, answers])

  // Navigation
  const goTo = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIdx(idx)
      setSidebarOpen(false)
    }
  }

  // Submit
  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (submitting) return
      setSubmitting(true)
      setShowConfirmSubmit(false)
      localStorage.removeItem(SKB_KEY(examId))

      const res = await submitSKBExam(examId)
      if (res.success && res.resultId) {
        router.push(`/dashboard/skb/${examId}/result/${res.resultId}`)
      } else {
        setSubmitting(false)
        setNotification({
          isOpen: true,
          type: "error",
          title: "Gagal Mengumpulkan",
          message: res.error ?? "Terjadi kesalahan. Silakan coba lagi.",
        })
      }
    },
    [examId, router, submitting]
  )

  function getStatus(idx: number): QStatus {
    if (idx === currentIdx) return "current"
    const qid = questions[idx].id
    const ans = answers[qid]
    if (ans?.isRagu) return "ragu"
    if (ans?.optionId) return "answered"
    return "unvisited"
  }

  const answeredCount = questions.filter((q) => answers[q.id]?.optionId).length
  const raguCount = questions.filter((q) => answers[q.id]?.isRagu).length
  const unansweredCount = questions.length - answeredCount
  const isWarning = timeLeft <= 300

  const catColor = CATEGORY_COLORS[currentQ.category]

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex-shrink-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50
          fixed md:relative inset-y-0 left-0 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-black text-slate-900 text-sm truncate flex-1 mr-2">{examTitle}</h2>
            <button
              className="md:hidden p-1 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 w-fit">
            Bidang: {examBidang}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold mt-3">
            {[
              { color: "bg-slate-300", label: "Belum dikunjungi" },
              { color: "bg-orange-500", label: "Sudah dijawab" },
              { color: "bg-amber-400", label: "Ragu-ragu" },
              { color: "bg-orange-700", label: "Soal aktif" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${color} flex-shrink-0`} />
                <span className="text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {(["TEKNIS", "MANAJERIAL", "SOSIAL_KULTURAL"] as const).map((cat) => {
            const catQs = questions.map((q, idx) => ({ ...q, idx })).filter((q) => q.category === cat)
            if (catQs.length === 0) return null
            const colors = CATEGORY_COLORS[cat]
            return (
              <div key={cat}>
                <div className={`text-[9px] font-black px-2 py-0.5 rounded-full border mb-2 w-fit ${colors.light}`}>
                  {colors.label} — {catQs.length} soal
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {catQs.map(({ id, idx }) => (
                    <button
                      key={id}
                      onClick={() => goTo(idx)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${STATUS_CLASSES[getStatus(idx)]}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit button */}
        <div className="p-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold mb-2 text-center">
            Dijawab: {answeredCount}/{questions.length} · Ragu: {raguCount}
          </div>
          <button
            onClick={() => setShowConfirmSubmit(true)}
            disabled={submitting}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Kumpulkan Jawaban
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <BookMarked className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {CATEGORY_COLORS[currentQ.category].label} — {currentQ.subCategory}
              </p>
              <p className="text-sm font-black text-slate-900">
                Soal {currentIdx + 1} dari {questions.length}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm shadow-sm transition-colors ${
              isWarning ? "bg-red-600 text-white animate-pulse" : "bg-slate-900 text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </header>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Category pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${catColor.light}`}>
                {catColor.label}
              </span>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {currentQ.bidang}
              </span>
              {answers[currentQ.id]?.isRagu && (
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Ragu-ragu
                </span>
              )}
            </div>

            {/* Question Text */}
            <div
              className="text-slate-900 text-base leading-relaxed font-medium prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: currentQ.content }}
            />

            {/* Score hint for Manajerial / Sosial */}
            {(currentQ.category === "MANAJERIAL" || currentQ.category === "SOSIAL_KULTURAL") && (
              <div className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                💡 Skor jawaban: 1 (Sangat Buruk) → 5 (Sangat Baik). Pilih yang paling sesuai perilaku ideal.
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = answers[currentQ.id]?.optionId === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => selectOption(option.id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all group ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 shadow-sm shadow-orange-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}
                    >
                      {OPTION_LABELS[optIdx]}
                    </div>
                    <span
                      className={`text-sm font-medium leading-relaxed pt-0.5 ${
                        isSelected ? "text-orange-900" : "text-slate-700"
                      }`}
                    >
                      {option.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <footer className="bg-white border-t border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => goTo(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <button
            onClick={toggleRagu}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
              answers[currentQ.id]?.isRagu
                ? "bg-amber-400 border-amber-400 text-white"
                : "border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100"
            }`}
          >
            <Flag className="w-4 h-4" />
            Ragu-ragu
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => goTo(currentIdx + 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors shadow-sm"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Selesai & Kumpulkan
            </button>
          )}
        </footer>
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Kumpulkan Jawaban SKB?</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <div className="text-2xl font-black text-orange-600">{answeredCount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Dijawab</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-500">{raguCount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Ragu-ragu</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-400">{unansweredCount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Kosong</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {unansweredCount} soal masih belum dijawab.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Kembali ke Ujian
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Ya, Kumpulkan!
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationToast
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
