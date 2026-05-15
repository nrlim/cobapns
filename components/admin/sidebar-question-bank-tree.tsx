"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, ChevronDown, ChevronRight, BookMarked } from "lucide-react"

export function SidebarQuestionBankTree() {
  const pathname = usePathname() || ""
  const isQuestionBankActive = pathname.startsWith("/admin/content/questions") || pathname.startsWith("/admin/content/skb-questions")
  const [isOpen, setIsOpen] = useState(isQuestionBankActive)

  // Ensure it stays open if we navigate into it externally
  useEffect(() => {
    if (isQuestionBankActive) {
      setIsOpen(true)
    }
  }, [isQuestionBankActive])

  const isSkdActive = pathname.startsWith("/admin/content/questions")
  const isSkbActive = pathname.startsWith("/admin/content/skb-questions")

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${isQuestionBankActive ? 'text-brand-blue-deep bg-blue-50 shadow-inner' : 'text-slate-600 hover:bg-slate-200/50 hover:text-brand-blue'}`}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          <span>Bank Soal Exam</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="flex flex-col mt-1 ml-6 pl-3 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <Link 
            href="/admin/content/questions" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSkdActive ? 'text-brand-blue-deep bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            SKD Bank Soal
          </Link>
          <Link 
            href="/admin/content/skb-questions" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSkbActive ? 'text-orange-600 bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            SKB Bank Soal
          </Link>
        </div>
      )}
    </div>
  )
}
