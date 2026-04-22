/**
 * LockedFeaturePage — Server Component
 *
 * Renders a rich, informational "feature locked" screen inside the DashboardShell
 * when a student tries to access a feature not included in their current plan.
 *
 * Shows:
 *  1. Which package the feature belongs to
 *  2. Full list of benefits in that package
 *  3. A comparison table showing what the student currently has vs. what they'd gain
 *  4. A clear CTA to navigate to the subscription/upgrade page
 */

import Link from "next/link"
import {
  Lock,
  Crown,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Package,
  ChevronRight,
  Zap,
} from "lucide-react"
import { TIER_METADATA, type UserTier } from "@/constants/permissions"

// ─── Feature-specific metadata ─────────────────────────────────────────────────

export interface LockedFeatureConfig {
  /** Internal page name, used for the upgrade button `from` param */
  pageKey: string
  /** Display name shown in the "Fitur ini ada di..." section */
  featureName: string
  /** Short description of what the student is missing */
  featureDesc: string
  /** The tier required to access this feature */
  requiredTier: UserTier
  /** Icon component from lucide-react */
  Icon: React.ElementType
  /** Short "teaser" facts about what they'll unlock */
  highlights: string[]
}

// ─── Per-Tier visual config ────────────────────────────────────────────────────

const TIER_VISUAL = {
  ELITE: {
    gradient: "from-teal-900 via-teal-800 to-teal-700",
    accentBg: "bg-teal-500/10",
    accentBorder: "border-teal-500/30",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    check: "text-teal-400",
    btn: "bg-teal-600 hover:bg-teal-500 shadow-teal-900/50",
    btnOutline: "border-teal-600 text-teal-300 hover:bg-teal-800/50",
    ring: "ring-teal-500/20",
    icon: Star,
    glow: "bg-teal-500/10",
  },
  MASTER: {
    gradient: "from-amber-950 via-amber-900 to-yellow-900",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    check: "text-amber-400",
    btn: "bg-amber-600 hover:bg-amber-500 shadow-amber-900/50",
    btnOutline: "border-amber-600 text-amber-300 hover:bg-amber-900/50",
    ring: "ring-amber-500/20",
    icon: Crown,
    glow: "bg-amber-500/10",
  },
  FREE: {
    gradient: "from-slate-900 via-slate-800 to-slate-800",
    accentBg: "bg-slate-500/10",
    accentBorder: "border-slate-500/30",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    check: "text-slate-400",
    btn: "bg-slate-600 hover:bg-slate-500 shadow-slate-900/50",
    btnOutline: "border-slate-600 text-slate-300 hover:bg-slate-800/50",
    ring: "ring-slate-500/20",
    icon: Zap,
    glow: "bg-slate-500/10",
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface LockedFeaturePageProps {
  config: LockedFeatureConfig
  userTier: UserTier
  userName: string
}

export function LockedFeaturePage({ config, userTier, userName }: LockedFeaturePageProps) {
  const { requiredTier, featureName, featureDesc, highlights, Icon, pageKey } = config
  const tierMeta = TIER_METADATA[requiredTier]
  const visual = TIER_VISUAL[requiredTier]
  const TierIcon = visual.icon
  const userMeta = TIER_METADATA[userTier]
  const firstName = userName.split(" ")[0]

  const upgradeUrl = `/dashboard/pembelian?plan=${requiredTier.toLowerCase()}&from=${pageKey}`

  return (
    <div className="p-4 md:p-6 w-full flex flex-col h-[calc(100vh-80px)] overflow-y-auto xl:overflow-hidden">
      {/* Main Content Full-Width Block */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col xl:flex-row w-full flex-1 max-h-none xl:max-h-full overflow-hidden">
        
        {/* Left Side: Notice & Details (Compact) */}
        <div className={`relative p-8 xl:p-12 flex-[1.2] flex flex-col overflow-hidden bg-gradient-to-br ${visual.gradient}`}>
          {/* Soft Ambient Blobs */}
          <div className={`absolute -top-32 -right-20 w-[35rem] h-[35rem] rounded-full ${visual.glow} blur-3xl opacity-50`} />
          <div className={`absolute -bottom-32 -left-20 w-[35rem] h-[35rem] rounded-full ${visual.glow} blur-3xl opacity-50`} />

          <div className="relative z-10 flex flex-col h-full justify-center max-w-2xl mx-auto xl:mx-0">
            <div className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 ${visual.badge}`}>
               <Lock className="w-3.5 h-3.5" />
               Akses Terkunci
            </div>
            
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-black tracking-tight mb-4 text-white leading-tight flex items-center gap-4">
              <Icon className="w-10 h-10 md:w-12 md:h-12 text-white/90" />
              {featureName}
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed mb-6 max-w-xl">
              {featureDesc}
            </p>

            {/* Highlights (Compact Pills) */}
            <div className="flex flex-wrap gap-2.5 mb-8 w-full max-w-xl">
              {highlights.map((h) => (
                <div key={h} className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5 backdrop-blur-md">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${visual.check}`} />
                  <span className="text-xs md:text-sm text-white/90 font-bold">{h}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Link
                href={upgradeUrl}
                className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm text-white shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 flex-1 ${visual.btn}`}
              >
                <Sparkles className="w-4 h-4" />
                Upgrade ke {tierMeta.label}
              </Link>
              <Link
                href="/dashboard/pembelian"
                className={`inline-flex items-center justify-center px-6 py-4 rounded-xl font-bold text-sm bg-white/10 text-white border border-white/20 transition-colors hover:bg-white/20 flex-1`}
              >
                Bandingkan
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Comparison & Personal Nudge (Compact) */}
        <div className="bg-slate-50 p-8 xl:p-12 flex-[1] flex flex-col justify-center border-l border-slate-100 overflow-y-auto">
           
           <div className="mb-8">
             <h3 className="text-xl font-black tracking-tight text-slate-900 mb-2">
               Hai {firstName}, siap tembus batas? 🚀
             </h3>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">
               Akses sekarang dengan <strong className="text-slate-800">{tierMeta.label}</strong> untuk fitur spesifik ini.
             </p>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
             <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
               <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Paket Kamu</span>
               <span className="font-black text-slate-800 text-xs">{userMeta.label}</span>
             </div>
             <div className="px-5 py-3 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
               <div className="flex items-center gap-2">
                 <TierIcon className={`w-4 h-4 ${requiredTier === "MASTER" ? "text-amber-500" : "text-teal-600"}`} />
                 <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Paket Dibutuhkan</span>
               </div>
               <span className={`font-black uppercase tracking-widest text-[10px] px-2.5 py-1 rounded-full ${requiredTier === "MASTER" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                 {tierMeta.label}
               </span>
             </div>
           </div>

           <div>
             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">Benefit {tierMeta.label}</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {tierMeta.benefits.slice(0, 6).map((benefit) => (
                 <div key={benefit} className="flex items-start gap-2.5">
                   <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${requiredTier === "MASTER" ? "bg-amber-100" : "bg-teal-100"}`}>
                     <CheckCircle2 className={`w-3 h-3 ${requiredTier === "MASTER" ? "text-amber-600" : "text-teal-600"}`} />
                   </div>
                   <p className="text-xs text-slate-600 font-medium leading-relaxed">{benefit}</p>
                 </div>
               ))}
             </div>
             {tierMeta.benefits.length > 6 && (
               <div className="flex items-center gap-2 mt-4 opacity-60">
                 <Zap className="w-3.5 h-3.5 text-slate-400" />
                 <p className="text-xs text-slate-500 font-medium">+ Keunggulan lainnya...</p>
               </div>
             )}
           </div>

        </div>
      </div>
    </div>
  )
}
