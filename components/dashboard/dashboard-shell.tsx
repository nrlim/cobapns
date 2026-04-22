"use client"

import {
  LayoutDashboard,
  ClipboardList,
  PieChart,
  ShoppingCart,
  Bell,
  Search,
  BarChart3,
  GraduationCap,
  Trophy,
  Brain,
} from "lucide-react"
import Link from "next/link"
import { ProfileDropdown } from "@/components/profile-dropdown"

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: ClipboardList, label: "Try Out", href: "/dashboard/exams" },
  { icon: GraduationCap, label: "Learning Hub", href: "/dashboard/learning" },
  { icon: Brain, label: "Psikotes & IQ", href: "/dashboard/psychology" },
  { icon: BarChart3, label: "Performa", href: "/dashboard/performance" },
  { icon: PieChart, label: "Statistik", href: "/dashboard/statistik" },
  { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
  { icon: ShoppingCart, label: "Pembelian", href: "/dashboard/pembelian" },
]

const MOBILE_NAV = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: ClipboardList, label: "Try Out", href: "/dashboard/exams" },
  { icon: GraduationCap, label: "Belajar", href: "/dashboard/learning" },
  { icon: Brain, label: "Psikotes", href: "/dashboard/psychology" },
  { icon: Trophy, label: "Peringkat", href: "/dashboard/leaderboard" },
]

interface DashboardShellProps {
  children: React.ReactNode
  activeHref: string
  user: { name: string; role: string; tier?: string }
}

export function DashboardShell({ children, activeHref, user }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-slate-900">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col h-screen sticky left-0 top-0 w-64 border-r border-slate-200 bg-slate-50 p-4 space-y-2 z-20">
        {/* Logo */}
        <div className="px-2 py-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-inner">
              <span className="font-extrabold text-xl font-serif">S</span>
            </div>
            <div>
              <h2 className="text-base font-black text-teal-800 leading-none tracking-tight">COBA PNS</h2>
              <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm ${active
                  ? "bg-teal-50 text-teal-700 shadow-sm font-semibold border border-teal-100"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-teal-600"
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-teal-600" : ""}`} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>


      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0 h-screen overflow-y-auto">
        {/* Top App Bar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-8 py-4 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-6" />
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
            <ProfileDropdown
              name={user.name}
              initial={user.name.charAt(0).toUpperCase()}
              role={user.role}
              tier={user.tier}
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        {MOBILE_NAV.map(({ href, icon: Icon, label }) => {
          const active = href === activeHref
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${active ? "text-teal-700" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
