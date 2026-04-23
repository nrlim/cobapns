"use client"

import { useState, useMemo } from "react"
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  Clock, CheckCircle2, XCircle, AlertCircle, Search,
  Download, ArrowUpDown, ChevronDown
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIs {
  totalRevenue: number
  monthRevenue: number
  lastMonthRevenue: number
  monthlyGrowth: number
  pendingCount: number
  totalTxCount: number
  successTxCount: number
  conversionRate: number
}

interface PlanBreakdown {
  planType: string
  revenue: number
  count: number
}

interface Transaction {
  id: string
  externalId: string
  planType: string
  amount: number
  status: string
  paymentMethod: string | null
  promoCode: string | null
  discountAmount: number
  paidAt: string | null
  createdAt: string
  userName: string
  userEmail: string
}

interface ChartDay {
  day: string
  revenue: number
  count: number
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtIDR(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function fmtIDRFull(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso))
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUCCESS:  { label: "Sukses",     icon: CheckCircle2, cls: "bg-blue-50 text-brand-blue-deep border-blue-200" },
  PENDING:  { label: "Pending",    icon: Clock,        cls: "bg-amber-50 text-amber-700 border-amber-200" },
  FAILED:   { label: "Gagal",      icon: XCircle,      cls: "bg-red-50 text-red-700 border-red-200" },
  EXPIRED:  { label: "Kedaluarsa", icon: AlertCircle,  cls: "bg-slate-50 text-slate-500 border-slate-200" },
} as const

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

const PLAN_LABEL: Record<string, string> = { ELITE: "Elite Prep", MASTER: "Master Strategy", FREE: "Free" }
const PLAN_COLOR: Record<string, string> = { ELITE: "bg-blue-500", MASTER: "bg-violet-500", FREE: "bg-slate-300" }

// ─── Revenue Line Chart (SVG) ─────────────────────────────────────────────────

function RevenueChart({ data }: { data: ChartDay[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-medium">
        Belum ada data transaksi sukses dalam 30 hari terakhir.
      </div>
    )
  }

  const W = 800, H = 180, PAD = { top: 16, right: 16, bottom: 32, left: 48 }
  const maxRev = Math.max(...data.map(d => d.revenue), 1)

  const x = (i: number) =>
    PAD.left + (i / Math.max(data.length - 1, 1)) * (W - PAD.left - PAD.right)
  const y = (v: number) =>
    PAD.top + (1 - v / maxRev) * (H - PAD.top - PAD.bottom)

  const polyline = data.map((d, i) => `${x(i)},${y(d.revenue)}`).join(" ")
  const area = [
    `M ${x(0)},${H - PAD.bottom}`,
    ...data.map((d, i) => `L ${x(i)},${y(d.revenue)}`),
    `L ${x(data.length - 1)},${H - PAD.bottom} Z`,
  ].join(" ")

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(v => ({
    value: v * maxRev,
    yPos: y(v * maxRev),
  }))

  // X-axis ticks (every 5 days)
  const xTicks = data.filter((_, i) => i % 5 === 0)

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
        <defs>
          <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E73BE" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1E73BE" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(t => (
          <g key={t.value}>
            <line x1={PAD.left} y1={t.yPos} x2={W - PAD.right} y2={t.yPos}
              stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD.left - 6} y={t.yPos + 4} textAnchor="end"
              fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
              {fmtIDR(t.value)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={area} fill="url(#rev-grad)" />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#1E73BE" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.revenue)} r="3"
            fill="white" stroke="#1E73BE" strokeWidth="2" />
        ))}

        {/* X-axis labels */}
        {xTicks.map((d, i) => {
          const idx = data.indexOf(d)
          return (
            <text key={i} x={x(idx)} y={H - PAD.bottom + 16} textAnchor="middle"
              fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
              {d.day.slice(5)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Plan Donut Chart (SVG) ───────────────────────────────────────────────────

function PlanDonut({ breakdown, total }: { breakdown: PlanBreakdown[]; total: number }) {
  if (total === 0 || breakdown.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No data</div>
  }

  const SIZE = 120, CX = 60, CY = 60, R = 48, STROKE = 18
  const CIRCUMFERENCE = 2 * Math.PI * R

  let offset = 0
  const planColors: Record<string, string> = {
    ELITE: "#1E73BE", MASTER: "#8b5cf6", FREE: "#94a3b8"
  }

  const segments = breakdown.map(p => {
    const pct = total > 0 ? p.revenue / total : 0
    const dash = pct * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const seg = { ...p, pct, dash, gap, offset }
    offset += dash
    return seg
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-28 h-28 -rotate-90">
        {segments.map(seg => (
          <circle
            key={seg.planType}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={planColors[seg.planType] ?? "#94a3b8"}
            strokeWidth={STROKE}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      <div className="space-y-1.5 w-full">
        {breakdown.map(p => (
          <div key={p.planType} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: planColors[p.planType] ?? "#94a3b8" }} />
              <span className="font-bold text-slate-700">{PLAN_LABEL[p.planType] ?? p.planType}</span>
            </div>
            <span className="font-black text-slate-900">{fmtIDR(p.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(transactions: Transaction[]) {
  const header = ["ID", "Order ID", "Nama", "Email", "Paket", "Jumlah", "Status", "Dibayar", "Dibuat"]
  const rows = transactions.map(tx => [
    tx.id,
    tx.externalId,
    tx.userName,
    tx.userEmail,
    tx.planType,
    tx.amount,
    tx.status,
    tx.paidAt ?? "",
    tx.createdAt,
  ])
  const csv = [header, ...rows].map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  kpis: KPIs
  planBreakdown: PlanBreakdown[]
  transactions: Transaction[]
  chartData: ChartDay[]
}

type SortField = "createdAt" | "amount" | "status" | "planType"
type SortDir = "asc" | "desc"

export function TransactionsDashboard({ kpis, planBreakdown, transactions, chartData }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [planFilter, setPlanFilter] = useState("ALL")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("desc") }
  }

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(tx =>
        tx.userName.toLowerCase().includes(q) ||
        tx.userEmail.toLowerCase().includes(q) ||
        tx.externalId.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "ALL") list = list.filter(tx => tx.status === statusFilter)
    if (planFilter !== "ALL") list = list.filter(tx => tx.planType === planFilter)
    list.sort((a, b) => {
      let av: string | number = a[sortField] ?? ""
      let bv: string | number = b[sortField] ?? ""
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return list
  }, [transactions, search, statusFilter, planFilter, sortField, sortDir])

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={`w-3 h-3 ml-1 inline ${sortField === field ? "text-brand-blue" : "text-slate-400"}`} />
  )

  return (
    <div className="p-4 md:p-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">Revenue & Analytics</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaksi</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Seluruh data pembayaran dan pendapatan platform.</p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: fmtIDRFull(kpis.totalRevenue),
            sub: `${kpis.successTxCount} transaksi sukses`,
            icon: DollarSign,
            trend: null,
          },
          {
            label: "Revenue Bulan Ini",
            value: fmtIDRFull(kpis.monthRevenue),
            sub: `vs ${fmtIDR(kpis.lastMonthRevenue)} bulan lalu`,
            icon: TrendingUp,
            trend: kpis.monthlyGrowth,
          },
          {
            label: "Transaksi Pending",
            value: String(kpis.pendingCount),
            sub: "Menunggu konfirmasi",
            icon: Clock,
            trend: null,
            warn: kpis.pendingCount > 0,
          },
          {
            label: "Conversion Rate",
            value: `${kpis.conversionRate}%`,
            sub: `${kpis.successTxCount} / ${kpis.totalTxCount} transaksi`,
            icon: CreditCard,
            trend: null,
          },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label}
              className={`bg-white border rounded-xl p-5 ${card.warn ? "border-amber-200 shadow-sm shadow-amber-50" : "border-slate-200"}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.warn ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight mb-1">{card.value}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-slate-500">{card.sub}</p>
                {card.trend !== null && (
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-black ${card.trend >= 0 ? "text-brand-blue" : "text-red-500"}`}>
                    {card.trend >= 0
                      ? <TrendingUp className="w-3 h-3" />
                      : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(card.trend)}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Revenue Harian</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">30 hari terakhir</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-blue-500 rounded-full" />
              <span className="text-xs font-bold text-slate-500">Revenue</span>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Plan Breakdown Donut */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="mb-5">
            <h3 className="font-black text-slate-900 text-sm">Revenue per Paket</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Semua waktu</p>
          </div>
          <PlanDonut
            breakdown={planBreakdown}
            total={planBreakdown.reduce((s, p) => s + p.revenue, 0)}
          />
          {/* Plan count pills */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
            {planBreakdown.map(p => (
              <div key={p.planType} className="text-center">
                <div className={`text-[10px] font-black text-white rounded px-1.5 py-0.5 mb-1 ${PLAN_COLOR[p.planType] ?? "bg-slate-300"}`}>
                  {p.planType}
                </div>
                <p className="text-sm font-black text-slate-900">{p.count}</p>
                <p className="text-[10px] text-slate-500 font-medium">order</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transaction Table ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-slate-100">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, order ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-brand-blue-light"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="SUCCESS">Sukses</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Gagal</option>
                <option value="EXPIRED">Kadaluarsa</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {/* Plan filter */}
            <div className="relative">
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Semua Paket</option>
                <option value="ELITE">Elite</option>
                <option value="MASTER">Master</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-500 ml-auto hidden sm:block">
            {filtered.length} transaksi
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {[
                  { label: "Student", field: null },
                  { label: "Paket", field: "planType" as SortField },
                  { label: "Jumlah", field: "amount" as SortField },
                  { label: "Status", field: "status" as SortField },
                  { label: "Tanggal", field: "createdAt" as SortField },
                  { label: "Promo", field: null },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={col.field ? () => handleSort(col.field!) : undefined}
                    className={`px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap ${col.field ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}
                  >
                    {col.label}
                    {col.field && <SortIcon field={col.field} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium text-sm">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              )}
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 text-sm leading-none">{tx.userName}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{tx.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black text-white ${
                      tx.planType === "ELITE" ? "bg-blue-500" : tx.planType === "MASTER" ? "bg-violet-500" : "bg-slate-400"
                    }`}>
                      {tx.planType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-black text-slate-900 whitespace-nowrap">
                    {fmtIDRFull(tx.amount)}
                    {tx.discountAmount > 0 && (
                      <span className="block text-[11px] font-bold text-brand-blue">-{fmtIDR(tx.discountAmount)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                    {fmtDate(tx.createdAt)}
                    {tx.paidAt && (
                      <span className="block text-[11px] text-brand-blue font-bold">Bayar: {fmtDate(tx.paidAt)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tx.promoCode
                      ? <span className="font-mono text-[11px] font-bold text-brand-blue-deep bg-blue-50 px-1.5 py-0.5 rounded">{tx.promoCode}</span>
                      : <span className="text-slate-300">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            Menampilkan {filtered.length} dari {transactions.length} transaksi
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-700">
              Total sukses: <span className="text-brand-blue-deep">{fmtIDRFull(
                filtered.filter(t => t.status === "SUCCESS").reduce((s, t) => s + t.amount, 0)
              )}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
