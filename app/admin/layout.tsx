import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Mail,
  ClipboardList,
  BookOpen,
  CreditCard,
  Brain,
} from "lucide-react";

import Link from "next/link";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { BulkImportModal } from "@/components/admin/bulk-import-modal";
import { SidebarSettingsTree } from "@/components/admin/sidebar-settings-tree";
import { SidebarPsychIqTree } from "@/components/admin/sidebar-psych-iq-tree";

export const metadata: Metadata = {
  title: "Admin Portal | COBA PNS",
  description: "COBA PNS Admin — Revenue & Analytics Overview.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sipns-session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-slate-900">
      
      {/* ── Sidebar (Desktop) ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col h-screen sticky left-0 top-0 w-64 border-r border-slate-200 bg-slate-50 p-4 space-y-2 z-20">
        <div className="px-2 py-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-inner">
              <span className="font-extrabold text-xl font-serif">S</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-teal-800 leading-none tracking-tight">COBA PNS Admin</h2>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Institutional</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 hover:text-teal-600 rounded-lg font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 hover:text-teal-600 rounded-lg font-medium transition-all">
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </Link>
          <Link href="/admin/content/questions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 hover:text-teal-600 rounded-lg font-medium transition-all">
            <FileText className="w-5 h-5" />
            <span>Question Bank</span>
          </Link>
          <SidebarPsychIqTree />

          <Link href="/admin/content/exams" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 hover:text-teal-600 rounded-lg font-medium transition-all">
            <ClipboardList className="w-5 h-5" />
            <span>Exam Builder</span>
          </Link>
          <Link href="/admin/materials" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 hover:text-teal-600 rounded-lg font-medium transition-all">
            <BookOpen className="w-5 h-5" />
            <span>Material CMS</span>
          </Link>
          <Link href="/admin/transactions" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200/50 hover:text-teal-600 rounded-lg font-medium transition-all">
            <CreditCard className="w-5 h-5" />
            <span>Transaksi</span>
          </Link>
          <SidebarSettingsTree />
        </nav>
      </aside>

      {/* ── Main Content Canvas ─────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0 h-screen overflow-y-auto w-full">
        {/* TopAppBar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-8 py-4 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tighter text-teal-700 antialiased">COBA PNS Portal</h1>
            <div className="relative group hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="pl-10 pr-4 py-2 text-slate-900 bg-slate-100 border-none outline-none rounded-full w-64 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all placeholder:text-slate-500" 
                placeholder="Search analytics..." 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <ProfileDropdown name={session.name} initial={session.name.charAt(0).toUpperCase()} role={session.role} />
          </div>
        </header>

        {children}
      </main>

      {/* Responsive Bottom Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        <Link href="/admin" className="flex flex-col items-center gap-1 text-slate-400 p-2 hover:text-slate-600 transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Dashboard</span>
        </Link>
        <Link href="/admin/users" className="flex flex-col items-center gap-1 text-slate-400 p-2 hover:text-slate-600 transition-colors">
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Users</span>
        </Link>
        <Link href="/admin/content/questions" className="flex flex-col items-center gap-1 text-slate-400 p-2 hover:text-slate-600 transition-colors">
           <FileText className="w-5 h-5" />
           <span className="text-[10px] font-bold tracking-tight">CMS</span>
        </Link>
        <Link href="/admin/settings/email" className="flex flex-col items-center gap-1 text-slate-400 p-2 hover:text-slate-600 transition-colors">
           <Mail className="w-5 h-5" />
           <span className="text-[10px] font-bold tracking-tight">Emails</span>
        </Link>
        <Link href="/admin/transactions" className="flex flex-col items-center gap-1 text-slate-400 p-2 hover:text-slate-600 transition-colors">
           <CreditCard className="w-5 h-5" />
           <span className="text-[10px] font-bold tracking-tight">Revenue</span>
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center gap-1 text-slate-400 p-2 hover:text-slate-600 transition-colors">
           <Settings className="w-5 h-5" />
           <span className="text-[10px] font-bold tracking-tight">Settings</span>
        </Link>
      </nav>

      {/* Global Background Workers & Modals */}
      <BulkImportModal />
    </div>
  );
}
