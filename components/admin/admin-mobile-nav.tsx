"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  CreditCard,
  Brain,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Newspaper,
  Mail,
  Grid3X3,
  X,
  ChevronRight,
  Sparkles,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

/* ── 4 items in bottom bar (2 left + FAB center + 2 right) ─────── */
const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users,           label: "Users",     href: "/admin/users" },
  // [CENTER FAB]
  { icon: CreditCard,      label: "Revenue",   href: "/admin/transactions" },
  { icon: Settings,        label: "Settings",  href: "/admin/settings" },
]

/* ── All admin modules for the drawer ──────────────────────────── */
const DRAWER_MODULES = [
  { icon: LayoutDashboard, label: "Dashboard",     href: "/admin",                      color: "#1E73BE", bg: "#EFF6FF" },
  { icon: Users,           label: "Users",         href: "/admin/users",                color: "#7C3AED", bg: "#F5F3FF" },
  { icon: FileText,        label: "Question Bank", href: "/admin/content/questions",    color: "#0891B2", bg: "#ECFEFF" },
  { icon: ClipboardList,   label: "Exam Builder",  href: "/admin/content/exams",        color: "#DB2777", bg: "#FDF2F8" },
  { icon: BookOpen,        label: "Material CMS",  href: "/admin/materials",            color: "#059669", bg: "#ECFDF5" },
  { icon: Newspaper,       label: "Artikel/Blog",  href: "/admin/articles",             color: "#D97706", bg: "#FFFBEB" },
  { icon: MessageSquare,   label: "Testimonials",  href: "/admin/testimonials/manage",  color: "#EA580C", bg: "#FFF7ED" },
  { icon: CreditCard,      label: "Transaksi",     href: "/admin/transactions",         color: "#1E73BE", bg: "#EFF6FF" },
  { icon: BarChart3,       label: "Payment Logs",  href: "/admin/payment-logs",         color: "#475569", bg: "#F8FAFC" },
  { icon: Brain,           label: "Psych & IQ",    href: "/admin/content/psychology",   color: "#BE185D", bg: "#FDF2F8" },
  { icon: Mail,            label: "Email Settings",href: "/admin/settings/email",       color: "#0369A1", bg: "#E0F2FE" },
  { icon: Settings,        label: "Settings",      href: "/admin/settings",             color: "#475569", bg: "#F8FAFC" },
  { icon: HelpCircle,      label: "Help",          href: "/dashboard/help",             color: "#475569", bg: "#F8FAFC" },
]

export function AdminMobileNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* Resolve active href — check exact match first, then prefix */
  const activeHref = (() => {
    if (pathname === "/admin") return "/admin"
    const match = BOTTOM_NAV.find(
      (n) => n.href !== "/admin" && pathname.startsWith(n.href)
    )
    return match?.href ?? pathname
  })()

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  /* Lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  return (
    <>
      {/* ── Bottom Nav Bar ──────────────────────────────────────── */}
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
                  background: active
                    ? "linear-gradient(180deg, rgba(30,115,190,0.08) 0%, rgba(30,115,190,0) 100%)"
                    : "transparent",
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
                  style={{ transform: active ? "translateY(-1px)" : "none" }}
                />
                <span className="text-[10px] font-bold tracking-tight" style={{ letterSpacing: "-0.01em" }}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* ── Center FAB ─────────────────────────────────────── */}
          <div className="relative flex flex-col items-center justify-center gap-1 flex-shrink-0 w-16 h-full">
            {/* Invisible placeholder to align "Menu" text with other labels */}
            <div className="w-[24px] h-[24px]" />
            <span className="text-[10px] font-bold tracking-tight" style={{ color: "#94a3b8", letterSpacing: "-0.01em" }}>
              Menu
            </span>
            <button
              id="admin-mobile-menu-fab"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka semua menu admin"
              className="absolute -top-7 flex items-center justify-center rounded-full transition-transform active:scale-95"
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #1E73BE 0%, #2A8BD6 50%, #2DBE60 100%)",
                boxShadow: "0 8px 24px rgba(30,115,190,0.45), inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.15)",
                border: "4px solid #ffffff",
              }}
            >
              <Grid3X3 className="w-6 h-6 text-white relative z-10" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
              <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)" }} />
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
                  background: active
                    ? "linear-gradient(180deg, rgba(30,115,190,0.08) 0%, rgba(30,115,190,0) 100%)"
                    : "transparent",
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
                  style={{ transform: active ? "translateY(-1px)" : "none" }}
                />
                <span className="text-[10px] font-bold tracking-tight" style={{ letterSpacing: "-0.01em" }}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Full-Screen App Drawer ──────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer sheet */}
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
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">Admin Menu</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Akses semua fitur Admin Portal</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                id="admin-mobile-menu-close"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Admin badge strip */}
            <div
              className="mx-4 mb-4 flex-shrink-0 px-4 py-3 rounded-2xl flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(30,115,190,0.08), rgba(45,190,96,0.08))",
                border: "1px solid rgba(30,115,190,0.12)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1E73BE, #2DBE60)" }}
              >
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">Admin Console</p>
                <p className="text-[11px] text-slate-500 font-semibold">🔐 Super Admin Access</p>
              </div>
            </div>

            {/* Scrollable grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ overscrollBehavior: "contain" }}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Manajemen Konten</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {DRAWER_MODULES.slice(0, 10).map(({ icon: Icon, label, href, color, bg }, i) => {
                  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href))
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 relative"
                      style={{
                        background: active ? `linear-gradient(135deg, ${color}18, ${color}12)` : "#ffffff",
                        border: active ? `1.5px solid ${color}30` : "1.5px solid rgba(0,0,0,0.05)",
                        boxShadow: active ? `0 4px 16px ${color}20` : "0 1px 4px rgba(0,0,0,0.04)",
                        animationDelay: `${i * 30}ms`,
                        animation: "fadeInUp 0.35s ease both",
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{label}</span>
                      {active && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      )}
                    </Link>
                  )
                })}
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sistem & Konfigurasi</p>
              <div className="space-y-2 mb-4">
                {DRAWER_MODULES.slice(10).map(({ icon: Icon, label, href, color }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
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
    </>
  )
}
