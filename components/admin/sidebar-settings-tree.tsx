"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, ChevronDown, ChevronRight, Mail, KeyRound, Database } from "lucide-react"

export function SidebarSettingsTree() {
  const pathname = usePathname() || ""
  const isSettingsActive = pathname.startsWith("/admin/settings")
  const [isOpen, setIsOpen] = useState(isSettingsActive)

  // Ensure it stays open if we navigate into it externally
  useEffect(() => {
    if (isSettingsActive) {
      setIsOpen(true)
    }
  }, [isSettingsActive])

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${isSettingsActive ? 'text-teal-700 bg-teal-50 shadow-inner' : 'text-slate-600 hover:bg-slate-200/50 hover:text-teal-600'}`}
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="flex flex-col mt-1 ml-6 pl-3 border-l-2 border-slate-100 space-y-1 animate-in slide-in-from-top-1 fade-in duration-200">
          <Link 
            href="/admin/settings/general" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin/settings/general' ? 'text-teal-700 bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            General
          </Link>
          <Link 
            href="/admin/settings/change-password" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin/settings/change-password' ? 'text-teal-700 bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Change Password
          </Link>
          <Link 
            href="/admin/settings/email" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin/settings/email' ? 'text-teal-700 bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Templates
          </Link>
          <Link 
            href="/admin/settings/lookups" 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin/settings/lookups' ? 'text-teal-700 bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <Database className="w-3.5 h-3.5" />
            Lookup Data
          </Link>
        </div>
      )}
    </div>
  )
}
