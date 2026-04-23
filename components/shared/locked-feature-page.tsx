/**
 * LockedFeaturePage — Server Component
 *
 * Redesigned mobile-first "feature locked" screen.
 * Layout:
 *  - Mobile: full-width stacked card with gradient hero + benefits below
 *  - Desktop (xl): side-by-side split panel
 */

import Link from "next/link"
import {
  Lock,
  Crown,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { TIER_METADATA, type UserTier } from "@/constants/permissions"

// ─── Feature-specific metadata ──────────────────────────────────────────────

export interface LockedFeatureConfig {
  pageKey: string
  featureName: string
  featureDesc: string
  requiredTier: UserTier
  Icon: React.ElementType
  highlights: string[]
}

// ─── Per-tier visual tokens ──────────────────────────────────────────────────

const TIER_VISUAL = {
  ELITE: {
    gradient: "from-[#0F4FA8] via-[#1E73BE] to-[#1560a8]",
    glowA: "bg-blue-400/20",
    glowB: "bg-cyan-400/10",
    badge: "bg-white/15 text-white border-white/20",
    checkBg: "bg-blue-500/20",
    checkColor: "text-blue-200",
    btn: "bg-white text-[#1E73BE] hover:bg-blue-50 shadow-xl",
    btnOutline: "border-white/30 text-white hover:bg-white/10",
    pillBorder: "border-white/10",
    pillBg: "bg-white/8",
    accentColor: "text-blue-200",
    badgePill: "bg-blue-100 text-[#0F4FA8]",
    TierIcon: Star,
  },
  MASTER: {
    gradient: "from-[#78350f] via-[#92400e] to-[#78350f]",
    glowA: "bg-amber-400/20",
    glowB: "bg-yellow-300/10",
    badge: "bg-white/15 text-white border-white/20",
    checkBg: "bg-amber-400/20",
    checkColor: "text-amber-200",
    btn: "bg-white text-amber-700 hover:bg-amber-50 shadow-xl",
    btnOutline: "border-white/30 text-white hover:bg-white/10",
    pillBorder: "border-white/10",
    pillBg: "bg-white/8",
    accentColor: "text-amber-300",
    badgePill: "bg-amber-100 text-amber-800",
    TierIcon: Crown,
  },
  FREE: {
    gradient: "from-slate-800 via-slate-700 to-slate-800",
    glowA: "bg-slate-400/10",
    glowB: "bg-slate-300/5",
    badge: "bg-white/10 text-white border-white/15",
    checkBg: "bg-slate-400/20",
    checkColor: "text-slate-300",
    btn: "bg-white text-slate-700 hover:bg-slate-50 shadow-xl",
    btnOutline: "border-white/25 text-white hover:bg-white/10",
    pillBorder: "border-white/10",
    pillBg: "bg-white/5",
    accentColor: "text-slate-300",
    badgePill: "bg-slate-200 text-slate-700",
    TierIcon: Zap,
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

interface LockedFeaturePageProps {
  config: LockedFeatureConfig
  userTier: UserTier
  userName: string
}

export function LockedFeaturePage({ config, userTier, userName }: LockedFeaturePageProps) {
  const { requiredTier, featureName, featureDesc, highlights, Icon, pageKey } = config
  const tierMeta = TIER_METADATA[requiredTier]
  const userMeta = TIER_METADATA[userTier]
  const visual = TIER_VISUAL[requiredTier]
  const { TierIcon } = visual
  const firstName = userName.split(" ")[0]
  const upgradeUrl = `/dashboard/pembelian?plan=${requiredTier.toLowerCase()}&from=${pageKey}`
  const isElite = requiredTier === "ELITE"

  return (
    <div className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-72px)] w-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto">

      {/* ── Main Card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col xl:flex-row w-full flex-1 overflow-hidden">

        {/* ═══ LEFT — Hero gradient panel ═══════════════════════ */}
        <div className={`relative bg-gradient-to-br ${visual.gradient} flex flex-col xl:flex-[1.2] overflow-hidden`}>

          {/* Ambient blobs */}
          <div className={`pointer-events-none absolute -top-24 -right-16 w-72 h-72 sm:w-96 sm:h-96 rounded-full ${visual.glowA} blur-3xl`} />
          <div className={`pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 sm:w-96 sm:h-96 rounded-full ${visual.glowB} blur-3xl`} />

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8 xl:p-12 flex flex-col h-full">

            {/* Lock badge */}
            <div className={`self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-5 sm:mb-6 ${visual.badge}`}>
              <Lock className="w-3 h-3" />
              Akses Terkunci
            </div>

            {/* Feature heading */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 mt-0.5">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 ${visual.accentColor}`}>
                  Fitur {tierMeta.label}
                </p>
                <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
                  {featureName}
                </h1>
              </div>
            </div>

            <p className="text-white/75 text-sm sm:text-base font-medium leading-relaxed mb-6 max-w-lg">
              {featureDesc}
            </p>

            {/* Highlight pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {highlights.map((h) => (
                <div
                  key={h}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border backdrop-blur-md ${visual.pillBg} ${visual.pillBorder}`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${visual.checkColor}`} />
                  <span className="text-[11px] sm:text-xs text-white/90 font-semibold">{h}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-auto flex flex-col sm:flex-row gap-3 w-full xl:max-w-sm">
              <Link
                href={upgradeUrl}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${visual.btn}`}
              >
                <Sparkles className="w-4 h-4" />
                Upgrade ke {tierMeta.label}
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
              <Link
                href="/dashboard/pembelian"
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-3.5 sm:py-4 rounded-xl font-bold text-sm border transition-colors ${visual.btnOutline}`}
              >
                Bandingkan Paket
              </Link>
            </div>

          </div>
        </div>

        {/* ═══ RIGHT — Details panel ════════════════════════════ */}
        <div className="bg-slate-50/80 p-6 sm:p-8 xl:p-12 flex flex-col gap-6 xl:flex-[1] xl:overflow-y-auto border-t xl:border-t-0 xl:border-l border-slate-100">

          {/* Personal nudge */}
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isElite ? "bg-blue-100" : "bg-amber-100"}`}>
              <TierIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isElite ? "text-[#1E73BE]" : "text-amber-600"}`} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Hai {firstName}, siap tembus batas? 🚀
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 leading-relaxed">
                Aktifkan <strong className="text-slate-800">{tierMeta.label}</strong> sekarang dan buka fitur ini bersama semua keuntungannya.
              </p>
            </div>
          </div>

          {/* Tier comparison pill */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Paket Kamu</p>
                <p className="font-bold text-slate-700 text-xs sm:text-sm">{userMeta.label}</p>
              </div>
              <div className="px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dibutuhkan</p>
                <span className={`inline-block text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${visual.badgePill}`}>
                  {tierMeta.label}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">
              Semua yang kamu dapat di {tierMeta.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5">
              {tierMeta.benefits.slice(0, 6).map((benefit) => (
                <div key={benefit} className="flex items-start gap-2.5 group">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isElite ? "bg-blue-100" : "bg-amber-100"}`}>
                    <CheckCircle2 className={`w-3 h-3 ${isElite ? "text-[#1E73BE]" : "text-amber-600"}`} />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
            {tierMeta.benefits.length > 6 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs text-slate-400 font-semibold">+ {tierMeta.benefits.length - 6} keunggulan lainnya</p>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "Pembayaran Aman" },
              { icon: Zap,          label: "Aktif Instan" },
              { icon: Star,         label: "Garansi 7 Hari" },
            ].map(({ icon: BadgeIcon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-slate-400">
                <BadgeIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
