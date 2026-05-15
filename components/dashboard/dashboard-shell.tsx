"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  ClipboardList,
  PieChart,
  ShoppingCart,
  Bell,
  BarChart3,
  GraduationCap,
  Trophy,
  Brain,
  Grid3X3,
  X,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Lightbulb,
  BookMarked,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ProfileDropdown } from "@/components/profile-dropdown"

type NavItem = {
  icon: any
  label: string
  href?: string
  color: string
  bg: string
  subItems?: { label: string; href: string }[]
}

/* ── All navigation items ──────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Home",          href: "/dashboard",              color: "#1E73BE", bg: "#EFF6FF" },
  { 
    icon: ClipboardList,   
    label: "Try Out",      
    color: "#7C3AED", 
    bg: "#F5F3FF",
    subItems: [
      { label: "SKD", href: "/dashboard/exams" },
      { label: "SKB", href: "/dashboard/skb" }
    ]
  },
  { icon: GraduationCap,   label: "Learning Hub",  href: "/dashboard/learning",     color: "#0891B2", bg: "#ECFEFF" },
  { icon: Brain,           label: "Psikotes & IQ", href: "/dashboard/psychology",   color: "#DB2777", bg: "#FDF2F8" },
  { icon: BarChart3,       label: "Performa",      href: "/dashboard/performance",  color: "#059669", bg: "#ECFDF5" },
  { icon: Lightbulb,       label: "Rekomendasi",   href: "/dashboard/diagnostik",   color: "#7C3AED", bg: "#F5F3FF" },
  { icon: PieChart,        label: "Statistik",     href: "/dashboard/statistik",    color: "#D97706", bg: "#FFFBEB" },
  { icon: Trophy,          label: "Leaderboard",   href: "/dashboard/leaderboard",  color: "#EA580C", bg: "#FFF7ED" },
  { icon: ShoppingCart,    label: "Pembelian",     href: "/dashboard/pembelian",    color: "#1E73BE", bg: "#EFF6FF" },
]

/* ── 4 items shown in mobile bottom bar (2 left + 2 right of FAB) ── */
const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: "Home",     href: "/dashboard" },
  { icon: ClipboardList,   label: "Try Out",  href: "/dashboard/exams" },
  // [CENTER FAB placeholder]
  { icon: GraduationCap,   label: "Belajar",  href: "/dashboard/learning" },
  { icon: ShoppingCart,    label: "Beli",     href: "/dashboard/pembelian" },
]

/* ── App Drawer menu groups ──────────────────────────────────────── */
const DRAWER_MODULES = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/dashboard",             color: "#1E73BE", bg: "#EFF6FF" },
  { icon: ClipboardList,   label: "Try Out SKD",  href: "/dashboard/exams",       color: "#7C3AED", bg: "#F5F3FF" },
  { icon: BookMarked,      label: "Try Out SKB",  href: "/dashboard/skb",         color: "#EA580C", bg: "#FFF7ED" },
  { icon: GraduationCap,   label: "Belajar",      href: "/dashboard/learning",    color: "#0891B2", bg: "#ECFEFF" },
  { icon: Brain,           label: "Psikotes",     href: "/dashboard/psychology",  color: "#DB2777", bg: "#FDF2F8" },
  { icon: BarChart3,       label: "Performa",     href: "/dashboard/performance", color: "#059669", bg: "#ECFDF5" },
  { icon: Lightbulb,       label: "Rekomendasi",  href: "/dashboard/diagnostik",  color: "#7C3AED", bg: "#F5F3FF" },
  { icon: PieChart,        label: "Statistik",    href: "/dashboard/statistik",   color: "#D97706", bg: "#FFFBEB" },
  { icon: Trophy,          label: "Leaderboard",  href: "/dashboard/leaderboard", color: "#EA580C", bg: "#FFF7ED" },
  { icon: ShoppingCart,    label: "Pembelian",    href: "/dashboard/pembelian",   color: "#1E73BE", bg: "#EFF6FF" },
  { icon: Settings,        label: "Pengaturan",   href: "/dashboard/settings",    color: "#475569", bg: "#F8FAFC" },
  { icon: HelpCircle,      label: "Bantuan",      href: "/dashboard/help",        color: "#475569", bg: "#F8FAFC" },
]

interface DashboardShellProps {
  children: React.ReactNode
  activeHref: string
  user: { name: string; role: string; tier?: string }
}

export function DashboardShell({ children, activeHref, user }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  
  // Initialize open state for sub-menus based on current active route
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    NAV_ITEMS.forEach(item => {
      if (item.subItems) {
        initialState[item.label] = item.subItems.some(sub => activeHref.startsWith(sub.href)) || item.label === "Try Out"
      }
    })
    return initialState
  })

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-slate-900">

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col h-screen sticky left-0 top-0 w-64 border-r border-slate-200 bg-white p-4 space-y-2 z-20">
        {/* Logo */}
        <div className="px-2 py-4 mb-4">
          <div className="flex flex-col justify-center items-center text-center py-2">
            <img src="/icon-cpns.png" alt="COBA PNS Logo" className="h-20 w-auto -mb-2" />
            <h2 className="text-lg font-black leading-none tracking-tight">
              <span className="text-brand-blue">COBA</span>
              <span className="text-brand-green">PNS</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">Student Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const { icon: Icon, label, href, subItems } = item
            
            if (subItems) {
              const isActiveGroup = subItems.some(sub => activeHref.startsWith(sub.href))
              const isOpen = openMenus[label]
              return (
                <div key={label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                      isActiveGroup
                        ? "text-brand-blue bg-blue-50/50"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActiveGroup ? "text-brand-blue" : ""}`} />
                      <span>{label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="ml-9 space-y-1 pb-1">
                      {subItems.map(sub => {
                        const active = activeHref === sub.href || activeHref.startsWith(`${sub.href}/`)
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`block px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                              active
                                ? "text-white font-semibold shadow-sm"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                            style={active ? { background: "linear-gradient(135deg, #1E73BE, #2DBE60)" } : {}}
                          >
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href!}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                  active
                    ? "text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                style={active ? { background: "linear-gradient(135deg, #1E73BE, #2DBE60)" } : {}}
              >
                <Icon className={`w-5 h-5 ${active ? "text-white" : ""}`} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0 h-screen overflow-y-auto">
        {/* Top App Bar */}
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-4 border-b border-slate-200 shadow-sm min-h-[56px]">
          {/* Mobile: Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <img src="/icon-cpns.png" alt="COBA PNS" className="h-8 w-auto" />
            <span className="text-sm font-black tracking-tight">
              <span className="text-brand-blue">COBA</span>
              <span className="text-brand-green">PNS</span>
            </span>
          </div>
          {/* Desktop: empty spacer */}
          <div className="hidden md:flex items-center gap-6" />

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

      {/* ════════════════════════════════════════════════════════════════
          Mobile Bottom Navigation Bar
          ════════════════════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.07)",
        }}
      >
        <div className="flex items-center justify-around px-1 pb-safe" style={{ height: "64px" }}>

          {/* Left 2 items */}
          {BOTTOM_NAV.slice(0, 2).map(({ href, icon: Icon, label }) => {
            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95"
                style={{
                  color: active ? "#1E73BE" : "#94a3b8",
                  background: active ? "linear-gradient(180deg, rgba(30,115,190,0.08) 0%, rgba(30,115,190,0) 100%)" : "transparent"
                }}
              >
                {active && (
                  <span
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: "#1E73BE" }}
                  />
                )}
                <Icon
                  className="w-[24px] h-[24px] transition-transform"
                  style={{
                    transform: active ? "translateY(-1px)" : "none",
                  }}
                />
                <span className="text-[10px] font-bold tracking-tight" style={{ letterSpacing: "-0.01em" }}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* ── Center FAB (Menu Button) ───────────────────────────── */}
          <div className="relative flex flex-col items-center justify-center gap-1 flex-shrink-0 w-16 h-full">
            {/* Invisible placeholder matching icon size to align the text perfectly */}
            <div className="w-[24px] h-[24px]" />
            <span className="text-[10px] font-bold tracking-tight" style={{ color: "#94a3b8", letterSpacing: "-0.01em" }}>
              Menu
            </span>

            <button
              id="mobile-menu-fab"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka semua menu"
              className="absolute -top-7 flex items-center justify-center rounded-full transition-transform active:scale-95 group"
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #1E73BE 0%, #2A8BD6 50%, #2DBE60 100%)",
                boxShadow: "0 8px 24px rgba(30,115,190,0.45), inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.15)",
                border: "4px solid #ffffff",
              }}
            >
              <Grid3X3 className="w-6 h-6 text-white relative z-10" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
              
              {/* Glass/Shine overlay */}
              <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)" }} />
              
              {/* Subtle sparkles to make it dynamic */}
              <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white/90 animate-pulse z-10" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
            </button>
          </div>

          {/* Right 2 items */}
          {BOTTOM_NAV.slice(2).map(({ href, icon: Icon, label }) => {
            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95"
                style={{
                  color: active ? "#1E73BE" : "#94a3b8",
                  background: active ? "linear-gradient(180deg, rgba(30,115,190,0.08) 0%, rgba(30,115,190,0) 100%)" : "transparent"
                }}
              >
                {active && (
                  <span
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: "#1E73BE" }}
                  />
                )}
                <Icon
                  className="w-[24px] h-[24px] transition-transform"
                  style={{
                    transform: active ? "translateY(-1px)" : "none",
                  }}
                />
                <span className="text-[10px] font-bold tracking-tight" style={{ letterSpacing: "-0.01em" }}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          Full-Screen App Drawer (Mobile Menu)
          ════════════════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet — slides up from bottom */}
          <div
            className="md:hidden fixed left-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
              borderRadius: "28px 28px 0 0",
              maxHeight: "92vh",     /* fallback for Instagram IAB / old WebViews */
              boxShadow: "0 -16px 64px rgba(30,115,190,0.15), 0 -2px 8px rgba(0,0,0,0.06)",
              animation: "drawerSlideUp 0.32s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Semua Menu</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Akses semua fitur COBA PNS</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                id="mobile-menu-close"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User info strip */}
            <div
              className="mx-4 mb-4 flex-shrink-0 px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(30,115,190,0.08), rgba(45,190,96,0.08))", border: "1px solid rgba(30,115,190,0.12)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1E73BE, #2DBE60)" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {user.tier === "MASTER" ? "🏆 Master Scholar" : user.tier === "ELITE" ? "⚡ Elite Scholar" : "🎓 Free Scholar"}
                </p>
              </div>
              <Link
                href="/dashboard/settings"
                className="ml-auto flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 shadow-sm"
                onClick={() => setDrawerOpen(false)}
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module Grid — scrollable */}
            <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ overscrollBehavior: "contain" }}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Modul Belajar</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {DRAWER_MODULES.slice(0, 8).map(({ icon: Icon, label, href, color, bg }, i) => {
                  const active = href === activeHref
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 relative"
                      style={{
                        background: active
                          ? `linear-gradient(135deg, ${color}18, ${color}12)`
                          : "#ffffff",
                        border: active
                          ? `1.5px solid ${color}30`
                          : "1.5px solid rgba(0,0,0,0.05)",
                        boxShadow: active
                          ? `0 4px 16px ${color}20`
                          : "0 1px 4px rgba(0,0,0,0.04)",
                        animationDelay: `${i * 30}ms`,
                        animation: "fadeInUp 0.35s ease both",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{label}</span>
                      {active && (
                        <span
                          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                          style={{ background: color }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Support section */}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Akun & Dukungan</p>
              <div className="space-y-2 mb-4">
                {DRAWER_MODULES.slice(8).map(({ icon: Icon, label, href, color }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-98"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes drawerSlideUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1;   }
        }
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
