// app/dashboard/psychology/page.tsx
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LockedFeaturePage, type LockedFeatureConfig } from "@/components/shared/locked-feature-page"
import Link from "next/link"
import {
  Brain,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Target,
  Info,
} from "lucide-react"
import type { UserTier } from "@/constants/permissions"
import { hasAccess } from "@/constants/permissions"

export const metadata = {
  title: "Psikotes & Tes IQ – COBA PNS",
  description: "Tes psikologi Big Five dan tes IQ multi-dimensi untuk rekomendasi karir CPNS.",
}

// ─── Locked feature config for this page ──────────────────────────────────────

const PSYCH_LOCKED_CONFIG: LockedFeatureConfig = {
  pageKey: "psychology",
  featureName: "Psikotes & Tes IQ",
  featureDesc:
    "Kenali potensi dirimu melalui tes psikologi Big Five dan kecerdasan multi-dimensi. Dapatkan rekomendasi jabatan CPNS yang paling sesuai dengan profilmu.",
  requiredTier: "MASTER",
  Icon: Brain,
  highlights: [
    "Psikotes kepribadian Big Five (24 soal, ±15 menit)",
    "Tes IQ Multi-Dimensi — Verbal, Numerik, Logika, Spasial",
    "Skor IQ Terstandarisasi (Mean 100, SD 15)",
    "Rekomendasi jabatan & instansi berdasarkan profilmu",
    "Career Mapping eksklusif untuk peserta CPNS",
  ],
}

const IQ_LOCKED_CONFIG: LockedFeatureConfig = {
  pageKey: "iq-test",
  featureName: "Tes IQ Multi-Dimensi",
  featureDesc:
    "Tes kemampuan kognitif multi-dimensi dengan timer per sub-tes. Skor dinormalisasi ke standar IQ internasional.",
  requiredTier: "ELITE",
  Icon: Zap,
  highlights: [
    "4 Sub-tes lengkap: Verbal, Numerik, Logika, Spasial",
    "53 soal dengan timer per sub-tes",
    "Skor IQ Terstandarisasi (Mean 100, SD 15)",
    "Interpretasi hasil tes yang detail",
  ],
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PsychologyPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  // Fetch user's live tier from DB (single query covers both needs)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true },
  })

  const rawTier = dbUser?.subscriptionTier ?? "FREE"
  // Handle expired subscriptions
  const effectiveTier: UserTier =
    rawTier !== "FREE" &&
    dbUser?.subscriptionEnds &&
    new Date(dbUser.subscriptionEnds) < new Date()
      ? "FREE"
      : (rawTier as UserTier)

  // ── Tier guard: whole page requires MASTER ──────────────────────────────────
  if (!hasAccess(effectiveTier, "MASTER")) {
    return (
      <DashboardShell activeHref="/dashboard/psychology" user={{ name: session.name, role: session.role, tier: session.tier }}>
        <LockedFeaturePage
          config={PSYCH_LOCKED_CONFIG}
          userTier={effectiveTier}
          userName={session.name}
        />
      </DashboardShell>
    )
  }

  // ── Authorized: fetch test results ─────────────────────────────────────────
  const [psychResult, iqResult] = await Promise.all([
    prisma.psychometricResult.findUnique({ where: { userId: session.userId } }),
    prisma.iQResult.findUnique({ where: { userId: session.userId } }),
  ])

  const hasPsych = !!psychResult
  const hasIQ = !!iqResult
  const bothDone = hasPsych && hasIQ

  return (
    <DashboardShell activeHref="/dashboard/psychology" user={{ name: session.name, role: session.role, tier: session.tier }}>
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">
              Asesmen Psikologi
            </p>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Psikotes & Tes IQ
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 max-w-lg">
              Kenali potensi dirimu melalui tes psikologi dan kecerdasan. Hasil analisis akan memberikan rekomendasi jabatan yang paling sesuai.
            </p>
          </div>

          {/* Progress summary pill */}
          <div className="flex items-center gap-4 flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-center">
              <div className="text-xl font-black text-brand-blue-deep">{[hasPsych, hasIQ].filter(Boolean).length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-xl font-black text-slate-900">2</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tes</div>
            </div>
          </div>
        </div>

        {/* ── Module Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Psychometric Test */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {/* Status stripe */}
            <div className={`h-1 ${hasPsych ? "bg-blue-500" : "bg-slate-200"}`} />
            <div className="p-6 flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base">Psikotes Kepribadian</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Big Five · 24 Soal</p>
                  </div>
                </div>
                {hasPsych ? (
                  <span className="flex items-center gap-1 bg-blue-50 text-brand-blue-deep border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-full">
                    Belum
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-5">
                Tes berbasis skala Likert (1–5) mengukur kepribadian Big Five, Integritas, Ketahanan Stres, dan Kerja Sama Tim.
              </p>

              {/* Dimension tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["Keterbukaan", "Kedisiplinan", "Ekstraversi", "Keramahan", "Stab. Emosi", "Integritas"].map(d => (
                  <span key={d} className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                    {d}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium mb-6">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ±15 Menit</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Skala 1–5</span>
              </div>

              <div className="mt-auto pt-2">
                <Link
                  href="/dashboard/psychology/test"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-brand-blue-deep text-white hover:bg-brand-blue-deep shadow-sm"
                >
                  {hasPsych ? "Ulangi Psikotes" : "Mulai Psikotes"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* IQ Test */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className={`h-1 ${hasIQ ? "bg-blue-500" : "bg-slate-200"}`} />
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base">Tes IQ Multi-Dimensi</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4 Sub-Tes · 53 Soal</p>
                  </div>
                </div>
                {hasIQ ? (
                  <span className="flex items-center gap-1 bg-blue-50 text-brand-blue-deep border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Selesai
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-full">
                    Belum
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-5">
                Tes kemampuan kognitif multi-dimensi dengan timer per sub-tes. Skor dinormalisasi ke standar IQ internasional (Mean 100, SD 15).
              </p>

              {/* Sub-test breakdown */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { label: "Verbal", soal: 15, waktu: "5 mnt" },
                  { label: "Numerik", soal: 12, waktu: "5 mnt" },
                  { label: "Logika", soal: 14, waktu: "6 mnt" },
                  { label: "Spasial", soal: 12, waktu: "5 mnt" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{s.label}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{s.soal} soal · {s.waktu}</p>
                  </div>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium mb-6">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ±21 Menit</span>
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Mean IQ = 100</span>
              </div>

              {hasIQ && iqResult && (
                <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">Skor IQ Terakhir</span>
                  <span className="font-black text-slate-900">{iqResult.totalIQ} <span className="text-xs font-medium text-slate-500">({iqResult.interpretation})</span></span>
                </div>
              )}

              <div className="mt-auto pt-2">
                <Link
                  href="/dashboard/iq-test"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all bg-brand-blue-deep text-white hover:bg-brand-blue-deep shadow-sm"
                >
                  {hasIQ ? "Ulangi Tes IQ" : "Mulai Tes IQ"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── See Results CTA (only when at least one done) ── */}
        {(hasPsych || hasIQ) && (
          <div className="relative bg-gradient-to-br from-brand-blue-deep via-brand-blue-deep to-brand-blue rounded-2xl p-6 text-white shadow-sm overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-[10px] font-bold tracking-widest uppercase mb-1">
                {bothDone ? "Analisis Lengkap Siap" : "Hasil Parsial Tersedia"}
              </p>
              <h3 className="text-xl font-black mb-1 tracking-tight">
                {bothDone ? "Lihat Profil & Rekomendasi Jabatan" : "Lihat Hasil yang Sudah Selesai"}
              </h3>
              <p className="text-blue-100 text-sm font-medium mb-5 max-w-md">
                {bothDone
                  ? "Radar kepribadian · Skor IQ · Rekomendasi jabatan berdasarkan profilmu."
                  : "Lengkapi kedua tes untuk mendapatkan rekomendasi jabatan yang lebih akurat."}
              </p>
              <Link
                href="/dashboard/psychology/result"
                className="inline-flex items-center gap-2 bg-white text-brand-blue-deep px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
              >
                Buka Hasil Analisis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Brain className="absolute right-4 bottom-4 w-28 h-28 text-white/10" />
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500/20 rounded-full" />
          </div>
        )}

        {/* ── Info Steps ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-900 text-sm mb-4">Cara Kerja Asesmen Ini</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Kerjakan Tes", desc: "Jawab semua soal psikotes dan tes IQ secara jujur dan tenang.", icon: Brain },
              { step: "2", title: "Analisis Otomatis", desc: "Sistem menghitung profil kepribadian dan skor IQ terstandarisasi.", icon: BarChart3 },
              { step: "3", title: "Rekomendasi Jabatan", desc: "Lihat jabatan dan instansi yang paling sesuai dengan profilmu.", icon: Target },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-brand-blue-deep">{step}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm mb-0.5">{title}</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Disclaimer ─────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-amber-900 text-sm mb-1">Catatan Penting</h4>
            <ul className="text-xs text-amber-800 font-medium space-y-0.5">
              <li>• Psikotes menggunakan model Big Five yang diakui secara internasional.</li>
              <li>• Tes IQ dinormalisasi ke standar psikometri (Mean 100, SD 15).</li>
              <li>• Rekomendasi jabatan bersifat indikatif — bukan jaminan kelulusan seleksi.</li>
            </ul>
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
