"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Star, Rocket } from "lucide-react";

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(true);


  const plans = {
    free: {
      name: "Free Access",
      price: "Gratis",
      sub: "Selamanya",
      features: [
        "1x Mini Try Out CAT",
        "Akses materi dasar",
        "Laporan skor singkat",
      ],
      cta: "Mulai Gratis",
      href: "/register",
    },
    elite: {
      name: "Elite Prep",
      monthlyPrice: 79000,
      yearlyPrice: 149000,


      features: [

        "Unlimited Try Out CAT penuh",
        "Akses semua materi teks",
        "Ranking Nasional Real-time",
        "Analitik & Diagnostik mendalam",
        "Materi Strategi Digital (E-Book)",
      ],
      cta: "Pilih Paket Elite",
      href: "/register?plan=elite",
    },
    master: {
      name: "Master Strategy",
      monthlyPrice: 149000,
      yearlyPrice: 299000,

      features: [

        "Semua fitur Elite Prep",
        "Psikotes & Tes IQ Lengkap",
        "Video Lesson Eksklusif",
        "AI Roadmap & Career Mapping",
        "Priority Support 24/7",
      ],
      cta: "Dapatkan Full Access",
      href: "/register?plan=master",
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price).replace("Rp", "Rp ");
  };

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-surface-container-high p-1 rounded-2xl flex items-center shadow-inner">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              !isYearly
                ? "bg-white text-primary shadow-sm"
                : "text-on-secondary-container hover:text-primary"
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              isYearly
                ? "bg-primary text-white shadow-md"
                : "text-on-secondary-container hover:text-primary"
            }`}
          >
            Tahunan
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isYearly ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              Hemat 80%
            </span>
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FREE ACCESS */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 flex flex-col h-full transition-transform hover:-translate-y-2 shadow-lg">
          <div className="mb-8">
            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg uppercase tracking-wider">Coba Dulu</span>
            <h3 className="text-2xl font-bold text-on-surface mt-4 uppercase">{plans.free.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-black text-on-surface">{plans.free.price}</span>
              <span className="text-sm font-bold text-on-secondary-container">/{plans.free.sub}</span>
            </div>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {plans.free.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-on-secondary-container">
                <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href={plans.free.href} className="w-full py-4 text-center block bg-surface-container-high text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-highest transition-colors">
            {plans.free.cta}
          </Link>
        </div>

        {/* ELITE PREP */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border-2 border-primary ring-4 ring-primary/5 flex flex-col h-full relative transition-transform hover:-translate-y-2 shadow-xl shadow-primary/5">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Paling Populer</div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-on-surface mt-4 uppercase">{plans.elite.name}</h3>
            <div className="mt-4 flex items-start gap-1">
              <span className="text-lg font-bold text-on-surface pt-2">Rp</span>
              <span className="text-5xl font-black text-on-surface tracking-tighter">
                {isYearly 
                  ? (plans.elite.yearlyPrice / 1000).toFixed(3).replace(".", ".") 
                  : (plans.elite.monthlyPrice / 1000).toFixed(3).replace(".", ".")}
              </span>
              <span className="text-sm font-bold text-on-secondary-container self-end pb-2">/{isYearly ? "tahun" : "bln"}</span>
            </div>
            {isYearly && (
              <p className="text-[10px] text-primary font-bold mt-1 tracking-tight">Hanya {formatPrice(Math.round(plans.elite.yearlyPrice / 12))}/bulan</p>
            )}
          </div>


          <div className="mb-6 p-4 bg-primary/5 rounded-2xl">
            <p className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
              <Star className="w-4 h-4 fill-current" />
              Feature Highlight
            </p>
            <p className="text-sm font-bold text-on-surface mt-1">Smart Shuffle Engine Enabled</p>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {plans.elite.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-on-secondary-container">
                <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href={plans.elite.href + (isYearly ? "&dur=12" : "&dur=1")} className="w-full py-4 text-center block primary-gradient text-on-primary font-bold rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity">
            {plans.elite.cta}
          </Link>

        </div>

        {/* MASTER STRATEGY */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 flex flex-col h-full transition-transform hover:-translate-y-2 shadow-lg">
          <div className="mb-8">
            <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold rounded-lg uppercase tracking-wider">Full Access</span>
            <h3 className="text-2xl font-bold text-on-surface mt-4 uppercase">{plans.master.name}</h3>
            <div className="mt-4 flex items-start gap-1">
              <span className="text-lg font-bold text-on-surface pt-2">Rp</span>
              <span className="text-5xl font-black text-on-surface tracking-tighter">
                {isYearly 
                  ? (plans.master.yearlyPrice / 1000).toFixed(3).replace(".", ".") 
                  : (plans.master.monthlyPrice / 1000).toFixed(3).replace(".", ".")}
              </span>
              <span className="text-sm font-bold text-on-secondary-container self-end pb-2">/{isYearly ? "tahun" : "bln"}</span>
            </div>
            {isYearly && (
              <p className="text-[10px] text-tertiary font-bold mt-1 tracking-tight">Hanya {formatPrice(Math.round(plans.master.yearlyPrice / 12))}/bulan</p>
            )}
          </div>


          <div className="mb-6 p-4 bg-tertiary/5 rounded-2xl">
            <p className="text-xs font-bold text-tertiary flex items-center gap-2 uppercase tracking-wide">
              <Rocket className="w-4 h-4 fill-current" />
              Premium Tech
            </p>
            <p className="text-sm font-bold text-on-surface mt-1">Diagnostic Roadmap Active</p>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {plans.master.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-on-secondary-container">
                <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link href={plans.master.href + (isYearly ? "&dur=12" : "&dur=1")} className="w-full py-4 text-center block border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors">
            {plans.master.cta}
          </Link>

        </div>
      </div>
    </div>
  );
}
