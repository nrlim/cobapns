"use client"

import { useState, useCallback } from "react"
import { submitPsychometricTest } from "@/app/actions/psychology"
import { ChevronLeft, ChevronRight, Send, Brain, AlertTriangle, CheckCircle2 } from "lucide-react"

const LIKERT_LABELS = [
  { val: 1, label: "Sangat Tidak Setuju", short: "STS" },
  { val: 2, label: "Tidak Setuju",        short: "TS"  },
  { val: 3, label: "Netral",              short: "N"   },
  { val: 4, label: "Setuju",              short: "S"   },
  { val: 5, label: "Sangat Setuju",       short: "SS"  },
]

export type PsychQuestionItem = {
  id: string
  text: string
  dimension: string
  dimensionLabel: string
}

type QStatus = "unanswered" | "answered" | "current"

function getStatus(idx: number, current: number, answers: Record<string, number>, qId: string): QStatus {
  if (idx === current) return "current"
  return answers[qId] !== undefined ? "answered" : "unanswered"
}

export default function PsychTestClient({ questions }: { questions: PsychQuestionItem[] }) {
  const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  const total    = questions.length
  const q        = questions[current]
  const chosen   = answers[q?.id ?? ""]
  const answered = Object.keys(answers).length
  const isLast   = current === total - 1
  const pct      = Math.round((answered / total) * 100)

  const handleAnswer = useCallback((val: number) => {
    if (!q) return
    setAnswers(prev => ({ ...prev, [q.id]: val }))
  }, [q])

  async function handleSubmit() {
    setSubmitting(true)
    await submitPsychometricTest(answers)
  }

  if (total === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-screen bg-slate-50">
        <div className="text-center max-w-sm">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="font-black text-slate-700 mb-1">Belum ada soal psikotes</h2>
          <p className="text-sm text-slate-500">Admin belum menambahkan soal. Coba lagi nanti.</p>
        </div>
      </div>
    )
  }

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
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <span className="font-extrabold text-white text-sm font-serif">S</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">COBA PNS</p>
              <h2 className="font-black text-slate-900 text-sm truncate">Psikotes Kepribadian</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
            {[
              { color: "bg-slate-300", label: "Belum dijawab" },
              { color: "bg-teal-500",  label: "Sudah dijawab" },
              { color: "bg-teal-700",  label: "Soal aktif" },
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
          <div>
            <div className="grid grid-cols-6 gap-1.5">
              {questions.map((pq, i) => {
                const status = getStatus(i, current, answers, pq.id)
                return (
                  <button
                    key={pq.id}
                    onClick={() => setCurrent(i)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                      status === "current"  ? "bg-teal-700 text-white ring-2 ring-teal-400 ring-offset-1 scale-110" :
                      status === "answered" ? "bg-teal-500 text-white" :
                                             "bg-slate-200 text-slate-500 hover:bg-slate-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dimension Summary */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dimensi</p>
            {Array.from(new Set(questions.map(q => q.dimensionLabel))).map(label => {
              const dimQs = questions.filter(q => q.dimensionLabel === label)
              const dimAnswered = dimQs.filter(q => answers[q.id] !== undefined).length
              return (
                <div key={label} className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-bold text-slate-600 truncate">{label}</span>
                    <span className="font-black text-teal-700 ml-1 flex-shrink-0">{dimAnswered}/{dimQs.length}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-teal-500 transition-all"
                      style={{ width: `${(dimAnswered / dimQs.length) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 font-bold mb-2 text-center">
            Terjawab: {answered}/{total} ({pct}%)
          </div>
          <button
            onClick={handleSubmit}
            disabled={answered < total || submitting}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Mengirim..." : (
              <>
                <Send className="w-4 h-4" />
                Kumpulkan Jawaban
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {q?.dimensionLabel ?? ""}
              </p>
              <p className="text-sm font-black text-slate-900">
                Pernyataan {current + 1} dari {total}
              </p>
            </div>
          </div>
          <a
            href="/dashboard/psychology"
            className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-slate-100"
          >
            ✕ Keluar
          </a>
        </header>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Question Text */}
            <div className="text-slate-900 text-lg md:text-xl leading-relaxed font-bold prose prose-sm max-w-none mb-8">
              {q?.text}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {LIKERT_LABELS.map(({ val, label, short }) => {
                const isSelected = chosen === val
                return (
                  <button
                    key={val}
                    onClick={() => handleAnswer(val)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 shadow-sm shadow-teal-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm transition-all ${
                      isSelected ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}>
                      {val}
                    </div>
                    <span className={`text-sm font-medium flex-1 pt-0.5 ${isSelected ? "text-teal-900" : "text-slate-700"}`}>
                      {label}
                    </span>
                    <span className={`text-[10px] font-black tracking-widest flex-shrink-0 ${
                      isSelected ? "text-teal-600" : "text-slate-300"
                    }`}>
                      {short}
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
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          {/* Submit warning banner */}
          {answered < total && isLast && (
            <div className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs font-bold text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {total - answered} soal belum dijawab. Penuhi semua soal untuk evaluasi kepribadian.
            </div>
          )}

          {isLast ? (
             <button
                onClick={handleSubmit}
                disabled={answered < total || submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
             >
               Selesai & Kumpulkan <Send className="w-4 h-4" />
             </button>
          ) : (
            <button
              onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition-colors shadow-sm"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </footer>
      </main>
    </div>
  )
}

