"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Brain, ChevronDown, ChevronRight, Zap } from "lucide-react"

export function SidebarPsychIqTree() {
  const pathname = usePathname() || ""
  const searchParams = useSearchParams()
  const tab = searchParams?.get("tab") || "psych"
  const isPsychIqActive = pathname.startsWith("/admin/content/psych-iq")
  const [isOpen, setIsOpen] = useState(isPsychIqActive)

  // Ensure it stays open if we navigate into it externally
  useEffect(() => {
    if (isPsychIqActive) {
      setIsOpen(true)
    }
  }, [isPsychIqActive])

  const isPsychActive = isPsychIqActive && tab === "psych"
  const isIqActive = isPsychIqActive && tab === "iq"

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${isPsychIqActive ? 'text-brand-blue-deep bg-blue-50 shadow-inner' : 'text-slate-600 hover:bg-slate-200/50 hover:text-brand-blue'}`}
      >
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5" />
          <span>Psikotes & IQ</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="flex flex-col mt-1 ml-6 pl-3 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <Link 
            href="/admin/content/psych-iq?tab=psych" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isPsychActive ? 'text-brand-blue-deep bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <Brain className="w-3.5 h-3.5" />
            Bank Psikotes
          </Link>
          <Link 
            href="/admin/content/psych-iq?tab=iq" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isIqActive ? 'text-brand-blue-deep bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <Zap className="w-3.5 h-3.5" />
            Bank Soal IQ
          </Link>
        </div>
      )}
    </div>
  )
}
