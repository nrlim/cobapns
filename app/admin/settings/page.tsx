import React from "react"
import { ShieldCheck, Lock, Settings2, KeyRound } from "lucide-react"
import { ChangePasswordForm } from "./client"

export const metadata = {
  title: "General Settings - COBA PNS Admin",
  description: "Kelola konfigurasi umum dan keamanan akun platform COBA PNS.",
}

export default function SettingsGeneralPage() {
  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">

      {/* ── Page Hero ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1 lg:mb-2">
            Admin Settings
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            General Settings
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Konfigurasi dasar dan keamanan akun platform COBA PNS.
          </p>
        </div>
      </div>

      {/* ── Bento Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: Settings2,  label: "Platform",       value: "COBA PNS v1.0",   color: "bg-slate-50 border-slate-200 text-slate-600" },
          { icon: ShieldCheck, label: "Keamanan Akun", value: "Aktif",           color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
          { icon: KeyRound,   label: "Password",       value: "Terenkripsi",     color: "bg-teal-50 border-teal-100 text-teal-600"    },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`rounded-2xl border p-5 flex items-center gap-4 ${color}`}>
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</p>
              <p className="text-base font-black mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section: Account Security ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Keamanan Akun
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <ChangePasswordForm />
      </div>

    </div>
  )
}
