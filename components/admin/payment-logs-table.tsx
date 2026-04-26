"use client"

import React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { CheckCircle, AlertTriangle, Info, FileJson, ChevronLeft, ChevronRight, Search } from "lucide-react"

type PaymentLog = {
  id: string
  orderId: string | null
  event: string
  status: string
  payload: any
  createdAt: string
}

interface PaymentLogsTableProps {
  logs: PaymentLog[]
  total: number
  page: number
  pageSize: number
}

export function PaymentLogsTable({ logs, total, page, pageSize }: PaymentLogsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(total / pageSize)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Success
          </span>
        )
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Error
          </span>
        )
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Warning
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Info className="w-3.5 h-3.5" /> Info
          </span>
        )
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header / Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Order ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
          />
        </div>
        <div className="text-sm text-slate-500 w-full sm:w-auto text-left sm:text-right">
          Menampilkan baris <span className="font-medium text-slate-900">{(page - 1) * pageSize + 1}</span> hingga <span className="font-medium text-slate-900">{Math.min(page * pageSize, total)}</span> dari total <span className="font-medium text-slate-900">{total}</span> log.
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Order ID / Target</th>
              <th className="p-4 font-semibold">Event</th>
              <th className="p-4 font-semibold">Waktu</th>
              <th className="p-4 font-semibold">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileJson className="w-8 h-8 text-slate-300" />
                    <span>Belum ada log pembayaran yang tercatat.</span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-700">
                    {log.orderId || <span className="text-slate-400 italic">N/A</span>}
                  </td>
                  <td className="p-4 font-medium text-slate-900">{log.event}</td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(log.createdAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "medium"
                    })}
                  </td>
                  <td className="p-4">
                    <details className="cursor-pointer group relative">
                      <summary className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-700 font-medium text-xs outline-none select-none">
                        <FileJson className="w-4 h-4" />
                        <span>Lihat Payload</span>
                      </summary>
                      <div className="absolute right-0 sm:left-0 top-full mt-2 z-10 w-screen max-w-sm sm:max-w-md md:max-w-lg bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-800">
                        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-300">Raw JSON Payload</span>
                        </div>
                        <pre className="p-4 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                          {log.payload ? JSON.stringify(log.payload, null, 2) : "No payload data"}
                        </pre>
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-600">
              Halaman <span className="font-semibold text-slate-900">{page}</span> dari <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
