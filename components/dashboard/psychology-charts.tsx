"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface PersonalityRadarProps {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  integrity: number
  stressResilience: number
  teamwork: number
}

export function PersonalityRadarChart(props: PersonalityRadarProps) {
  const data = [
    { subject: "Keterbukaan",   score: props.openness,          fullMark: 100 },
    { subject: "Kedisiplinan",  score: props.conscientiousness,  fullMark: 100 },
    { subject: "Ekstraversi",   score: props.extraversion,       fullMark: 100 },
    { subject: "Keramahan",     score: props.agreeableness,      fullMark: 100 },
    { subject: "Stab. Emosi",   score: 100 - props.neuroticism,  fullMark: 100 }, // invert neuroticism
    { subject: "Integritas",    score: props.integrity,          fullMark: 100 },
    { subject: "Ketah. Stres",  score: props.stressResilience,   fullMark: 100 },
    { subject: "Kerja Tim",     score: props.teamwork,           fullMark: 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fontWeight: 700, fill: "#475569" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          tickCount={4}
        />
        <Radar
          name="Profil Kamu"
          dataKey="score"
          stroke="#7c3aed"
          fill="#7c3aed"
          fillOpacity={0.2}
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }}
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
          formatter={(value: any) => [`${value as number}%`, "Skor"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ─── IQ Gauge ─────────────────────────────────────────────────────────────────

interface IQGaugeProps {
  iq: number
}

export function IQGauge({ iq }: IQGaugeProps) {
  // Map IQ 55-160 to 0-180 degrees arc
  const pct   = Math.max(0, Math.min(100, ((iq - 55) / 105) * 100))
  const angle = (pct / 100) * 180 // 0 = leftmost, 180 = rightmost

  // SVG arc needle
  const cx = 150, cy = 140, r = 110
  const needleRad = ((angle - 180) * Math.PI) / 180
  const nx = cx + r * Math.cos(needleRad)
  const ny = cy + r * Math.sin(needleRad)

  const color =
    iq >= 130 ? "#7c3aed" :
    iq >= 120 ? "#2563eb" :
    iq >= 110 ? "#0891b2" :
    iq >= 90  ? "#0d9488" :
    iq >= 80  ? "#d97706" :
                "#ef4444"

  return (
    <svg viewBox="0 0 300 160" className="w-full max-w-xs mx-auto">
      {/* Background arc segments */}
      {[
        { color: "#fee2e2", sa: 180, ea: 210 },
        { color: "#fef3c7", sa: 210, ea: 240 },
        { color: "#d1fae5", sa: 240, ea: 270 },
        { color: "#dbeafe", sa: 270, ea: 300 },
        { color: "#ede9fe", sa: 300, ea: 360 },
      ].map(({ color: c, sa, ea }) => {
        const s = (sa * Math.PI) / 180
        const e = (ea * Math.PI) / 180
        const x1 = cx + (r + 12) * Math.cos(s)
        const y1 = cy + (r + 12) * Math.sin(s)
        const x2 = cx + (r + 12) * Math.cos(e)
        const y2 = cy + (r + 12) * Math.sin(e)
        const large = ea - sa > 180 ? 1 : 0
        
        const sx_inner = cx + (r - 2) * Math.cos(s)
        const sy_inner = cy + (r - 2) * Math.sin(s)
        const ex_inner = cx + (r - 2) * Math.cos(e)
        const ey_inner = cy + (r - 2) * Math.sin(e)
        
        return (
          <path
            key={sa}
            d={`M ${sx_inner.toFixed(4)} ${sy_inner.toFixed(4)} A ${r - 2} ${r - 2} 0 ${large} 1 ${ex_inner.toFixed(4)} ${ey_inner.toFixed(4)} L ${x2.toFixed(4)} ${y2.toFixed(4)} A ${r + 12} ${r + 12} 0 ${large} 0 ${x1.toFixed(4)} ${y1.toFixed(4)} Z`}
            fill={c}
          />
        )
      })}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={r - 14} fill="white" />

      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx.toFixed(4)}
        y2={ny.toFixed(4)}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={6} fill={color} />

      {/* IQ value */}
      <text x={cx} y={cy - 20} textAnchor="middle" fill={color} fontSize={32} fontWeight={900}>
        {iq}
      </text>
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>
        IQ Score
      </text>
    </svg>
  )
}
