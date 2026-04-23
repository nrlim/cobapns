"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, BookOpen, LineChart, ArrowLeft, Loader2, Zap } from "lucide-react";
import { loginAction, type ActionResult } from "@/app/actions/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan")?.toUpperCase() ?? null;
  const validPlans: Record<string, { name: string; price: string }> = {
    ELITE: { name: "Elite Prep", price: "Rp 149.000/bln" },
    MASTER: { name: "Master Strategy", price: "Rp 249.000/bln" },
  };
  const selectedPlan = planParam ? validPlans[planParam] ?? null : null;

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  // Show toast-like errors
  const [toastVisible, setToastVisible] = useState(false);
  useEffect(() => {
    if (state && !state.success) {
      setToastVisible(true);
      const timer = setTimeout(() => setToastVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <main className="h-screen w-full flex overflow-hidden bg-surface relative">

      {/* Error Toast */}
      {toastVisible && state && !state.success && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down bg-red-50 text-red-700 border border-red-200 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg flex items-center gap-2">
          <span className="text-red-500">⚠</span>
          {state.message}
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row h-full">
        {/* Left Side: Branding Panel */}
        <div className="hidden lg:flex w-5/12 flex-col justify-between px-16 py-12 relative overflow-hidden h-full bg-gradient-to-br from-brand-blue-deep to-blue-900">
          {/* Logo — click to go to homepage */}
          <Link href="/" className="group z-10 flex items-center gap-2 w-fit">
            <img src="/icon-cpns.png" alt="COBA PNS Logo" className="h-12 w-auto drop-shadow-md hover:-translate-y-0.5 transition-transform" />
            <h2 className="text-2xl font-black leading-none tracking-tight group-hover:opacity-90 transition-opacity">
              <span className="text-white">COBA</span>
              <span className="text-brand-green">PNS</span>
            </h2>
          </Link>
          <div className="absolute inset-0 opacity-10">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPDyEIDoncNBJJQCDk9w5UXVhcT2oBlRc6GBmETKFrRXa3ZCGa4ncclQBzxBLmQ-ot1Sv5l38zqHCUpIrnwBpXTjapK3JpDbkIPlj1_3fEVeQ8gITI8QKO7jYqwufaJPLqlQkg2zVATeMz-UHCFqGBfkJF9D0uBbNx9vnXu6JsMky8YBsCk5bF0M8XQvnl-Yft6WDIa9VSUMWMJgipnp9pQUBs25GQUQtIvARktoxjdp2cryIGJsCxjTth9PVPFmFCNgydMjqYLfg7"
              alt="Professional office background"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="relative z-10">
            <div className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">
              Masa Depan Abdi Negara
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              Kembali ke <br />
              <span className="text-blue-300">Jalur Suksesmu.</span>
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed mb-12 opacity-90">
              Lanjutkan langkahmu hari ini. Setiap soal yang kamu kerjakan membawamu satu langkah
              lebih dekat menjadi ASN impian.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-brand-blue-light/20 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Akses Ribuan Soal</h3>
                  <p className="text-sm text-blue-200 opacity-80">
                    Bank soal terlengkap sesuai standar kelulusan terbaru.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-brand-blue-light/20 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Analisis Real-time</h3>
                  <p className="text-sm text-blue-200 opacity-80">
                    Pantau perkembangan skor dan kesiapan ujianmu seketika.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center items-center px-6 md:px-12 lg:px-24 h-full overflow-y-auto bg-white">
          <div className="w-full max-w-md my-auto py-12">
            <div className="mb-10 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start lg:hidden mb-6">
                <img src="/logo-dashboard.png" alt="COBA PNS Logo" className="h-8 w-auto" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                Masuk ke Dashboard Belajar
              </h2>
              <p className="text-gray-500">Selamat datang kembali, pejuang ASN! 👋</p>
            </div>

            <form action={formAction} className="space-y-5">
              {/* Hidden plan intent — so server action can redirect to pembelian */}
              {planParam && <input type="hidden" name="plan" value={planParam} />}

              {/* Plan intent banner */}
              {selectedPlan && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-brand-blue-deep" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-blue-deep">Paket terpilih: {selectedPlan.name}</p>
                    <p className="text-xs text-brand-blue font-medium">{selectedPlan.price} · Login untuk lanjutkan pembayaran</p>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="nama@example.com"
                  />
                </div>
                {state?.errors?.email && (
                  <p className="text-xs text-red-500 mt-1">{state.errors.email[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-brand-blue hover:underline">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {state?.errors?.password && (
                  <p className="text-xs text-red-500 mt-1">{state.errors.password[0]}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0 transition-all active:scale-[0.98]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    "Masuk Sekarang"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-500">
                Belum punya akun?{" "}
                <Link
                  href={planParam ? `/register?plan=${planParam.toLowerCase()}` : "/register"}
                  className="text-brand-blue font-bold hover:underline"
                >
                  Daftar Gratis
                </Link>
              </p>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-grow bg-gray-100" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Atau masuk dengan
                </span>
                <div className="h-px flex-grow bg-gray-100" />
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm focus:ring-4 focus:ring-gray-100 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Lanjutkan dengan Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
