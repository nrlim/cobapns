"use client"

import React, { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DeleteListConfirmModalProps {
  isOpen: boolean
  title: string
  entityLabel: string
  scopeLabel: string
  targetCount: number
  isPending: boolean
  error?: string | null
  successCount?: number | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteListConfirmModal({
  isOpen,
  title,
  entityLabel,
  scopeLabel,
  targetCount,
  isPending,
  error,
  successCount,
  onClose,
  onConfirm,
}: DeleteListConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("")

  useEffect(() => {
    if (isOpen) setConfirmText("")
  }, [isOpen])

  if (!isOpen) return null

  const canDelete = confirmText === "HAPUS" && targetCount > 0 && !isPending
  const isSuccess = typeof successCount === "number"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={isPending ? undefined : onClose} />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-gradient-to-br from-red-50 via-white to-slate-50 px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                {isSuccess ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">Danger Zone</p>
                <h3 className="text-xl font-black tracking-tight text-slate-900">{isSuccess ? "Penghapusan Berhasil" : title}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {isSuccess
                    ? `${successCount} ${entityLabel} berhasil dihapus.`
                    : "Tindakan ini permanen dan tidak dapat dibatalkan."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 w-9 rounded-full text-slate-400 hover:bg-white hover:text-slate-700 transition-colors disabled:opacity-50"
              aria-label="Tutup modal"
            >
              <X className="h-5 w-5 mx-auto" />
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="px-6 py-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              Data sudah diperbarui. Halaman akan menampilkan daftar terbaru setelah modal ditutup.
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={onClose} className="rounded-xl bg-slate-900 hover:bg-slate-800 font-black">
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{targetCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cakupan</p>
                <p className="text-sm font-black text-slate-800 mt-2 line-clamp-2">{scopeLabel}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-900">
                Anda akan menghapus <span className="font-black">{targetCount}</span> {entityLabel} dari {scopeLabel}.
              </p>
              <p className="text-xs font-medium text-red-700 mt-1">
                Untuk melanjutkan, ketik <span className="font-black tracking-widest">HAPUS</span> pada kolom konfirmasi.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Konfirmasi</label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Ketik HAPUS"
                disabled={isPending || targetCount <= 0}
                className="h-11 rounded-xl border-slate-200 font-black tracking-widest"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {targetCount <= 0 && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                Tidak ada data pada cakupan ini untuk dihapus.
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl font-black border-slate-200"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={!canDelete}
                className="rounded-xl font-black bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:shadow-none"
              >
                {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Hapus Permanen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
