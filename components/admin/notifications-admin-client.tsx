"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Bell, Check, Edit2, Eye, EyeOff, LinkIcon, Plus, Search, Send, Trash2, X } from "lucide-react"

import { createNotificationAction, deleteNotificationAction, updateNotificationAction } from "@/app/admin/notifications/actions"

type NotificationItem = {
  id: string
  title: string
  message: string
  ctaLabel: string | null
  ctaUrl: string | null
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
  _count: { reads: number }
}

type FormState = {
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  isPublished: boolean
}

const emptyForm: FormState = {
  title: "",
  message: "",
  ctaLabel: "",
  ctaUrl: "",
  isPublished: true,
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function NotificationsAdminClient({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<NotificationItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return notifications.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "ALL" || (statusFilter === "PUBLISHED" ? item.isPublished : !item.isPublished)
      return matchesSearch && matchesStatus
    })
  }, [notifications, search, statusFilter])

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setError("")
    setDrawerOpen(true)
  }

  const openEdit = (item: NotificationItem) => {
    setEditing(item)
    setForm({
      title: item.title,
      message: item.message,
      ctaLabel: item.ctaLabel ?? "",
      ctaUrl: item.ctaUrl ?? "",
      isPublished: item.isPublished,
    })
    setError("")
    setDrawerOpen(true)
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        message: form.message,
        ctaLabel: form.ctaLabel || null,
        ctaUrl: form.ctaUrl || null,
        isPublished: form.isPublished,
      }
      const result = editing
        ? await updateNotificationAction(editing.id, payload)
        : await createNotificationAction(payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      setDrawerOpen(false)
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus notifikasi ini? Riwayat baca siswa juga akan terhapus.")) return
    const result = await deleteNotificationAction(id)
    if (!result.success) {
      alert(result.error)
      return
    }
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">Broadcast Center</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Notifications</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Kirim pengumuman yang tampil di menu notifikasi dashboard siswa.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Push Notification
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-slate-100">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul atau pesan..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-brand-blue-light"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
          <p className="text-xs font-bold text-slate-500 ml-auto hidden sm:block">{filtered.length} notifikasi</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Pesan</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">CTA</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Dibaca</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Dibuat</th>
                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Belum ada notifikasi.</td>
                </tr>
              )}
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 min-w-[280px]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue flex-shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{item.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${item.isPublished ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                      {item.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                    {item.ctaUrl ? <span className="inline-flex items-center gap-1"><LinkIcon className="w-3 h-3" />{item.ctaLabel}</span> : <span className="text-slate-400">Tidak ada</span>}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">{item._count.reads}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-md transition-colors" title="Edit notifikasi">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus notifikasi">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />}
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-0.5">{editing ? "Edit" : "Push Baru"}</p>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2"><Send className="w-5 h-5 text-brand-blue" />{editing ? "Edit Notification" : "Push Notification"}</h2>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Isi Notifikasi</p>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Judul</label>
              <input value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={100} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: Try Out Nasional Dibuka" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Pesan</label>
              <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} rows={6} maxLength={1000} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 resize-none" placeholder="Tulis pengumuman untuk siswa..." />
              <p className="text-[10px] text-slate-400 font-medium mt-1">{form.message.length}/1000 karakter</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tombol Opsional</p>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Label Tombol</label>
              <input value={form.ctaLabel} onChange={(event) => updateField("ctaLabel", event.target.value)} maxLength={40} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Lihat Materi" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">URL Internal</label>
              <input value={form.ctaUrl} onChange={(event) => updateField("ctaUrl", event.target.value)} maxLength={255} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500" placeholder="/dashboard/learning" />
            </div>
            <div className="flex items-center gap-3 py-1">
              <button type="button" role="switch" aria-checked={form.isPublished} onClick={() => updateField("isPublished", !form.isPublished)} className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isPublished ? "bg-brand-blue" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className="text-sm font-bold text-slate-700">{form.isPublished ? "Langsung tampil di siswa" : "Simpan sebagai draft"}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={() => setDrawerOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50">
            {loading ? "Mengirim..." : <><Check className="w-4 h-4" /> {editing ? "Simpan" : "Push"}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
