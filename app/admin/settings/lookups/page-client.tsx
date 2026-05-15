"use client"

import { useState, useRef, useTransition, useEffect } from "react"
import { Search, Plus, Upload, Edit2, Trash2, X, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { createLookup, updateLookup, deleteLookup, importBulkLookups, exportLookupsByType } from "@/app/actions/lookup"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { NotificationToast } from "@/components/ui/notification-toast"

interface LookupItem {
  id: string
  name: string
  isActive: boolean
}

const TABS = [
  { value: "INSTANCE", label: "Instansi" },
  { value: "POSITION", label: "Jabatan" },
  { value: "EDUCATION", label: "Jenjang Pendidikan" },
  { value: "MAJOR", label: "Program Studi" },
]

export function LookupClient({ 
  initialData, total, currentPage, totalPages, activeType, initialSearch 
}: { 
  initialData: LookupItem[]
  total: number
  currentPage: number
  totalPages: number
  activeType: string
  initialSearch: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  
  // UI State
  const [isPending, startTransition] = useTransition()
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; title: string; message?: string } | null>(null)

  const showNotification = (type: "success" | "error", title: string, message?: string) => {
    setNotification({ type, title, message })
  }
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Handlers for URL updates
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }

  const handleTabChange = (type: string) => {
    // Reset to page 1 and clear search when tab changes
    setSearch("")
    const params = new URLSearchParams()
    params.set("type", type)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      const qs = createQueryString("search", search)
      // reset page to 1 on new search
      const params = new URLSearchParams(qs)
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("page", page.toString())}`)
    })
  }

  // Handlers for Data Mutations
  const handleOpenDialog = (item?: LookupItem) => {
    setEditingItem(item || null)
    setIsDialogOpen(true)
    setStatusMsg(null)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current) return
    const formData = new FormData(formRef.current)
    
    // Always attach type context for add operations
    if (!editingItem) {
      formData.set("type", activeType)
    }

    startTransition(async () => {
      setStatusMsg(null)
      const res = editingItem 
        ? await updateLookup(editingItem.id, formData)
        : await createLookup(formData)
        
      if (res?.error) {
        setStatusMsg({ type: "error", msg: res.error })
      } else if (res?.success) {
        handleCloseDialog()
        router.refresh()
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return
    
    startTransition(async () => {
      const res = await deleteLookup(id)
      if (res?.error) {
        showNotification("error", "Gagal Menghapus", res.error)
      } else {
        showNotification("success", "Berhasil Dihapus", "Data lookup berhasil dihapus.")
        router.refresh()
      }
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    startTransition(async () => {
      setStatusMsg(null)
      try {
        const res = await exportLookupsByType(activeType as any)
        if (res?.error) {
          showNotification("error", "Export Gagal", res.error)
        } else if (res?.success && res.data) {
          const jsonString = JSON.stringify(res.data, null, 2)
          const blob = new Blob([jsonString], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `lookup_${activeType.toLowerCase()}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          showNotification("success", "Export Berhasil", "File JSON berhasil diunduh.")
        }
      } catch (err) {
        showNotification("error", "Export Gagal", "Terjadi kesalahan saat mengunduh data.")
      }
    })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    startTransition(async () => {
      setStatusMsg(null)
      try {
        const text = await file.text()
        let items: string[] = []

        if (!file.name.toLowerCase().endsWith('.json')) {
          throw new Error("File harus berupa JSON.")
        }

        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) {
          items = parsed.map(item => {
            if (typeof item === 'string') return item.trim()
            if (typeof item === 'object' && item !== null && item.name) return String(item.name).trim()
            return ''
          }).filter(Boolean)
        } else {
          throw new Error("Format JSON harus berupa array.")
        }

        const res = await importBulkLookups(activeType as any, items)
        
        if (res?.error) {
          showNotification("error", "Import Gagal", res.error)
        } else if (res?.success) {
          showNotification("success", "Import Berhasil", res.message)
          if (fileInputRef.current) fileInputRef.current.value = ""
          router.refresh()
        }
      } catch (err: any) {
        showNotification("error", "Gagal Membaca File", err.message || "Pastikan format file JSON sudah benar.")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Global Notification */}
      {notification && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isOpen={!!notification}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeType === tab.value
                  ? "bg-white text-brand-blue-deep shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
          <button 
            disabled={isPending}
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button 
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPending ? "Mengimport..." : "Import JSON"}</span>
          </button>
          <button 
            onClick={() => handleOpenDialog()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue-deep active:bg-brand-blue-deep text-white text-sm font-black rounded-xl transition-all shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Area ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-blue" />
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Cari ${TABS.find(t => t.value === activeType)?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">Nama Lengkap</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 w-32">Status</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="text-slate-400 font-medium text-sm">Tidak ada data ditemukan.</div>
                  </td>
                </tr>
              ) : (
                initialData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-brand-blue-deep border border-blue-200">ACTIVE</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">INACTIVE</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDialog(item)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-md transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination bar */}
        {total > 0 && (
          <div className="p-4 border-t border-slate-100 text-sm font-medium text-slate-500 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
            <div>
              Menampilkan <span className="font-bold text-slate-800">{(currentPage - 1) * 10 + 1}</span> hingga <span className="font-bold text-slate-800">{Math.min(currentPage * 10, total)}</span> dari total <span className="font-bold text-slate-800">{total}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 transition-all text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-3 py-1 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
                {currentPage} / {totalPages}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isPending}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 transition-all text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialog / Modal ────────────────────────────────────── */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">
                {editingItem ? "Edit Data Lookup" : "Tambah Data Lookup"}
              </h2>
              <button 
                onClick={handleCloseDialog}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {statusMsg && (
                <div className={`flex gap-2 p-3 text-sm font-medium rounded-xl border ${
                  statusMsg.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-brand-blue-deep"
                }`}>
                  {statusMsg.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  {statusMsg.msg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">
                  Nama {TABS.find(t => t.value === activeType)?.label}
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingItem?.name || ""}
                  required
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                  placeholder="Masukkan nama..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-brand-blue-deep active:bg-brand-blue-deep disabled:bg-brand-blue-light text-white text-sm font-black rounded-xl transition-all shadow-sm shadow-blue-500/25"
                >
                  {isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isPending ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
