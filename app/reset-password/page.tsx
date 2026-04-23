"use client";

import { useActionState, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, ShieldAlert, KeyRound, Sparkles } from "lucide-react";
import { resetPasswordAction, type ForgotResult } from "@/app/actions/password";

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-brand-blue-light", "bg-emerald-500"];
  const textColors = ["", "text-red-500", "text-amber-500", "text-brand-blue", "text-emerald-600"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-semibold ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const [state, formAction, isPending] = useActionState<ForgotResult | null, FormData>(
    resetPasswordAction,
    null
  );

  const isSuccess = state?.success === true;

  if (!token) {
    return (
      <div className="text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Link Tidak Valid</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Link reset password ini tidak valid atau sudah <strong>kedaluwarsa</strong>. Silakan minta link baru agar dapat mengatur ulang password kamu.
        </p>
        <Link
          href="/forgot-password"
          className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5"
        >
          Minta Link Baru
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
          <div className="relative w-28 h-28 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Password Diperbarui! 🎉</h2>
        <p className="text-slate-500 text-sm mb-2 leading-relaxed">
          Selamat! Password kamu berhasil diubah.
        </p>
        <p className="text-slate-400 text-xs mb-8">
          Kamu bisa login menggunakan password baru sekarang.
        </p>
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Icon + Heading */}
      <div className="flex flex-col items-center lg:items-start mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-brand-blue-deep flex items-center justify-center mb-5 shadow-xl shadow-brand-blue/25">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2 text-center lg:text-left">
          Buat Password Baru
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed text-center lg:text-left">
          Pilih password yang kuat dan unik. Jangan gunakan password yang sama dengan akun lain.
        </p>
      </div>

      {/* Error Banner */}
      {state && !state.success && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-sm">⚠️</span>
          </div>
          <p className="text-red-700 text-sm font-semibold">{state.message}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="token" value={token} />

        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Password Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Minimal 8 karakter"
              value={passwordValue}
              onChange={e => setPasswordValue(e.target.value)}
              className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                state?.errors?.password
                  ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/10'
                  : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white'
              }`}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <PasswordStrengthBar password={passwordValue} />
          {state?.errors?.password && <p className="text-xs text-red-500 font-medium">{state.errors.password[0]}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Konfirmasi Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              placeholder="Ulangi password baru"
              className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                state?.errors?.confirmPassword
                  ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/10'
                  : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white'
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors">
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {state?.errors?.confirmPassword && <p className="text-xs text-red-500 font-medium">{state.errors.confirmPassword[0]}</p>}
        </div>

        {/* Password tips */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-brand-blue-deep space-y-1">
            <p className="font-bold">Tips password kuat:</p>
            <ul className="space-y-0.5 text-brand-blue">
              <li>• Minimal 8 karakter</li>
              <li>• Kombinasi huruf besar &amp; kecil</li>
              <li>• Tambahkan angka dan simbol (@, #, !)</li>
            </ul>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0 transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Memperbarui Password...</>
          ) : (
            <><KeyRound className="w-5 h-5" /> Simpan Password Baru</>
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="h-screen w-full flex overflow-hidden bg-white">

      {/* ── Left Branding Panel (Desktop) ──────────────────── */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between px-16 py-12 relative overflow-hidden h-full bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-teal-950">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-blue-500/20" />
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full border border-blue-500/10" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-brand-blue/20 blur-2xl" />

        {/* Logo — click to go back to login */}
        <Link href="/login" className="relative z-10 flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <span className="text-white font-black text-lg font-serif">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight group-hover:text-blue-200 transition-colors">COBA PNS</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">Keamanan Akun</p>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Hampir Selesai!<br />
              <span className="text-blue-300">Password Baru Menanti.</span>
            </h1>
            <p className="text-blue-100/80 text-base mt-4 leading-relaxed">
              Buat password yang kuat untuk melindungi akun belajarmu dari ancaman tidak diinginkan.
            </p>
          </div>

          {/* Password strength visual */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">Checklist Password Kuat</p>
            {[
              "Lebih dari 8 karakter",
              "Huruf besar & kecil",
              "Mengandung angka",
              "Simbol khusus (@#!)",
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div className="w-5 h-5 rounded-full border-2 border-brand-blue-light/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand-blue-light/40" />
                </div>
                <p className="text-blue-100/70 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-brand-blue-light/60 text-xs">© 2024 COBA PNS. Hak cipta dilindungi.</p>
      </div>

      {/* ── Right Form Panel ───────────────────────────────── */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24 h-full overflow-y-auto bg-white relative">
        <div className="w-full max-w-md my-auto py-12">
          {/* Mobile brand label */}
          <div className="flex justify-center lg:justify-start lg:hidden mb-6">
            <img src="/logo.png" alt="COBA PNS Logo" className="h-8 w-auto" />
          </div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-slate-400 text-sm">Memverifikasi link...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
