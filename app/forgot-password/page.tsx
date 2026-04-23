"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Send, KeyRound, Shield, Clock, Inbox } from "lucide-react";
import { forgotPasswordAction, type ForgotResult } from "@/app/actions/password";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<ForgotResult | null, FormData>(
    forgotPasswordAction,
    null
  );

  const isSuccess = state?.success === true;

  return (
    <main className="h-screen w-full flex overflow-hidden bg-white">

      {/* ── Left Branding Panel (Desktop) ──────────────────── */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between px-16 py-12 relative overflow-hidden h-full bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-teal-950">
        {/* Decorative rings */}
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
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">Keamanan Akun</p>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Jangan Khawatir,<br />
              <span className="text-blue-300">Kami Bantu Kamu.</span>
            </h1>
            <p className="text-blue-100/80 text-base mt-4 leading-relaxed">
              Reset password hanya butuh beberapa menit. Link aman kami akan dikirim langsung ke inbox kamu.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield,  title: "Aman & Terenkripsi",  desc: "Link reset diproteksi dengan token unik 256-bit" },
              { icon: Clock,   title: "Berlaku 1 Jam",        desc: "Token kedaluwarsa otomatis demi keamanan akunmu" },
              { icon: Inbox,   title: "Cek Spam Juga",        desc: "Kadang email masuk ke folder Promosi atau Spam" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-brand-blue-light/20 flex items-center justify-center text-blue-300 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{title}</h3>
                  <p className="text-blue-200/70 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-brand-blue-light/60 text-xs">© 2024 COBA PNS. Hak cipta dilindungi.</p>
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────── */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24 h-full overflow-y-auto bg-white relative">


        <div className="w-full max-w-md my-auto py-12">
          {!isSuccess ? (
            <>
              <div className="flex justify-center lg:justify-start lg:hidden mb-6">
                <img src="/logo.png" alt="COBA PNS Logo" className="h-8 w-auto" />
              </div>

              {/* Icon + heading */}
              <div className="flex flex-col items-center lg:items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-brand-blue-deep flex items-center justify-center mb-5 shadow-xl shadow-brand-blue/25">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2 text-center lg:text-left">
                  Lupa Password?
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed text-center lg:text-left">
                  Tenang! Masukkan email yang kamu pakai saat daftar, dan kami akan kirimkan link untuk membuat password baru.
                </p>
              </div>

              {/* Error Banner */}
              {state && !state.success && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-red-700 text-sm font-semibold">{state.message}</p>
                    {state.errors?.email && (
                      <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form action={formAction} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${state?.errors?.email ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoFocus
                      placeholder="nama@example.com"
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
                        state?.errors?.email
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/10'
                          : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0 transition-all active:scale-[0.98]"
                >
                  {isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim Link...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Kirim Link Reset Password</>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-8">
                Sudah ingat password?{" "}
                <Link href="/login" className="text-brand-blue font-bold hover:underline">
                  Masuk sekarang
                </Link>
              </p>
            </>
          ) : (
            /* ── SUCCESS STATE ───────────────────────────── */
            <div className="text-center animate-in fade-in zoom-in-95 duration-500">
              {/* Animated success ring */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
                <div className="relative w-28 h-28 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Email Terkirim! 📬</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-1">
                Link reset password sudah kami kirimkan ke inbox kamu.
              </p>
              <p className="text-slate-400 text-xs mb-8">
                Link berlaku selama <strong className="font-bold text-slate-600">1 jam</strong>. Gak ketemu? Cek folder <strong className="font-bold text-slate-600">Spam</strong> atau <strong className="font-bold text-slate-600">Promosi</strong>.
              </p>

              {/* Mock email notification card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 text-left mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white text-sm font-black shadow">S</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700 leading-none">COBA PNS Admin</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">noreply@cobapns.com</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200">Baru</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">🔑 Reset Password Akun COBA PNS Kamu</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Klik tombol <strong>"Reset Password"</strong> di dalam email untuk mengatur ulang password kamu...
                </p>
              </div>

              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Kembali ke Halaman Login
              </Link>

              <p className="text-xs text-slate-400 mt-6">
                Butuh bantuan?{" "}
                <span className="text-brand-blue font-semibold hover:underline cursor-pointer">Hubungi Support</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
