"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { ScoreTrendPoint } from "@/app/actions/statistics"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// ─── Score Progress Line Chart ────────────────────────────────────────────────

const PASSING_TOTAL = 311 // TWK 65 + TIU 80 + TKP 166

interface ScoreProgressProps {
  trend: ScoreTrendPoint[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as ScoreTrendPoint & { shortLabel: string }
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 min-w-[180px]">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-700 mb-2 line-clamp-1">{d?.examTitle}</p>
      <div className="space-y-1">
        {payload.map((p: { name: string; value: number; color: string }) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-[11px] text-slate-500 font-medium flex-1">{p.name}</span>
            <span className="text-[11px] font-black text-slate-900">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PassDot = (props: any) => {
  const { cx, cy, payload } = props
  if (!cx || !cy) return null
  return (
    <circle
      cx={cx} cy={cy} r={4.5}
      stroke={payload.overallPass ? "#1E73BE" : "#ef4444"}
      fill={payload.overallPass ? "#2A8BD6" : "#fee2e2"}
      strokeWidth={2}
    />
  )
}

export function ScoreProgressChart({ trend }: ScoreProgressProps) {
  const data = trend.map((t) => ({
    ...t,
    name: t.shortLabel,
    date: format(new Date(t.date), "d MMM", { locale: id }),
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-medium">
        Belum ada data ujian untuk ditampilkan.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          domain={[0, "auto"]}
        />
        <ReferenceLine
          y={PASSING_TOTAL}
          stroke="#1E73BE"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{
            value: `Ambang ${PASSING_TOTAL}`,
            position: "insideTopRight",
            fontSize: 10,
            fontWeight: 700,
            fill: "#1E73BE",
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="scoreTWK"
          name="TWK"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={<PassDot />}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="scoreTIU"
          name="TIU"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={<PassDot />}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="scoreTKP"
          name="TKP"
          stroke="#a855f7"
          strokeWidth={2}
          dot={<PassDot />}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="totalScore"
          name="Total"
          stroke="#1E73BE"
          strokeWidth={2.5}
          dot={<PassDot />}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Chart Legend ─────────────────────────────────────────────────────────────

export function ChartLegend() {
  const items = [
    { label: "TWK", color: "#f59e0b" },
    { label: "TIU", color: "#3b82f6" },
    { label: "TKP", color: "#a855f7" },
    { label: "Total", color: "#1E73BE" },
    { label: "Ambang Batas", color: "#1E73BE", dashed: true },
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
      {items.map(({ label, color, dashed }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="w-5 h-0.5 flex-shrink-0 rounded-full"
            style={{
              backgroundColor: color,
              borderTop: dashed ? `2px dashed ${color}` : undefined,
              background: dashed ? "none" : color,
            }}
          />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Time Analysis Bar Chart ──────────────────────────────────────────────────

interface TimeBarProps {
  trend: ScoreTrendPoint[]
}

export function TimeAnalysisChart({ trend }: TimeBarProps) {
  const data = trend.map((t) => ({
    name: t.shortLabel,
    minutes: t.timeTakenMinutes ?? 0,
    pass: t.overallPass,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">
        Belum ada data.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          unit=" m"
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`${v as number} menit`, "Waktu Pengerjaan"]}
        />
        <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.pass ? "#1E73BE" : "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
