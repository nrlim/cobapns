import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hasAccess, type UserTier } from "@/constants/permissions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LockedFeaturePage, type LockedFeatureConfig } from "@/components/shared/locked-feature-page"
import { getAIFeedbackStatus } from "@/app/actions/ai-feedback"
import AIFeedbackCard from "@/components/dashboard/ai-feedback-card"
import {
  Lightbulb,
  RefreshCw,
  BarChart3,
  Brain,
  Target,
  Info,
} from "lucide-react"

export const metadata = {
  title: "Rekomendasi Belajar – COBA PNS",
  description: "Dapatkan panduan belajar personal yang disesuaikan dengan profil dan hasil try out kamu.",
}

const DIAGNOSTIK_LOCKED_CONFIG: LockedFeatureConfig = {
  pageKey: "diagnostik",
  featureName: "Rekomendasi Belajar Personal",
  featureDesc:
    "Dapatkan panduan belajar yang dipersonalisasi berdasarkan profil kepribadian, hasil tes, dan seluruh riwayat try out kamu. Lebih dari sekadar analitik — ini adalah panduan yang dirancang khusus untukmu.",
  requiredTier: "ELITE",
  Icon: Lightbulb,
  highlights: [
    "Analisis kelemahan & kekuatan personal",
    "Rencana belajar mingguan yang konkret",
    "Disesuaikan dengan profil psikometri & IQ",
    "Rekomendasi materi berdasarkan gap skor",
  ],
}

export default async function DiagnostikPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionTier: true, subscriptionEnds: true },
  })

  const rawTier = dbUser?.subscriptionTier ?? "FREE"
  const effectiveTier: UserTier =
    rawTier !== "FREE" &&
    dbUser?.subscriptionEnds &&
    new Date(dbUser.subscriptionEnds) < new Date()
      ? "FREE"
      : (rawTier as UserTier)

  // Gate: Elite+ only
  if (!hasAccess(effectiveTier, "ELITE")) {
    return (
      <DashboardShell
        activeHref="/dashboard/diagnostik"
        user={{ name: session.name, role: session.role, tier: effectiveTier }}
      >
        <LockedFeaturePage
          config={DIAGNOSTIK_LOCKED_CONFIG}
          userTier={effectiveTier}
          userName={session.name}
        />
      </DashboardShell>
    )
  }

  const aiFeedbackStatus = await getAIFeedbackStatus()

  const quotaLabel =
    effectiveTier === "MASTER" ? "10x per bulan" : "3x per bulan"

  return (
    <DashboardShell
      activeHref="/dashboard/diagnostik"
      user={{ name: session.name, role: session.role, tier: effectiveTier }}
    >
      <div className="p-4 md:p-8 lg:p-10 w-full space-y-8">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">
              <Lightbulb className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              Rekomendasi Personal
            </p>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Panduan Belajar Kamu
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 max-w-lg">
              Panduan ini dibuat khusus berdasarkan profil kepribadian, hasil tes, dan riwayat try out kamu. Semakin sering berlatih, semakin akurat rekomendasinya.
            </p>
          </div>

          {/* Quota pill */}
          <div className="flex items-center gap-4 flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-center">
              <div className="text-xl font-black text-brand-blue-deep">
                {aiFeedbackStatus.quotaRemaining}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sisa</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-xl font-black text-slate-900">
                {aiFeedbackStatus.quotaLimit}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kuota</div>
            </div>
          </div>
        </div>

        {/* ── How It Works ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-900 text-sm mb-4">Cara Kerja Rekomendasi Ini</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Kumpulkan Data",
                desc: "Sistem membaca seluruh riwayat try out, skor per kategori, dan profil psikometri & IQ kamu.",
                icon: BarChart3,
              },
              {
                step: "2",
                title: "Analisis Personal",
                desc: "Sistem menganalisis pola kelemahan, kekuatan, dan gaya belajar yang paling efektif buatmu.",
                icon: Brain,
              },
              {
                step: "3",
                title: "Rencana Aksi",
                desc: "Hasilnya berupa panduan belajar mingguan yang konkret, spesifik, dan bisa langsung diterapkan.",
                icon: Target,
              },
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

        {/* ── Main Recommendation Card ─────────────────────── */}
        <AIFeedbackCard initialStatus={aiFeedbackStatus} />

        {/* ── Info Note ─────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-amber-900 text-sm mb-1">Catatan Penting</h4>
            <ul className="text-xs text-amber-800 font-medium space-y-0.5">
              <li>• Rekomendasi otomatis ditandai &ldquo;Perlu Update&rdquo; setiap kali kamu menyelesaikan try out baru.</li>
              <li>• Kuota {quotaLabel} — setiap klik Generate mengurangi kuota satu kali.</li>
              <li>• Semakin banyak data try out yang kamu miliki, semakin akurat rekomendasinya.</li>
              <li>• Jika tersedia data psikometri & IQ, analisis akan jauh lebih personal.</li>
            </ul>
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}
