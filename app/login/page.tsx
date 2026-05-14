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
  const duration = searchParams.get("dur") === "1" ? "1" : "12";
  const validPlans: Record<string, Record<string, { name: string; price: string; originalPrice?: string }>> = {
    ELITE: {
      "1": { name: "Elite Prep (Bulanan)", price: "Rp 49.000/bln", originalPrice: "Rp 79.000" },
      "12": { name: "Elite Prep (Tahunan)", price: "Rp 99.000", originalPrice: "Rp 149.000" },
    },
    MASTER: {
      "1": { name: "Master Strategy (Bulanan)", price: "Rp 89.000/bln", originalPrice: "Rp 149.000" },
      "12": { name: "Master Strategy (Tahunan)", price: "Rp 149.000", originalPrice: "Rp 299.000" },
    },


  };

  const selectedPlan = planParam ? validPlans[planParam]?.[duration] ?? null : null;


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
              <div className="flex justify-center lg:justify-start lg:hidden mb-8">
                <Link href="/" className="inline-block hover:scale-105 active:scale-95 transition-transform">
                  <img src="/logo-landing.png" alt="COBA PNS Logo" className="h-10 sm:h-12 w-auto" />
                </Link>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
                Masuk ke Dashboard Belajar
              </h2>
              <p className="text-gray-500">Selamat datang kembali, pejuang ASN! 👋</p>
            </div>

            <form action={formAction} className="space-y-5">
              {/* Hidden plan intent — so server action can redirect to pembelian */}
              {planParam && <input type="hidden" name="plan" value={planParam} />}
              {duration && <input type="hidden" name="dur" value={duration} />}

              {/* Plan intent banner */}
              {selectedPlan && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-brand-blue-deep" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-blue-deep">Paket terpilih: {selectedPlan.name}</p>
                    <p className="text-xs text-brand-blue font-medium">
                      <span className="line-through opacity-50 mr-1.5">{(selectedPlan as any).originalPrice}</span>
                      {selectedPlan.price} · Login untuk lanjutkan pembayaran
                    </p>
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
                  href={planParam ? `/register?plan=${planParam.toLowerCase()}&dur=${duration}` : "/register"}
                  className="text-brand-blue font-bold hover:underline"
                >
                  Daftar Gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
