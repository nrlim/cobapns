"use client"

import { useState, useEffect, useRef } from "react"
import {
  Eye, X, Loader2, CheckCircle2, XCircle,
  FileText, ChevronLeft, ChevronRight, BookOpen, ChevronDown, ChevronUp,
} from "lucide-react"
import { getExamReviewData } from "@/app/actions/scoring"

export interface ReviewOption {
  id: string
  text: string
  score: number
}

export interface ReviewQuestion {
  id: string
  category: string
  content: string
  explanation: string
  options: ReviewOption[]
  selectedOptionId: string | null
}

interface ReviewExamModalProps {
  examId: string
  title: string
}

export function ReviewExamModal({ examId, title }: ReviewExamModalProps) {
  const [isOpen, setIsOpen]           = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [data, setData]               = useState<ReviewQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  /** On mobile, the nav panel is collapsed by default so content is visible */
  const [navOpen, setNavOpen]         = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  async function handleOpen() {
    setIsLoading(true)
    const res = await getExamReviewData(examId)
    setIsLoading(false)
    if (res.success && res.data) {
      setData(res.data)
      setCurrentIndex(0)
      setNavOpen(false)
      setIsOpen(true)
    } else {
      alert(res.error || "Gagal memuat data review.")
    }
  }

  const handleClose = () => setIsOpen(false)

  const isQuestionCorrect = (q: ReviewQuestion) => {
    if (!q.selectedOptionId) return false
    const maxScore = Math.max(...q.options.map((o) => o.score))
    const selected = q.options.find((o) => o.id === q.selectedOptionId)
    return selected ? selected.score === maxScore && maxScore > 0 : false
  }

  const go = (idx: number) => {
    setCurrentIndex(idx)
    setNavOpen(false) // auto-collapse nav after selecting on mobile
  }

  if (!isOpen || data.length === 0) {
    return (
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold text-sm transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              : <Eye className="w-4 h-4" />}
          </div>
          Lihat Pembahasan
        </div>
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    )
  }

  const currentQ = data[currentIndex]

  return (
    <>
      {/* Trigger — hidden when modal is open (rendered above, returns early) */}

      {/* ── Backdrop ───────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
        style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
        onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
      >
        {/* ── Modal Card ─────────────────────────────────────────── */}
        {/* Mobile: full screen. Desktop: centered card 90dvh */}
        <div className="relative w-full h-dvh sm:h-[90dvh] sm:max-w-5xl bg-slate-50 shadow-2xl flex flex-col sm:rounded-3xl">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-brand-blue px-4 sm:px-6 py-3 sm:py-4 text-white flex-shrink-0 sm:rounded-t-3xl border-b border-brand-blue/40">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                  Pembahasan Ujian
                </p>
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug truncate">
                  {title}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* ── Content Area ───────────────────────────────────── */}
          {/* flex-col on mobile, flex-row on desktop (md+) */}
          <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden">

            {/* ══ NAVIGATION PANEL ════════════════════════════════
                Mobile  : collapsible accordion, max-h limited
                Desktop : fixed sidebar, vertically scrollable
            ══════════════════════════════════════════════════════ */}
            <div className="md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col flex-shrink-0">

              {/* Nav header — clickable on mobile to toggle */}
              <button
                className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/80 text-left w-full md:cursor-default"
                onClick={() => setNavOpen((v) => !v)}
                type="button"
              >
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Navigasi Soal
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Soal {currentIndex + 1} / {data.length} &bull; {currentQ.category}
                  </p>
                </div>
                {/* Toggle icon only on mobile */}
                <span className="md:hidden text-slate-400 flex-shrink-0">
                  {navOpen
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {/* Grid — always visible on desktop, accordion on mobile */}
              <div
                className={[
                  // Base
                  "overflow-y-auto p-3",
                  // Desktop: always visible, flex-grow to fill sidebar
                  "md:flex-1 md:max-h-none md:block",
                  // Mobile: toggled, capped height so content stays visible
                  navOpen ? "block max-h-44" : "hidden",
                ].join(" ")}
              >
                <div className="grid grid-cols-5 md:grid-cols-4 gap-1.5">
                  {data.map((q, idx) => {
                    const isActive    = idx === currentIndex
                    const isCorrect   = isQuestionCorrect(q)
                    const isUnanswered = !q.selectedOptionId

                    let cls = "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    if (isActive)      cls = "bg-blue-50 border-blue-500 text-brand-blue-deep ring-2 ring-blue-500/20"
                    else if (isUnanswered) cls = "bg-slate-100 border-dashed border-slate-300 text-slate-400"
                    else if (isCorrect) cls = "bg-green-50 border-green-200 text-green-700"
                    else               cls = "bg-red-50 border-red-200 text-red-700"

                    return (
                      <button
                        key={q.id}
                        onClick={() => go(idx)}
                        className={`h-9 rounded-xl border text-xs font-black transition-all ${cls}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            {/* ══ END NAVIGATION PANEL ══════════════════════════ */}

            {/* ══ MAIN CONTENT PANEL ══════════════════════════════ */}
            <div className="flex-1 flex flex-col min-h-0 bg-white">

              {/* Scrollable question + options + explanation */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-3xl mx-auto space-y-5 pb-4">

                  {/* Category & number badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black text-slate-600">
                      <FileText className="w-3.5 h-3.5" /> Soal {currentIndex + 1}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {currentQ.category}
                    </span>
                  </div>

                  {/* Question text */}
                  <div
                    className="prose prose-sm sm:prose-base max-w-none text-slate-800 font-medium leading-relaxed prose-p:my-2"
                    dangerouslySetInnerHTML={{ __html: currentQ.content }}
                  />

                  {/* Answer options */}
                  <div className="space-y-2">
                    {currentQ.options.map((opt, i) => {
                      const isSelected  = opt.id === currentQ.selectedOptionId
                      const isMaxScore  = opt.score === Math.max(...currentQ.options.map((o) => o.score)) && opt.score > 0
                      const isTKP       = currentQ.category === "TKP"

                      let optCls  = "border-slate-200 bg-white"
                      let textCls = "text-slate-600"
                      let icon: React.ReactNode = null

                      if (isTKP) {
                        if (isSelected) {
                          optCls  = "border-brand-blue-light bg-blue-50 ring-1 ring-brand-blue-light"
                          textCls = "text-blue-900 font-bold"
                        }
                      } else {
                        if (isSelected && isMaxScore) {
                          optCls  = "border-brand-green bg-brand-green-light/10 ring-1 ring-brand-green"
                          textCls = "text-brand-green-deep font-bold"
                          icon    = <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
                        } else if (isSelected && !isMaxScore) {
                          optCls  = "border-red-400 bg-red-50 ring-1 ring-red-400"
                          textCls = "text-red-900 font-bold"
                          icon    = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        } else if (!isSelected && isMaxScore) {
                          optCls  = "border-brand-green bg-brand-green-light/10 ring-1 ring-brand-green border-dashed"
                          textCls = "text-brand-green-deep font-bold"
                          icon    = <CheckCircle2 className="w-5 h-5 text-brand-green/60 flex-shrink-0" />
                        }
                      }

                      const label = String.fromCharCode(65 + i)

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${optCls}`}
                        >
                          <div className="flex-1 flex gap-3 min-w-0">
                            <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-xs font-black text-slate-500 mt-0.5 ${isSelected ? "bg-white border shadow-sm" : "bg-slate-100"}`}>
                              {label}
                            </span>
                            <div
                              className={`text-sm sm:text-[15px] leading-relaxed min-w-0 ${textCls}`}
                              dangerouslySetInnerHTML={{ __html: opt.text }}
                            />
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pl-1 pt-0.5">
                            {opt.score > 0 && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? "bg-white shadow-sm" : "bg-slate-100"} text-slate-500`}>
                                +{opt.score}
                              </span>
                            )}
                            {icon}
                          </div>
                        </div>
                      )
                    })}

                    {!currentQ.selectedOptionId && (
                      <p className="text-xs font-bold text-slate-400 italic mt-2">
                        Kamu tidak menjawab soal ini. (Kosong)
                      </p>
                    )}
                  </div>

                  {/* Explanation */}
                  {currentQ.explanation && !isQuestionCorrect(currentQ) && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-black text-slate-900 text-sm">Pembahasan</span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed prose-p:my-2"
                        dangerouslySetInnerHTML={{ __html: currentQ.explanation }}
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* ── Bottom Navigation (sticky, in-flow) ──────────── */}
              <div className="border-t border-slate-100 bg-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <span className="text-xs font-bold text-slate-400 tracking-widest">
                  {currentIndex + 1} / {data.length}
                </span>

                <button
                  onClick={() => setCurrentIndex(Math.min(data.length - 1, currentIndex + 1))}
                  disabled={currentIndex === data.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* ══ END MAIN CONTENT PANEL ══════════════════════════ */}

          </div>
          {/* End Content Area */}

        </div>
        {/* End Modal Card */}

      </div>
      {/* End Backdrop */}
    </>
  )
}
