import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { CURRENT_YEAR } from "@/lib/utils"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ShieldCheck, Zap, RefreshCw, HeadphonesIcon } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BillingClient } from "@/components/dashboard/billing-client"
import { PaymentHistory } from "@/components/dashboard/payment-history"

export const metadata = {
  title: "Paket & Pembayaran – COBA PNS",
  description: "Pilih paket belajar terbaik untuk persiapan CPNS kamu. Tersedia paket Free, Elite, dan Master.",
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>
}) {
  const { plan } = await searchParams
  const validPlans = ["ELITE", "MASTER"]
  const initialPlan = plan && validPlans.includes(plan.toUpperCase()) ? plan.toUpperCase() : null

  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session) redirect("/login")

  const [user, activeSub, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true },
    }),
    prisma.subscription.findFirst({
      where: {
        userId: session.userId,
        status: "ACTIVE",
        endDate: { gt: new Date() },
      },
      orderBy: { endDate: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        externalId: true,
        planType: true,
        amount: true,
        status: true,
        promoCode: true,
        discountAmount: true,
        paidAt: true,
        createdAt: true,
        expiredAt: true,
        snapToken: true,  // needed for resume-payment button
      },
    }),
  ])

  const currentTier = user?.subscriptionTier ?? "FREE"

  const txData = transactions.map(tx => ({
    ...tx,
    paidAt: tx.paidAt?.toISOString() ?? null,
    createdAt: tx.createdAt.toISOString(),
    expiredAt: tx.expiredAt?.toISOString() ?? null,
    planType: tx.planType as string,
    status: tx.status as string,
    snapToken: tx.snapToken ?? null,  // pass through for resume-payment
  }))

  return (
    <DashboardShell activeHref="/dashboard/pembelian" user={{ name: session.name, role: session.role }}>
      <div className="p-4 md:p-8 lg:p-10 w-full pb-20">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-3">Paket & Pembayaran</p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-3">
            Investasi Terbaik untuk Lulus CPNS
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Pilih paket yang sesuai kebutuhanmu. Semua paket dilengkapi akses Try Out SKD dengan Simulasi CAT berbasis{" "}
            <span className="font-bold text-slate-700">Standar BKN {CURRENT_YEAR}</span>.
          </p>
        </div>

        {/* ── Pricing Cards + Active Sub Banner ── */}
        <BillingClient
          currentTier={currentTier}
          initialPlan={initialPlan}
          activeSubscription={
            activeSub
              ? { planType: activeSub.planType, endDate: activeSub.endDate.toISOString() }
              : null
          }
        />

        {/* ── Trust Bar ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1000px] mx-auto mt-16 pt-16 border-t border-slate-100">
          {[
            { icon: ShieldCheck, title: "Pembayaran Aman", sub: "SSL 256-bit + Midtrans" },
            { icon: Zap, title: "Aktivasi Instan", sub: "Aktif < 5 menit setelah bayar" },
            { icon: RefreshCw, title: "Garansi 7 Hari", sub: "Uang kembali 100%" },
            { icon: HeadphonesIcon, title: "Support Responsif", sub: "Bantuan via WhatsApp" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 mb-0.5">{title}</p>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Payment History (replaces FAQ) ───────────────────── */}
        <PaymentHistory transactions={txData} />

      </div>
    </DashboardShell>
  )
}
