"use client"

import React, { useState, useEffect } from "react"
import Papa from "papaparse"
import { X, Upload, FileText, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { bulkUploadQuestions } from "@/app/admin/content/actions"
import { NotificationToast } from "@/components/ui/notification-toast"

export function BulkImportModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{isOpen: boolean, type: "success"|"error"|"info", title: string, message: string}>({isOpen: false, type: "info", title: "", message: ""})

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-bulk-import", handleOpen)
    return () => window.removeEventListener("open-bulk-import", handleOpen)
  }, [])

  const onClose = () => setIsOpen(false)

  const downloadTemplate = () => {
    const csvContent = "Kategori,SubMateri,Tingkat,Pertanyaan,Pembahasan,OpsiA,SkorA,OpsiB,SkorB,OpsiC,SkorC,OpsiD,SkorD,OpsiE,SkorE\n" +
      "TKP,Jejaring Kerja,SEDANG,Pertanyaan contoh?,Pembahasan jawaban.,Jawaban A,1,Jawaban B,2,Jawaban C,3,Jawaban D,4,Jawaban E,5"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", "COBA_PNS_Template_Soal.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpload = () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    setProgress({ current: 0, total: 0 })

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data.filter((row: any) => row.Pertanyaan && row.Pertanyaan.trim() !== "")
          
          const formattedPayload = rawData.map((row: any) => ({
            category: row.Kategori || "TWK",
            subCategory: row.SubMateri || "Umum",
            difficulty: row.Tingkat || "SEDANG",
            content: row.Pertanyaan,
            explanation: row.Pembahasan || "",
            options: [
              { text: row.OpsiA, score: Number(row.SkorA) || 0 },
              { text: row.OpsiB, score: Number(row.SkorB) || 0 },
              { text: row.OpsiC, score: Number(row.SkorC) || 0 },
              { text: row.OpsiD, score: Number(row.SkorD) || 0 },
              { text: row.OpsiE, score: Number(row.SkorE) || 0 },
            ].filter(opt => opt.text && String(opt.text).trim() !== ""),
          })).filter(q => q.options.length > 0)

          const total = formattedPayload.length
          setProgress({ current: 0, total })

          let successCount = 0
          const CHUNK_SIZE = 25

          for (let i = 0; i < total; i += CHUNK_SIZE) {
            const chunk = formattedPayload.slice(i, i + CHUNK_SIZE)
            const res = await bulkUploadQuestions(chunk as any)
            
            if (res.success) {
              successCount += chunk.length
              setProgress({ current: successCount, total })
            } else {
              setError(res.error || "Gagal mengunggah sebagian data")
              setIsUploading(false)
              return
            }
          }

          setToast({ isOpen: true, type: "success", title: "Import Berhasil!", message: `Berhasil mengunggah ${successCount} soal.` })
          onClose()
          setFile(null)
          setProgress({ current: 0, total: 0 })
        } catch (err) {
          console.error(err)
          setError("Format CSV tidak valid. Pastikan header sesuai template.")
          setToast({ isOpen: true, type: "error", title: "Gagal", message: "Format CSV tidak valid." })
        } finally {
          setIsUploading(false)
        }
      },
      error: (err) => {
        setError("Gagal membaca file CSV.")
        setToast({ isOpen: true, type: "error", title: "Gagal", message: "Gagal membaca file CSV." })
        setIsUploading(false)
      }
    })
  }

  if (!isOpen && !isUploading) {
    return (
      <NotificationToast 
        {...toast} 
        onClose={() => setToast(t => ({ ...t, isOpen: false }))} 
      />
    )
  }

  if (!isOpen && isUploading) {
    return (
      <>
        <div className="fixed bottom-6 right-6 z-50 bg-white shadow-xl rounded-2xl border border-slate-100 p-5 w-80 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              Background Upload
            </p>
            <Button variant="ghost" size="icon" onClick={() => (window as any).triggerReopenBulkModal && (window as any).triggerReopenBulkModal()} className="h-6 w-6 text-slate-400 hover:text-teal-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            </Button>
          </div>
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-teal-500 transition-all duration-500" 
              style={{ width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%` }} 
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {progress.total > 0 ? `${progress.current} / ${progress.total} soal terunggah` : "Membaca data CSV..."}
          </p>
        </div>
        <NotificationToast 
          {...toast} 
          onClose={() => setToast(t => ({ ...t, isOpen: false }))} 
        />
      </>
    )
  }

  return (
    <>
      <NotificationToast 
        {...toast} 
        onClose={() => setToast(t => ({ ...t, isOpen: false }))} 
      />
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={() => { if(!isUploading) onClose() }} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600" />
            Bulk Import CSV
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full hover:bg-slate-200 h-8 w-8"
            title={isUploading ? "Jalankan di background" : "Tutup"}
          >
            {isUploading ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">
              Unggah ratusan soal sekaligus dalam format .CSV. Pastikan mengikuti aturan kolom yang telah disediakan.
            </p>
            <Button variant="link" onClick={downloadTemplate} className="h-auto p-0 text-teal-600 font-bold hover:text-teal-700">
              Unduh Template CSV
            </Button>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 hover:border-teal-500 transition-colors text-center relative">
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isUploading}
            />
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">{file ? file.name : "Klik atau Drop file CSV"}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Maksimal 5MB"}</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="relative">
            <Button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full text-white font-bold h-12 rounded-xl relative overflow-hidden transition-all ${isUploading ? "bg-teal-900" : "bg-teal-700 hover:bg-teal-800"}`}
            >
              {isUploading ? (
                <>
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-teal-500 transition-all duration-500 ease-out" 
                    style={{ width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%` }} 
                  />
                  <span className="relative flex items-center justify-center z-10 w-full drop-shadow-md">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {progress.total > 0 
                      ? Math.round((progress.current / progress.total) * 100) === 100 
                        ? "Menyelesaikan..." 
                        : `Mengunggah... ${progress.current} / ${progress.total} (${Math.round((progress.current / progress.total) * 100)}%)` 
                      : "Membaca CSV..."}
                  </span>
                </>
              ) : "Mulai Import"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
