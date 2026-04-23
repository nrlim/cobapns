"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { submitIQTest, type IQAnswers } from "@/app/actions/psychology"
import { ChevronLeft, ChevronRight, Clock, Send, Zap, CheckCircle2, AlertTriangle } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type IQQuestionItem = {
  id: string
  text: string
  options: { key: string; label: string }[]
  answerKey?: string
  imageUrl?: string | null
}

export type IQSectionData = {
  questions: IQQuestionItem[]
  timeSeconds: number
}

export type IQData = {
  verbal:  IQSectionData
  numeric: IQSectionData
  logic:   IQSectionData
  spatial: IQSectionData
}

type SubTest = "verbal" | "numeric" | "logic" | "spatial"
const SUB_TESTS: SubTest[] = ["verbal", "numeric", "logic", "spatial"]

const SUB_LABELS: Record<SubTest, string> = {
  verbal:  "Verbal",
  numeric: "Numerik",
  logic:   "Logika",
  spatial: "Spasial",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IQTestClient({ iqData }: { iqData: IQData }) {
  const [subTestIndex, setSubTestIndex]   = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<SubTest, Record<string, string>>>({
    verbal: {}, numeric: {}, logic: {}, spatial: {},
  })
  const [timings, setTimings] = useState<Record<SubTest, number>>({ verbal: 0, numeric: 0, logic: 0, spatial: 0 })
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [phase, setPhase] = useState<"active" | "between" | "done">("active")

  const currentSub = SUB_TESTS[subTestIndex]
  const section    = iqData[currentSub]
  const q          = section.questions[questionIndex]
  const startRef   = useRef(Date.now())

  useEffect(() => {
    setTimeLeft(section.timeSeconds)
    startRef.current = Date.now()
  }, [currentSub, section.timeSeconds])

  useEffect(() => {
    if (phase !== "active") return
    const t = setInterval(() => {
      setTimeLeft(v => {
        if (v <= 1) { clearInterval(t); handleTimeUp(); return 0 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSub, phase])

  const recordTiming = useCallback(() => {
    const elapsed = Math.round((Date.now() - startRef.current) / 1000)
    setTimings(p => ({ ...p, [currentSub]: elapsed }))
  }, [currentSub])

  function handleTimeUp() {
    recordTiming()
    setPhase(subTestIndex < SUB_TESTS.length - 1 ? "between" : "done")
  }

  const chosen = answers[currentSub][q?.id ?? ""]

  const handleAnswer = useCallback((key: string) => {
    if (!q) return
    setAnswers(prev => ({ ...prev, [currentSub]: { ...prev[currentSub], [q.id]: key } }))
  }, [currentSub, q])

  async function handleFinalSubmit() {
    recordTiming()
    setSubmitting(true)
    // Build answers map using the question's answerKey from DB
    await submitIQTest({
      verbal:  answers.verbal,
      numeric: answers.numeric,
      logic:   answers.logic,
      spatial: answers.spatial,
      timings,
    })
  }

  const totalQ    = section.questions.length
  const answeredQ = Object.keys(answers[currentSub]).length
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0")
  const secs = (timeLeft % 60).toString().padStart(2, "0")
  const timerWarning = timeLeft <= 60
  const timerDanger  = timeLeft <= 30

  if (totalQ === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="font-black text-slate-700 mb-1">Belum ada soal IQ</h2>
          <p className="text-sm text-slate-500">Admin belum menambahkan soal. Coba lagi nanti.</p>
        </div>
      </div>
    )
  }

  // We remove the early returns for `phase === "between"` and `phase === "done"`
  // They will be rendered as overlay modals inside the main layout at the bottom of standard return.
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 font-sans">
      
      {/* ── Sidebar (desktop fixed, mobile overlay) ───────────────────── */}
      <aside
        className={`
          flex-shrink-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50
          fixed md:relative inset-y-0 left-0 transition-transform duration-300
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-blue-deep flex items-center justify-center">
              <span className="font-extrabold text-white text-sm font-serif">S</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue-deep">COBA PNS</p>
              <h2 className="font-black text-slate-900 text-sm truncate">Tes IQ Multi-Dimensi</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-600">Sub-Tes Selesai:</span>
            <span className="text-xs font-black text-brand-blue-deep">{subTestIndex}/{SUB_TESTS.length}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
            {[
              { color: "bg-slate-300", label: "Belum dijawab" },
              { color: "bg-blue-500",  label: "Sudah dijawab" },
              { color: "bg-brand-blue-deep",  label: "Soal aktif" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${color} flex-shrink-0`} />
                <span className="text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigator Nav */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          <div className="text-[10px] font-black px-2 py-0.5 rounded-full border mb-2 w-fit bg-blue-50 text-brand-blue-deep border-blue-200">
            {SUB_LABELS[currentSub]} — {totalQ} soal
          </div>
          
          <div className="grid grid-cols-6 gap-1.5">
            {section.questions.map((sq, i) => {
              const isActive   = i === questionIndex
              const isAnswered = answers[currentSub][sq.id] !== undefined
              return (
                <button
                  key={sq.id}
                  onClick={() => setQuestionIndex(i)}
                  className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                    isActive    ? "bg-brand-blue-deep text-white ring-2 ring-brand-blue-light ring-offset-1 scale-110" :
                    isAnswered  ? "bg-blue-500 text-white" :
                                  "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

        </div>

        {/* Submit Area */}
        <div className="p-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold mb-2 text-center">
            Terjawab ({SUB_LABELS[currentSub]}): {answeredQ}/{totalQ}
          </div>
          {subTestIndex < SUB_TESTS.length - 1 ? (
             <button
                onClick={() => { recordTiming(); setPhase("between") }}
                className="w-full py-2.5 bg-brand-blue-deep hover:bg-brand-blue-deep text-white rounded-xl text-sm font-black transition-colors shadow-sm"
             >
                Selesai Sub-Tes
             </button>
          ) : (
             <button
                onClick={() => { recordTiming(); setPhase("done") }}
                className="w-full py-2.5 bg-brand-blue-deep hover:bg-brand-blue-deep text-white rounded-xl text-sm font-black transition-colors shadow-sm"
             >
                Selesai Ujian IQ
             </button>
          )}
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Sub-Tes {SUB_LABELS[currentSub]}
              </p>
              <p className="text-sm font-black text-slate-900">
                Soal {questionIndex + 1} dari {totalQ}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm shadow-sm transition-colors ${
              timerDanger  ? "bg-red-600 text-white animate-pulse" :
              timerWarning ? "bg-amber-500 text-white" :
                            "bg-slate-900 text-white"
            }`}>
              <Clock className="w-4 h-4" />
              {mins}:{secs}
            </div>

            <a
              href="/dashboard/psychology"
              className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 hidden sm:block"
            >
              ✕ Keluar
            </a>
          </div>
        </header>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6 flex-col mx-auto">
            
            {/* Question Text */}
            <div className="text-slate-900 text-lg md:text-xl leading-relaxed font-bold prose prose-sm max-w-none mb-6">
              {q?.text}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q?.options?.map((opt) => {
                const isSelected = chosen === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswer(opt.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 group ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm transition-all ${
                      isSelected ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}>
                      {opt.key}
                    </div>
                    <span className={`text-sm font-medium flex-1 pt-0.5 ${isSelected ? "text-blue-900 font-semibold" : "text-slate-700"}`}>
                      {opt.label}
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
            onClick={() => setQuestionIndex(q => Math.max(0, q - 1))}
            disabled={questionIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          {questionIndex < totalQ - 1 ? (
            <button
              onClick={() => setQuestionIndex(q => q + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue-deep hover:bg-brand-blue-deep text-white text-sm font-bold transition-colors shadow-sm"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : subTestIndex < SUB_TESTS.length - 1 ? (
            <button
              onClick={() => { recordTiming(); setPhase("between") }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue-deep hover:bg-brand-blue-deep text-white text-sm font-bold transition-colors shadow-sm"
            >
              Selesai Sub-Tes
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { recordTiming(); setPhase("done") }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue-deep hover:bg-brand-blue-deep text-white text-sm font-bold transition-colors shadow-sm"
            >
              Selesai
              <Send className="w-4 h-4" />
            </button>
          )}
        </footer>
      </main>

      {/* ── Between Sub-Tests Modal ──────────────────────────────────────────────── */}
      {phase === "between" && (() => {
        const nextSub  = SUB_TESTS[subTestIndex + 1]
        const nextSection = iqData[nextSub]
        return (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                <div className="h-1.5 bg-blue-500 w-full" />
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Sub-Tes {SUB_LABELS[currentSub]} Selesai</h2>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    {answeredQ} dari {totalQ} soal berhasil dijawab.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 text-left grid gap-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selanjutnya</p>
                    <p className="font-black text-slate-900 text-lg">{SUB_LABELS[nextSub]}</p>
                    <p className="text-xs text-slate-500 font-bold">
                      {nextSection.questions.length} soal <span className="mx-1.5 opacity-50">•</span> {nextSection.timeSeconds / 60} menit
                    </p>
                  </div>

                  <button
                    id="btn-continue-subtest"
                    onClick={() => { setSubTestIndex(i => i + 1); setQuestionIndex(0); setPhase("active") }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-blue-deep text-white rounded-2xl font-black text-sm hover:bg-brand-blue-deep transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Lanjut ke {SUB_LABELS[nextSub]} <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Final Submit Modal ──────────────────────────────────────────────────── */}
      {phase === "done" && (() => {
        const allTotal    = SUB_TESTS.reduce((a, s) => a + iqData[s].questions.length, 0)
        const allAnswered = SUB_TESTS.reduce((a, s) => a + Object.keys(answers[s]).length, 0)
        return (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                <div className="h-1.5 bg-blue-500 w-full" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-7 h-7 text-brand-blue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Ujian IQ Selesai</h2>
                      <p className="text-xs text-slate-500 font-bold mt-1">Konfirmasi untuk menghitung skor IQ Anda.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center mb-6">
                    <span className="text-3xl font-black text-brand-blue-deep leading-none">{allAnswered}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Terjawab dari {allTotal}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {SUB_TESTS.map(s => {
                      const a = Object.keys(answers[s]).length
                      const t = iqData[s].questions.length
                      return (
                        <div key={s} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{SUB_LABELS[s]}</p>
                          <p className="font-black text-slate-900 mt-1 pb-1">{a}<span className="text-xs text-slate-400 font-bold ml-0.5">/{t}</span></p>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    id="btn-submit-iq"
                    disabled={submitting}
                    onClick={handleFinalSubmit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-brand-blue-deep text-white rounded-2xl font-black text-sm hover:bg-brand-blue-deep disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {submitting ? (
                      <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Mengkalkulasi...</>
                    ) : (
                      <>Kumpulkan & Hitung Skor IQ <Send className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
