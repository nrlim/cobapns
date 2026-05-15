"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, ChevronDown, ChevronRight, PenTool } from "lucide-react"

export function SidebarExamBuilderTree() {
  const pathname = usePathname() || ""
  const isExamBuilderActive = pathname.startsWith("/admin/content/exams") || pathname.startsWith("/admin/content/skb-exams")
  const [isOpen, setIsOpen] = useState(isExamBuilderActive)

  // Ensure it stays open if we navigate into it externally
  useEffect(() => {
    if (isExamBuilderActive) {
      setIsOpen(true)
    }
  }, [isExamBuilderActive])

  const isSkdActive = pathname.startsWith("/admin/content/exams")
  const isSkbActive = pathname.startsWith("/admin/content/skb-exams")

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${isExamBuilderActive ? 'text-brand-blue-deep bg-blue-50 shadow-inner' : 'text-slate-600 hover:bg-slate-200/50 hover:text-brand-blue'}`}
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5" />
          <span>Exam Builder</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="flex flex-col mt-1 ml-6 pl-3 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <Link 
            href="/admin/content/exams" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSkdActive ? 'text-brand-blue-deep bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            SKD Exam Builder
          </Link>
          <Link 
            href="/admin/content/skb-exams" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSkbActive ? 'text-orange-600 bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <PenTool className="w-3.5 h-3.5" />
            SKB Exam Builder
          </Link>
        </div>
      )}
    </div>
  )
}
