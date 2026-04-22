import React from "react"
import { KeyRound, ShieldCheck, Clock } from "lucide-react"
import { ChangePasswordForm } from "../client"

export const metadata = {
  title: "Change Password - COBA PNS Admin",
  description: "Ubah password akun admin COBA PNS kamu.",
}

export default function ChangePasswordPage() {
  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">

      {/* ── Page Hero ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1 lg:mb-2">
            Settings › General
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Ubah Password
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Perbarui password akunmu secara berkala untuk keamanan optimal.
          </p>
        </div>
      </div>

      {/* ── Bento Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: KeyRound,    label: "Enkripsi",    value: "bcrypt · 12 rounds",  color: "bg-teal-50 border-teal-100 text-teal-700" },
          { icon: ShieldCheck, label: "Keamanan",    value: "Token JWT · Sesi Aktif", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          { icon: Clock,       label: "Berlaku",     value: "Segera Setelah Simpan", color: "bg-slate-50 border-slate-200 text-slate-600" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`rounded-2xl border p-5 flex items-center gap-4 ${color}`}>
            <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</p>
              <p className="text-sm font-black mt-0.5 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Form ── */}
      <ChangePasswordForm />

    </div>
  )
}
