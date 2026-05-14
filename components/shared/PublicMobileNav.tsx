"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  CreditCard,
  LogIn,
  Star,
  Target,
  FileText,
  MessageSquare,
  HelpCircle,
  Mail,
  UserPlus,
  LayoutDashboard,
  X,
  Sparkles,
  Info,
  ClipboardList,
  GraduationCap,
  Brain,
  BarChart3,
  PieChart,
  Trophy,
  ShoppingCart
} from "lucide-react";

const NAV_LINKS = [
  { label: "Keunggulan", href: "/#kenapa-kami", icon: Star, color: "text-orange-500", bg: "bg-orange-100" },
  { label: "Fitur Utama", href: "/#fitur-unggulan", icon: Target, color: "text-blue-500", bg: "bg-blue-100" },
  { label: "Artikel", href: "/artikel", icon: FileText, color: "text-purple-500", bg: "bg-purple-100" },
  { label: "Testimoni", href: "/#testimoni", icon: MessageSquare, color: "text-pink-500", bg: "bg-pink-100" },
  { label: "Tentang Kami", href: "/#tentang", icon: Info, color: "text-teal-500", bg: "bg-teal-100" },
  { label: "Paket Belajar", href: "/#harga", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-100" },
  { label: "Kontak", href: "/#kontak", icon: Mail, color: "text-rose-500", bg: "bg-rose-100" },
];

const DASHBOARD_PREVIEW_MODULES = [
  { icon: ClipboardList,   label: "Try Out CAT",  href: "/register?ref=mobile_drawer_tryout",       color: "#7C3AED", bg: "#F5F3FF" },
  { icon: GraduationCap,   label: "Learning Hub", href: "/register?ref=mobile_drawer_learning",    color: "#0891B2", bg: "#ECFEFF" },
  { icon: Brain,           label: "Psikotes",     href: "/register?ref=mobile_drawer_psychology",  color: "#DB2777", bg: "#FDF2F8" },
  { icon: BarChart3,       label: "Performa",     href: "/register?ref=mobile_drawer_performance", color: "#059669", bg: "#ECFDF5" },
  { icon: PieChart,        label: "Statistik",    href: "/register?ref=mobile_drawer_statistik",   color: "#D97706", bg: "#FFFBEB" },
  { icon: Trophy,          label: "Ranking",      href: "/register?ref=mobile_drawer_leaderboard", color: "#EA580C", bg: "#FFF7ED" },
];

export function PublicMobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Handle route change to close drawer
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <>
      {/* 1. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 pt-2 pb-safe z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center relative">
          
          {/* Tab 1: Home */}
          <Link href="/" className="flex flex-col items-center gap-1 w-14 relative group">
            {pathname === "/" && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue rounded-b-full"></div>
            )}
            <div className={`p-1.5 rounded-xl transition-all ${pathname === "/" ? "text-brand-blue bg-blue-50" : "text-slate-400 hover:text-slate-600"}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-tight ${pathname === "/" ? "text-brand-blue" : "text-slate-500"}`}>
              Beranda
            </span>
          </Link>

          {/* Tab 2: Fitur */}
          <Link href="/#fitur-unggulan" className="flex flex-col items-center gap-1 w-14 relative group">
            <div className="p-1.5 rounded-xl transition-all text-slate-400 hover:text-slate-600">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight text-slate-500">
              Fitur
            </span>
          </Link>

          {/* Tab 3: CENTER FAB (Menu) */}
          <div className="flex flex-col items-center w-14 relative z-50">
            <button
              onClick={toggleDrawer}
              className="absolute -top-10 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-[0_8px_32px_rgba(30,115,190,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-white"
              style={{
                background: "linear-gradient(135deg, #1E73BE 0%, #2DBE60 100%)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 24px rgba(30,115,190,0.4)"
              }}
              aria-label="Open Menu"
            >
              <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity"></div>
              <Sparkles className="absolute top-2 right-2 w-3 h-3 text-white/70" />
              <LayoutDashboard className="w-6 h-6" />
            </button>
            
            {/* Invisible placeholder to align "Menu" text perfectly */}
            <div className="h-6 w-full opacity-0 pointer-events-none"></div>
            <span className="text-[10px] font-bold tracking-tight text-slate-500 mt-1">Menu</span>
          </div>

          {/* Tab 4: Harga */}
          <Link href="/#harga" className="flex flex-col items-center gap-1 w-14 relative group">
            <div className="p-1.5 rounded-xl transition-all text-slate-400 hover:text-slate-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight text-slate-500">
              Harga
            </span>
          </Link>

          {/* Tab 5: Masuk */}
          <Link href="/login" className="flex flex-col items-center gap-1 w-14 relative group">
            {pathname === "/login" && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue rounded-b-full"></div>
            )}
            <div className={`p-1.5 rounded-xl transition-all ${pathname === "/login" ? "text-brand-blue bg-blue-50" : "text-slate-400 hover:text-slate-600"}`}>
              <LogIn className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold tracking-tight ${pathname === "/login" ? "text-brand-blue" : "text-slate-500"}`}>
              Masuk
            </span>
          </Link>
        </div>
      </nav>

      {/* 2. Full Screen App Drawer (Bottom Sheet) */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={toggleDrawer}
        ></div>

        {/* Drawer Content */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{
            maxHeight: "92vh",
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2 w-full touch-pan-y" onClick={toggleDrawer}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
          </div>

          <div className="flex-1 overflow-y-auto pb-safe">
            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Eksplorasi</h2>
                  <p className="text-sm text-slate-500 font-medium">Jelajahi fitur COBA PNS</p>
                </div>
                <button 
                  onClick={toggleDrawer}
                  className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid Menu */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {NAV_LINKS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      href={item.href} 
                      key={index}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-active:scale-95 shadow-sm border border-white/50`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Feature Preview Section (Soft Selling) */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-4 bg-brand-green rounded-full"></div>
                  <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wide">Fitur Eksklusif</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {DASHBOARD_PREVIEW_MODULES.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link 
                        href={item.href} 
                        key={index}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex flex-col items-center gap-2 group p-2 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all active:scale-95"
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ background: item.bg, color: item.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-slate-500 font-medium">✨ Daftar akun untuk membuka semua fitur</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Link 
                  href="/register"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 w-full bg-gradient-to-r from-brand-blue to-brand-green text-white p-3 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  <div className="bg-white/20 p-2 rounded-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-bold">Daftar Sekarang</div>
                    <div className="text-[11px] text-white/80 font-medium">Coba gratis sistem CAT kami</div>
                  </div>
                </Link>
                
                <Link 
                  href="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 w-full bg-white text-slate-700 p-3 rounded-xl shadow-sm border border-slate-200 transition-transform active:scale-95"
                >
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <LogIn className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-bold">Masuk ke Akun</div>
                    <div className="text-[11px] text-slate-500 font-medium">Lanjutkan progres belajarmu</div>
                  </div>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
