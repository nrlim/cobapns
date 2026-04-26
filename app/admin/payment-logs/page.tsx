import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { DatabaseBackup, Activity, AlertCircle, FileJson } from "lucide-react"
import { cleanupPaymentLogs } from "@/app/actions/housekeeping"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentLogsTable } from "@/components/admin/payment-logs-table"

export const dynamic = "force-dynamic"

export default async function PaymentLogsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const searchParams = await props.searchParams

  const pageParam = searchParams?.page
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1
  const pageSize = 20

  const skip = (page - 1) * pageSize

  // Fetch data
  const [logs, total, errorCount] = await Promise.all([
    prisma.paymentLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.paymentLog.count(),
    prisma.paymentLog.count({ where: { status: "ERROR" } }),
  ])

  // Housekeeping Action
  async function performHousekeeping() {
    "use server"
    await cleanupPaymentLogs(30)
    revalidatePath("/admin/payment-logs")
  }

  // Calculate metrics
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentLogsCount = await prisma.paymentLog.count({
    where: { createdAt: { gt: oneDayAgo } }
  })

  // Format logs for client component to handle dates natively
  const formattedLogs = logs.map(log => ({
    id: log.id,
    orderId: log.orderId,
    event: log.event,
    status: log.status,
    payload: log.payload,
    createdAt: log.createdAt.toISOString()
  }))

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      {/* Page Hero / Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1 lg:mb-2 text-opacity-80">Webhook & Security</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Payment Logs</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Riwayat dan payload webhook pembayaran dari Midtrans.</p>
        </div>
        <form action={performHousekeeping}>
          <button
            type="submit"
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <DatabaseBackup className="w-4 h-4" />
            Backup Logs {">"} 30 Hari
          </button>
        </form>
      </div>

      {/* Stats Bento Grid Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Logs</CardTitle>
            <div className="p-2 bg-slate-100 rounded-full">
              <FileJson className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <p className="text-xs text-slate-500 mt-1">Total semua log tersimpan</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Aktivitas 24 Jam</CardTitle>
            <div className="p-2 bg-blue-50 rounded-full">
              <Activity className="h-4 w-4 text-brand-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{recentLogsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Webhook diterima hari ini</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Error & Kegagalan</CardTitle>
            <div className="p-2 bg-red-50 rounded-full">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{errorCount}</div>
            <p className="text-xs text-slate-500 mt-1">Total error diproses</p>
          </CardContent>
        </Card>
      </div>

      {/* DataTable Section */}
      <div className="mt-8">
        <PaymentLogsTable
          logs={formattedLogs}
          total={total}
          page={page}
          pageSize={pageSize}
        />
      </div>
    </div>
  )
}
