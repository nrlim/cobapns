"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ChartDataPoint = {
  date: string;
  revenue: number;
  signups: number;
  fullDate: string;
};

export default function AdminChart({ data }: { data: ChartDataPoint[] }) {
  const [activeTab, setActiveTab] = useState<"revenue" | "signups">("revenue");

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 hidden md:block">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Trends</h3>
          <p className="text-sm text-slate-500 font-medium">Daily metrics for the past 30 days</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg shadow-sm uppercase tracking-wider transition-colors ${
              activeTab === "revenue"
                ? "bg-white text-brand-blue-deep"
                : "text-slate-500 hover:text-slate-800 shadow-none"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab("signups")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg shadow-sm uppercase tracking-wider transition-colors ${
              activeTab === "signups"
                ? "bg-white text-brand-blue-deep"
                : "text-slate-500 hover:text-slate-800 shadow-none"
            }`}
          >
            Signups
          </button>
        </div>
      </div>

      <div className="w-full h-64 relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeTab === "revenue" ? "#0D9488" : "#2563EB"} stopOpacity={0.4} />
                <stop offset="95%" stopColor={activeTab === "revenue" ? "#0D9488" : "#2563EB"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 900 }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis 
              hide={true} 
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              formatter={(value: any) => {
                if (activeTab === "revenue") {
                  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
                }
                return value + " users";
              }}
            />
            <Area
              type="monotone"
              dataKey={activeTab}
              stroke={activeTab === "revenue" ? "#0D9488" : "#2563EB"}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{ r: 6, strokeWidth: 3, stroke: activeTab === "revenue" ? "#0D9488" : "#2563EB", fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
