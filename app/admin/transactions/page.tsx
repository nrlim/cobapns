import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { cookies } from "next/headers"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { TransactionsDashboard } from "@/components/admin/transactions-dashboard"

export const metadata = {
  title: "Transaksi & Revenue – Admin COBA PNS",
}

export default async function AdminTransactionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sipns-session")?.value
  const session = token ? await verifySession(token) : null
  if (!session || session.role !== "ADMIN") redirect("/login")

  // ── Revenue KPIs ────────────────────────────────────────────────────────────

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    pendingCount,
    totalTxCount,
    successTxCount,
    byPlan,
    allTransactions,
    dailyRevenueLast30,
  ] = await Promise.all([
    // Total all-time revenue
    prisma.transaction.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
    // This month revenue
    prisma.transaction.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    // Last month revenue
    prisma.transaction.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { amount: true },
    }),
    // Pending transactions
    prisma.transaction.count({ where: { status: "PENDING" } }),
    // Total transactions
    prisma.transaction.count(),
    // Successful transactions
    prisma.transaction.count({ where: { status: "SUCCESS" } }),
    // Revenue grouped by plan
    prisma.transaction.groupBy({
      by: ["planType"],
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    // Full transaction list (latest 100)
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    // Daily revenue last 30 days
    prisma.$queryRaw<Array<{ day: Date; revenue: bigint; count: bigint }>>(Prisma.sql`
      SELECT
        DATE("paidAt") as day,
        SUM(amount) as revenue,
        COUNT(*) as count
      FROM transactions
      WHERE status = 'SUCCESS'::\"TransactionStatus\"
        AND "paidAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("paidAt")
      ORDER BY day ASC
    `),
  ])

  // ── Serialise for client ─────────────────────────────────────────────────── 

  const conversionRate = totalTxCount > 0 ? Math.round((successTxCount / totalTxCount) * 100) : 0
  const monthlyGrowth =
    (lastMonthRevenue._sum.amount ?? 0) > 0
      ? Math.round((((monthRevenue._sum.amount ?? 0) - (lastMonthRevenue._sum.amount ?? 0)) / (lastMonthRevenue._sum.amount ?? 1)) * 100)
      : 0

  const kpis = {
    totalRevenue: totalRevenue._sum.amount ?? 0,
    monthRevenue: monthRevenue._sum.amount ?? 0,
    lastMonthRevenue: lastMonthRevenue._sum.amount ?? 0,
    monthlyGrowth,
    pendingCount,
    totalTxCount,
    successTxCount,
    conversionRate,
  }

  const planBreakdown = byPlan.map(p => ({
    planType: p.planType as string,
    revenue: p._sum.amount ?? 0,
    count: p._count._all,
  }))

  const txList = allTransactions.map(tx => ({
    id: tx.id,
    externalId: tx.externalId ?? "",
    planType: tx.planType as string,
    amount: tx.amount,
    status: tx.status as string,
    paymentMethod: (tx.paymentMethod ?? null) as string | null,
    promoCode: tx.promoCode ?? null,
    discountAmount: tx.discountAmount,
    paidAt: tx.paidAt?.toISOString() ?? null,
    createdAt: tx.createdAt.toISOString(),
    userName: tx.user.name,
    userEmail: tx.user.email,
  }))

  const chartData = dailyRevenueLast30.map(d => ({
    day: d.day instanceof Date ? d.day.toISOString().slice(0, 10) : String(d.day).slice(0, 10),
    revenue: Number(d.revenue),
    count: Number(d.count),
  }))

  return (
    <TransactionsDashboard
      kpis={kpis}
      planBreakdown={planBreakdown}
      transactions={txList}
      chartData={chartData}
    />
  )
}
