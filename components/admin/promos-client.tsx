"use client"

import { useState } from "react"
import { createPromoAction, updatePromoAction, deletePromoAction } from "@/app/actions/promos"
import { Plus, Edit2, Trash2, X, Check, Search, AlertCircle, Tag, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react"

type PromoCode = {
  id: string
  code: string
  discountPct: number
  isActive: boolean
  maxUses: number | null
  currentUses: number
  validUntil: Date | null
  createdAt: Date
  updatedAt: Date
}

function getPromoStatus(promo: PromoCode) {
  if (!promo.isActive) return "inactive"
  if (promo.validUntil && new Date(promo.validUntil) < new Date()) return "expired"
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) return "full"
  return "active"
}

const STATUS_CONFIG = {
  active:   { label: "Aktif",        icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "Nonaktif",     icon: XCircle,      cls: "bg-slate-50 text-slate-500 border-slate-200" },
  expired:  { label: "Kedaluwarsa",  icon: Clock,        cls: "bg-red-50 text-red-600 border-red-200" },
  full:     { label: "Kuota Habis",  icon: AlertCircle,  cls: "bg-amber-50 text-amber-700 border-amber-200" },
} as const

function StatusBadge({ promo }: { promo: PromoCode }) {
  const key = getPromoStatus(promo)
  const cfg = STATUS_CONFIG[key]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

export function PromosClient({ initialPromos }: { initialPromos: PromoCode[] }) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)

  // Form State
  const [code, setCode] = useState("")
  const [discountPct, setDiscountPct] = useState("10")
  const [isActive, setIsActive] = useState(true)
  const [maxUses, setMaxUses] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = promos.filter(p => {
    const matchSearch = p.code.toLowerCase().includes(search.toLowerCase())
    const status = getPromoStatus(p)
    const matchStatus = statusFilter === "ALL" || statusFilter === status
    return matchSearch && matchStatus
  })

  const openNew = () => {
    setEditingPromo(null)
    setCode("")
    setDiscountPct("10")
    setIsActive(true)
    setMaxUses("")
    setValidUntil("")
    setError("")
    setIsModalOpen(true)
  }

  const openEdit = (promo: PromoCode) => {
    setEditingPromo(promo)
    setCode(promo.code)
    setDiscountPct(promo.discountPct.toString())
    setIsActive(promo.isActive)
    setMaxUses(promo.maxUses ? promo.maxUses.toString() : "")
    setValidUntil(promo.validUntil ? new Date(promo.validUntil).toISOString().split("T")[0] : "")
    setError("")
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kode promo ini?")) return
    try {
      await deletePromoAction(id)
      setPromos(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      alert(e.message || "Gagal menghapus promo")
    }
  }

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const payload = {
        code,
        discountPct: parseInt(discountPct) || 0,
        isActive,
        maxUses: maxUses ? parseInt(maxUses) : null,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      }
      if (editingPromo) {
        await updatePromoAction(editingPromo.id, payload)
        setPromos(prev =>
          prev.map(p =>
            p.id === editingPromo.id
              ? { ...p, ...payload, validUntil: payload.validUntil ? new Date(payload.validUntil) : null } as PromoCode
              : p
          )
        )
        setIsModalOpen(false)
      } else {
        await createPromoAction(payload)
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-1">Manajemen Diskon</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Promo Codes</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Kelola kode diskon untuk pembelian paket siswa.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Promo
        </button>
      </div>

      {/* ── Table Card ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* Toolbar — inside the card, matching transactions style */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-slate-100">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari kode promo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-brand-blue-light"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="expired">Kedaluwarsa</option>
              <option value="full">Kuota Habis</option>
            </select>
          </div>
          <p className="text-xs font-bold text-slate-500 ml-auto hidden sm:block">
            {filtered.length} kode promo
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Kode Promo</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Diskon</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Penggunaan</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Berlaku Sampai</th>
                <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Dibuat</th>
                <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium text-sm">
                    Tidak ada kode promo yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {filtered.map(promo => (
                <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-sm font-black text-slate-900">{promo.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black text-white bg-brand-blue">
                      -{promo.discountPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge promo={promo} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 text-sm leading-none">{promo.currentUses}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {promo.maxUses ? `dari ${promo.maxUses} kuota` : "tanpa batas"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                    {promo.validUntil
                      ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(promo.validUntil))
                      : <span className="text-slate-400">Selamanya</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(promo.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(promo)}
                        className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit promo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Hapus promo"
                      >
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

      {/* ── Side Drawer ─────────────────────────────────────────── */}
      {/* Backdrop */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-blue-deep mb-0.5">
              {editingPromo ? "Edit" : "Baru"}
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-blue" />
              {editingPromo ? "Edit Promo Code" : "Promo Code Baru"}
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* ── Field Block ── */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Promo</p>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Kode Promo</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                required
                maxLength={32}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-colors"
                placeholder="Contoh: CPNS2025"
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">Maks. 32 karakter. Hanya huruf kapital dan angka.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Persentase Diskon (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={discountPct}
                onChange={e => setDiscountPct(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* ── Aturan Promo ── */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aturan & Batasan</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Batas Kuota</label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="Unlimited"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">Kosongkan = tanpa batas.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Calendar className="w-3 h-3 inline mr-1" />Berlaku Sampai
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">Kosongkan = selamanya.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                  isActive ? "bg-brand-blue" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
              <span className="text-sm font-bold text-slate-700">
                Promo{" "}
                {isActive
                  ? <span className="text-emerald-600">Aktif</span>
                  : <span className="text-slate-400">Nonaktif</span>}
              </span>
            </div>
          </div>

          <div className="h-2" />
        </div>

        {/* Footer — sticky */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-brand-blue text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : <><Check className="w-4 h-4" /> Simpan</>}
          </button>
        </div>
      </div>
    </div>
  )
}
