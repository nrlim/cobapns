"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { TrendPoint, SubCategoryMastery } from "@/app/actions/performance"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// ─── Radar Chart ─────────────────────────────────────────────────────────────

interface RadarProps {
  avgTWK: number
  avgTIU: number
  avgTKP: number
}

export function CategoryRadarChart({ avgTWK, avgTIU, avgTKP }: RadarProps) {
  // Normalize each to 0-100 scale for radar visualization
  // Standard passing grades: TWK ≥ 65, TIU ≥ 80, TKP ≥ 166
  const twkMax = 150   // max possible
  const tiuMax = 175
  const tkpMax = 225

  const data = [
    { subject: "TWK", score: Math.round((avgTWK / twkMax) * 100), fullMark: 100 },
    { subject: "TIU", score: Math.round((avgTIU / tiuMax) * 100), fullMark: 100 },
    { subject: "TKP", score: Math.round((avgTKP / tkpMax) * 100), fullMark: 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 13, fontWeight: 700, fill: "#475569" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickCount={5}
        />
        <Radar
          name="Skor Kamu"
          dataKey="score"
          stroke="#0D9488"
          fill="#0D9488"
          fillOpacity={0.25}
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#0D9488", strokeWidth: 0 }}
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
        formatter={(value: any) => [`${value as number}%`, "Penguasaan"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ─── Trend Line Chart ─────────────────────────────────────────────────────────

interface TrendProps {
  trend: TrendPoint[]
}

export function ScoreTrendChart({ trend }: TrendProps) {
  const data = trend.map((t, i) => ({
    name: `TO-${i + 1}`,
    label: t.examTitle,
    TWK: t.scoreTWK,
    TIU: t.scoreTIU,
    TKP: t.scoreTKP,
    Total: t.totalScore,
    date: format(new Date(t.date), "d MMM", { locale: id }),
    pass: t.overallPass,
  }))

  const CustomDot = (props: {
    cx?: number
    cy?: number
    payload?: { pass: boolean }
  }) => {
    const { cx, cy, payload } = props
    if (!cx || !cy || !payload) return null
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke={payload.pass ? "#0D9488" : "#ef4444"}
        fill={payload.pass ? "#ccfbf1" : "#fee2e2"}
        strokeWidth={2}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          domain={[0, "auto"]}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload
            return item ? `${item.label} (${item.date})` : ""
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="TWK"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="TIU"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="TKP"
          stroke="#a855f7"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="Total"
          stroke="#0D9488"
          strokeWidth={2.5}
          strokeDasharray="5 3"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Sub-Category Mastery Bars ────────────────────────────────────────────────

interface MasteryBarsProps {
  data: SubCategoryMastery[]
  category: "TWK" | "TIU" | "TKP"
}

const CAT_COLOR: Record<string, string> = {
  TWK: "#f59e0b",
  TIU: "#3b82f6",
  TKP: "#a855f7",
}

const CAT_BG: Record<string, string> = {
  TWK: "#fef3c7",
  TIU: "#dbeafe",
  TKP: "#f3e8ff",
}

export function MasteryBars({ data, category }: MasteryBarsProps) {
  const filtered = data.filter((d) => d.category === category).slice(0, 8)
  const color = CAT_COLOR[category]
  const bg = CAT_BG[category]

  if (filtered.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400 font-medium">
        Belum ada data untuk {category}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {filtered.map((item) => (
        <div key={item.subCategory}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-600 truncate max-w-[60%]" title={item.subCategory}>
              {item.subCategory}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-medium">
                {item.correct}/{item.total}
              </span>
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded"
                style={{ color, backgroundColor: bg }}
              >
                {item.masteryPct}%
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${item.masteryPct}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Category Tab State ───────────────────────────────────────────────────────

import { useState } from "react"

export function SubCategoryPanel({ data }: { data: SubCategoryMastery[] }) {
  const [tab, setTab] = useState<"TWK" | "TIU" | "TKP">("TWK")
  const tabs: Array<"TWK" | "TIU" | "TKP"> = ["TWK", "TIU", "TKP"]

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={tab === t ? { backgroundColor: CAT_COLOR[t], color: "#fff" } : {}}
            className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all ${
              tab !== t ? "text-slate-500 hover:text-slate-700" : ""
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <MasteryBars data={data} category={tab} />
    </div>
  )
}
