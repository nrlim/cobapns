"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, X, Loader2, CheckCircle2, XCircle, FileText, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
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
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<ReviewQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen])

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  async function handleOpen() {
    setIsLoading(true)
    const res = await getExamReviewData(examId)
    setIsLoading(false)
    
    if (res.success && res.data) {
      setData(res.data)
      setIsOpen(true)
      setCurrentIndex(0)
    } else {
      alert(res.error || "Gagal memuat data review.")
    }
  }

  const handleClose = () => setIsOpen(false)

  const currentQ = data[currentIndex]

  // Determine if a question is correct
  const isQuestionCorrect = (q: ReviewQuestion) => {
    if (!q.selectedOptionId) return false
    const maxScore = Math.max(...q.options.map((o) => o.score))
    const selected = q.options.find((o) => o.id === q.selectedOptionId)
    // TKP: any score > 0 is somewhat correct, but conventionally max is "correct".
    // Or we just show score inline instead of pass/fail for TKP.
    // For TWK/TIU maxScore is 5.
    return selected ? selected.score === maxScore && maxScore > 0 : false
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-bold text-sm transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Eye className="w-4 h-4" />}
          </div>
          Lihat Pembahasan
        </div>
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Backdrop */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          if (e.target === overlayRef.current) handleClose()
        }}
        style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      >
        {/* Modal Card */}
        {isOpen && data.length > 0 && (
          <div
            className={`relative w-full h-full sm:h-[90dvh] sm:max-w-5xl sm:rounded-3xl bg-slate-50 shadow-2xl flex flex-col transition-all duration-300 ${
              isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-brand-blue px-4 sm:px-6 py-4 text-white flex-shrink-0 sm:rounded-t-3xl border-b border-brand-blue/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Pembahasan Ujian
                  </p>
                  <h2 className="text-lg font-black tracking-tight leading-snug truncate">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors mt-0.5"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 min-h-0 flex-col md:flex-row">
              {/* Question Navigation Grid (Desktop Sidebar / Mobile Top bar) */}
              <div className="md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Navigasi Soal</h3>
                  <div className="text-[10px] text-slate-400 font-medium mt-1">
                    Total {data.length} soal • Kategori: {currentQ.category}
                  </div>
                </div>
                {/* Scrollable grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {/* Group by category if needed, or simple grid */}
                  <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                    {data.map((q, idx) => {
                      const isActive = idx === currentIndex
                      const isCorrect = isQuestionCorrect(q)
                      const isUnanswered = !q.selectedOptionId
                      
                      let btnCls = "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      if (isActive) btnCls = "bg-blue-50 border-blue-500 text-brand-blue-deep ring-2 ring-blue-500/20"
                      else if (isUnanswered) btnCls = "bg-slate-100 border-dashed border-slate-300 text-slate-400"
                      else if (isCorrect) btnCls = "bg-green-50 border-green-200 text-green-700"
                      else btnCls = "bg-red-50 border-red-200 text-red-700"

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-9 sm:h-10 rounded-xl border text-xs font-black transition-all ${btnCls}`}
                        >
                          {idx + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Main Panel */}
              <div className="flex-1 flex flex-col min-h-0 bg-white relative">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                  <div className="max-w-3xl mx-auto space-y-6 pb-20">
                    
                    {/* Header: Category & Number */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black text-slate-600">
                        <FileText className="w-3.5 h-3.5" /> Soal {currentIndex + 1}
                      </span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                        {currentQ.category}
                      </span>
                    </div>

                    {/* Question Content */}
                    <div 
                      className="prose prose-sm sm:prose-base max-w-none text-slate-800 font-medium leading-relaxed prose-p:my-2"
                      dangerouslySetInnerHTML={{ __html: currentQ.content }}
                    />

                    {/* Options */}
                    <div className="space-y-2 mt-6">
                      {currentQ.options.map((opt, i) => {
                        const isSelected = opt.id === currentQ.selectedOptionId
                        const isMaxScore = opt.score === Math.max(...currentQ.options.map(o => o.score)) && opt.score > 0
                        const isTKP = currentQ.category === "TKP"

                        let optCls = "border-slate-200 bg-white"
                        let textCls = "text-slate-600"
                        let icon = null

                        if (isTKP) {
                          if (isSelected) {
                            optCls = "border-brand-blue-light bg-blue-50 ring-1 ring-brand-blue-light"
                            textCls = "text-blue-900 font-bold"
                          }
                        } else {
                          if (isSelected && isMaxScore) {
                            optCls = "border-brand-green bg-brand-green-light/10 ring-1 ring-brand-green"
                            textCls = "text-brand-green-deep font-bold"
                            icon = <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
                          } else if (isSelected && !isMaxScore) {
                            optCls = "border-red-400 bg-red-50 ring-1 ring-red-400"
                            textCls = "text-red-900 font-bold"
                            icon = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          } else if (!isSelected && isMaxScore) {
                            optCls = "border-brand-green bg-brand-green-light/10 ring-1 ring-brand-green border-dashed"
                            textCls = "text-brand-green-deep font-bold"
                            icon = <CheckCircle2 className="w-5 h-5 text-brand-green/60 flex-shrink-0" />
                          }
                        }

                        const label = String.fromCharCode(65 + i) // A, B, C...

                        return (
                          <div
                            key={opt.id}
                            className={`flex sm:items-center items-start gap-3 p-3 rounded-xl border transition-all ${optCls}`}
                          >
                            <div className="flex-1 flex gap-3">
                              <span className={`w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-xs font-black text-slate-500 flex-shrink-0 mt-0.5 sm:mt-0 ${isSelected ? "bg-white border shadow-sm" : ""}`}>
                                {label}
                              </span>
                              <div
                                className={`text-sm sm:text-[15px] pt-0.5 sm:pt-0 ${textCls}`}
                                dangerouslySetInnerHTML={{ __html: opt.text }}
                              />
                            </div>
                            
                            <div className="flex items-center gap-3 ml-auto flex-shrink-0 pl-2">
                              {/* Score badge */}
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
                        <div className="mt-2 text-xs font-bold text-slate-400 italic">
                          Kamu tidak menjawab soal ini. (Kosong)
                        </div>
                      )}
                    </div>

                    {/* Explanation Section */}
                    {currentQ.explanation && (
                      <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6">
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

                {/* Bottom Navigation */}
                <div className="border-t border-slate-100 bg-white p-4 flex items-center justify-between flex-shrink-0 absolute bottom-0 left-0 right-0 w-full rounded-b-3xl">
                  <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  <div className="text-xs font-bold text-slate-400 tracking-widest">
                    {currentIndex + 1} / {data.length}
                  </div>

                  <button
                    onClick={() => setCurrentIndex(Math.min(data.length - 1, currentIndex + 1))}
                    disabled={currentIndex === data.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Berikutnya</span> <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </>
  )
}
