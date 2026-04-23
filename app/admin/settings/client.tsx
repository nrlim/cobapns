"use client"

import React, { useState, useActionState, useEffect } from "react"
import { Eye, EyeOff, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react"
import { changePasswordAction, type ChangePasswordResult } from "./actions"

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const meta = [
    { label: "", color: "" },
    { label: "Lemah", color: "bg-red-400" },
    { label: "Cukup", color: "bg-amber-400" },
    { label: "Kuat", color: "bg-brand-blue-light" },
    { label: "Sangat Kuat", color: "bg-emerald-500" },
  ]
  const textColor = ["", "text-red-500", "text-amber-500", "text-brand-blue", "text-emerald-600"]

  if (!password) return null
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? meta[score].color : "bg-slate-200"}`} />
        ))}
      </div>
      <p className={`text-xs font-semibold ${textColor[score]}`}>{meta[score].label}</p>
    </div>
  )
}

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ChangePasswordResult | null, FormData>(
    changePasswordAction,
    null
  )
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [newPassword, setNewPassword] = useState("")
  const [successVisible, setSuccessVisible] = useState(false)

  const toggleShow = (field: keyof typeof show) =>
    setShow(prev => ({ ...prev, [field]: !prev[field] }))

  useEffect(() => {
    if (state?.success) {
      setSuccessVisible(true)
      setNewPassword("")
      const t = setTimeout(() => setSuccessVisible(false), 5000)
      return () => clearTimeout(t)
    }
  }, [state])

  const inputBase = "w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
  const inputNormal = `${inputBase} border-slate-200 focus:border-blue-500 focus:ring-blue-500/10`
  const inputError = (field: string) =>
    state?.errors?.[field]
      ? `${inputBase} border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/10`
      : inputNormal

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Card Header */}
      <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
          <Lock className="w-4 h-4 text-brand-blue" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Ubah Password</h3>
          <p className="text-xs text-slate-400 mt-0.5">Perbarui password akunmu secara berkala untuk keamanan optimal</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Success Banner */}
        {successVisible && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 text-sm">Password Berhasil Diperbarui!</p>
              <p className="text-emerald-600 text-xs mt-0.5">Gunakan password baru kamu saat login berikutnya.</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {state && !state.success && !state.errors && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-red-700 text-sm font-medium">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="space-y-5 max-w-md">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password Saat Ini
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="currentPassword"
                name="currentPassword"
                type={show.current ? "text" : "password"}
                required
                placeholder="Masukkan password saat ini"
                className={inputError("currentPassword")}
              />
              <button type="button" onClick={() => toggleShow("current")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors">
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state?.errors?.currentPassword && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {state.errors.currentPassword[0]}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password Baru</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password Baru
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="newPassword"
                name="newPassword"
                type={show.new ? "text" : "password"}
                required
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={inputError("newPassword")}
              />
              <button type="button" onClick={() => toggleShow("new")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors">
                {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <StrengthBar password={newPassword} />
            {state?.errors?.newPassword && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {state.errors.newPassword[0]}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={show.confirm ? "text" : "password"}
                required
                placeholder="Ulangi password baru"
                className={inputError("confirmPassword")}
              />
              <button type="button" onClick={() => toggleShow("confirm")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors">
                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {state?.errors?.confirmPassword && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-brand-blue-deep space-y-0.5">
              <p className="font-bold mb-1">Tips keamanan:</p>
              <p className="text-brand-blue">• Minimal 8 karakter, kombinasi huruf besar &amp; kecil</p>
              <p className="text-brand-blue">• Tambahkan angka dan simbol (@, #, !)</p>
              <p className="text-brand-blue">• Jangan gunakan password yang sama di platform lain</p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-blue/15 hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0 transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memperbarui...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Simpan Password Baru</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
