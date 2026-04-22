"use client"

import { useState, useCallback, useEffect } from "react"
import { Check, X, CreditCard, Zap, Shield, ArrowRight, RotateCcw } from "lucide-react"
import { CheckoutModal, type CheckoutPlan } from "@/components/dashboard/checkout-modal"

// ─── Plan Config ──────────────────────────────────────────────────────────────

function fmtIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

interface Feature { label: string; available: boolean }

interface Plan {
  id: string
  name: string
  badge?: string
  tagline: string
  price: number
  sub: string
  icon: React.ElementType
  features: Feature[]
  ctaLabel: string
  highlight: boolean
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free Access",
    tagline: "Dasar persiapan CPNS",
    price: 0,
    sub: "Selamanya",
    icon: Shield,
    highlight: false,
    ctaLabel: "Paket Aktif",
    features: [
      { label: "1x Mini Try Out CAT", available: true },
      { label: "Akses materi dasar", available: true },
      { label: "Laporan skor singkat", available: true },
      { label: "Unlimited Try Out penuh", available: false },
      { label: "Analitik mendalam", available: false },
    ],
  },
  {
    id: "ELITE",
    name: "Elite Prep",
    badge: "Paling Populer",
    tagline: "Akselerasi tingkat lanjut",
    price: 129_000,
    sub: "per bulan",
    icon: Zap,
    highlight: true,
    ctaLabel: "Pilih Elite",
    features: [
      { label: "Unlimited Try Out CAT penuh", available: true },
      { label: "Akses semua materi teks", available: true },
      { label: "Ranking Nasional Real-time", available: true },
      { label: "Analitik & Diagnostik mendalam", available: true },
      { label: "Full Materials Access", available: true },
    ],
  },
  {
    id: "MASTER",
    name: "Master Strategy",
    tagline: "Strategi menang total",
    price: 249_000,
    sub: "per bulan",
    icon: CreditCard,
    highlight: false,
    ctaLabel: "Pilih Master",
    features: [
      { label: "Semua fitur Elite Prep", available: true },
      { label: "Psikotes & Tes IQ Lengkap", available: true },
      { label: "Exclusive Video Lessons", available: true },
      { label: "AI Roadmap & Career Mapping", available: true },
      { label: "Priority Support 24/7", available: true },
    ],
  },
]

// ─── Main Client Component ────────────────────────────────────────────────────

interface BillingClientProps {
  currentTier: string
  initialPlan?: string | null  // pre-selected plan from URL (?plan=ELITE)
  activeSubscription: {
    planType: string
    endDate: string
  } | null
}

export function BillingClient({ currentTier, initialPlan, activeSubscription }: BillingClientProps) {
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null)
  const [paid, setPaid] = useState(false)

  // Auto-open checkout modal when arriving from landing page CTA
  useEffect(() => {
    if (!initialPlan) return
    const match = PLANS.find(p => p.id === initialPlan)
    if (match && match.id !== "FREE") {
      setCheckoutPlan({
        id: match.id,
        name: match.name,
        price: match.price,
        durationMonths: 1,
      })
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = useCallback((plan: Plan) => {
    if (plan.id === "FREE") return
    setCheckoutPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      durationMonths: 1,
    })
  }, [])

  const handleClose = useCallback(() => setCheckoutPlan(null), [])
  const handleSuccess = useCallback(() => {
    setCheckoutPlan(null)
    setPaid(true)
  }, [])

  const tierToPlan: Record<string, string> = { FREE: "FREE", ELITE: "ELITE", MASTER: "MASTER" }
  const activePlanId = tierToPlan[currentTier] ?? "FREE"

  return (
    <>
      {/* Active Subscription Banner */}
      {activeSubscription && activePlanId !== "FREE" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                Paket Aktif: {activeSubscription.planType === "ELITE" ? "Elite Prep" : "Master Strategy"}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Masa berlaku hingga {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(activeSubscription.endDate))}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelect(PLANS.find(p => p.id === activePlanId)!)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" /> Perpanjang Paket
          </button>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isCurrent = plan.id === activePlanId

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl bg-white border transition-all duration-200 p-8 ${
                plan.highlight
                  ? "border-teal-500 shadow-md ring-1 ring-teal-500"
                  : "border-slate-200 shadow-sm hover:border-slate-300"
              }`}
            >
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{plan.name}</h3>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">{plan.tagline}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    plan.highlight ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Pricing Number */}
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {plan.price === 0 ? "Gratis" : fmtIDR(plan.price).replace(",00", "")}
                  </span>
                  {plan.price > 0 && <span className="text-xs font-bold text-slate-500 ml-1">{plan.sub}</span>}
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {f.available ? (
                        <Check className="w-4 h-4 text-slate-900 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-[13px] font-semibold leading-relaxed ${
                        f.available ? "text-slate-700" : "text-slate-400"
                      }`}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action CTA */}
                <div>
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-lg text-center text-[13px] font-black text-slate-500 bg-slate-50 border border-slate-200">
                      Paket Aktif
                    </div>
                  ) : plan.id === "FREE" ? (
                    <div className="w-full py-2.5 rounded-lg text-center text-[13px] font-bold text-slate-400 bg-slate-50 border border-slate-200 border-dashed">
                      Default
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelect(plan)}
                      className={`w-full py-2.5 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-colors ${
                        plan.highlight
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {plan.ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        plan={checkoutPlan}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  )
}
