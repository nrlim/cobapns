"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Wand2,
  Trash2,
  Plus,
  BookMarked,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare2,
  Square,
} from "lucide-react"
import { deleteSKBExam, deleteSKBExams, duplicateSKBExam } from "@/app/actions/skb-exams"
import { SKBExamEditor } from "@/components/admin/skb-exam-editor"
import { ExamStatus, ExamAccessTier } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d))
}

export interface SKBExamRow {
  id: string
  title: string
  bidang: string
  durationMinutes: number
  status: ExamStatus
  accessTier: ExamAccessTier
  questionCount: number
  resultCount: number
  createdAt: Date
}

interface BankStats {
  TEKNIS: number
  MANAJERIAL: number
  SOSIAL_KULTURAL: number
}

interface SKBExamBuilderClientProps {
  exams: SKBExamRow[]
  bankStats: BankStats
  bidangList: string[]
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  SCHEDULED: "border-blue-200 bg-blue-50 text-blue-700",
  PUBLISHED: "border-green-200 bg-green-50 text-green-700",
}

const TIER_BADGE: Record<string, string> = {
  FREE: "border-slate-200 bg-slate-50 text-slate-600",
  ELITE: "border-amber-200 bg-amber-50 text-amber-700",
  MASTER: "border-violet-200 bg-violet-50 text-violet-700",
}

type SortKey = "created-desc" | "created-asc" | "title-asc" | "title-desc" | "questions-desc" | "results-desc"

export function SKBExamBuilderClient({
  exams: initialExams,
  bankStats,
  bidangList,
}: SKBExamBuilderClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ExamStatus | "ALL">("ALL")
  const [tierFilter, setTierFilter] = useState<ExamAccessTier | "ALL">("ALL")
  const [bidangFilter, setBidangFilter] = useState<string>("ALL")
  const [sortKey, setSortKey] = useState<SortKey>("created-desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SKBExamRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const openCreate = () => {
    setEditTarget(null)
    setDrawerOpen(true)
  }

  const openEdit = (exam: SKBExamRow) => {
    setEditTarget(exam)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus ujian SKB ini beserta semua data peserta?")) return
    setDeletingId(id)
    await deleteSKBExam(id)
    setDeletingId(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    router.refresh()
  }

  const handleBulkDelete = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    if (!confirm(`Hapus ${ids.length} ujian SKB terpilih beserta semua data peserta?`)) return
    setBulkDeleting(true)
    await deleteSKBExams(ids)
    setBulkDeleting(false)
    setSelectedIds(new Set())
    router.refresh()
  }

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id)
    const res = await duplicateSKBExam(id)
    setDuplicatingId(null)
    if (!res.success) alert(res.error ?? "Gagal menduplikasi ujian SKB.")
    router.refresh()
  }

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase()
    return initialExams
      .filter((e) => {
        const matchesKeyword = e.title.toLowerCase().includes(keyword) || e.bidang.toLowerCase().includes(keyword)
        if (keyword && !matchesKeyword) return false
        if (statusFilter !== "ALL" && e.status !== statusFilter) return false
        if (tierFilter !== "ALL" && e.accessTier !== tierFilter) return false
        if (bidangFilter !== "ALL" && e.bidang !== bidangFilter) return false
        return true
      })
      .sort((a, b) => {
        if (sortKey === "created-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        if (sortKey === "title-asc") return a.title.localeCompare(b.title)
        if (sortKey === "title-desc") return b.title.localeCompare(a.title)
        if (sortKey === "questions-desc") return b.questionCount - a.questionCount
        if (sortKey === "results-desc") return b.resultCount - a.resultCount
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [initialExams, search, statusFilter, tierFilter, bidangFilter, sortKey])

  const visibleIds = filtered.map((exam) => exam.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const selectedCount = selectedIds.size

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
            Exam Engine · SKB
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            SKB Exam Builder
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Buat dan publikasikan ujian Try Out Seleksi Kompetensi Bidang.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2 flex-shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Ujian SKB
        </Button>
      </div>

      {/* Bank Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Soal Teknis",
            count: bankStats.TEKNIS,
            cls: "text-orange-600 bg-orange-50 border-orange-100",
          },
          {
            label: "Soal Manajerial",
            count: bankStats.MANAJERIAL,
            cls: "text-purple-600 bg-purple-50 border-purple-100",
          },
          {
            label: "Soal Sosial Kultural",
            count: bankStats.SOSIAL_KULTURAL,
            cls: "text-teal-600 bg-teal-50 border-teal-100",
          },
        ].map((s) => (
          <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.cls}`}>
            <div className="text-2xl font-black">{s.count}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama ujian atau bidang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ExamStatus | "ALL")} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-orange-500">
                <option value="ALL">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value as ExamAccessTier | "ALL")} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-orange-500">
                <option value="ALL">Semua Tier</option>
                <option value="FREE">Free</option>
                <option value="ELITE">Elite</option>
                <option value="MASTER">Master</option>
              </select>
              <select value={bidangFilter} onChange={(e) => setBidangFilter(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-orange-500">
                <option value="ALL">Semua Bidang</option>
                {bidangList.map((bidang) => <option key={bidang} value={bidang}>{bidang}</option>)}
              </select>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-orange-500">
                  <option value="created-desc">Terbaru</option>
                  <option value="created-asc">Terlama</option>
                  <option value="title-asc">Judul A-Z</option>
                  <option value="title-desc">Judul Z-A</option>
                  <option value="questions-desc">Soal Terbanyak</option>
                  <option value="results-desc">Peserta Terbanyak</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-500 flex-shrink-0">
              {filtered.length} ujian ditemukan · {selectedCount} dipilih
            </p>
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              disabled={selectedCount === 0 || bulkDeleting}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {bulkDeleting ? "Menghapus..." : `Hapus Terpilih (${selectedCount})`}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-10 py-4">
                  <button onClick={toggleVisible} className="text-slate-400 hover:text-orange-600 transition-colors" title="Pilih semua hasil filter">
                    {allVisibleSelected ? <CheckSquare2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Ujian SKB
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Bidang
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Status
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Akses
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-center">
                  Soal
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-center">
                  Peserta
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4 text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <BookMarked className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">
                        {search
                          ? "Tidak ada ujian yang cocok."
                          : "Belum ada ujian SKB. Mulai dengan membuat ujian baru."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-slate-50/80 group transition-colors">
                    <TableCell>
                      <button onClick={() => toggleOne(exam.id)} className="text-slate-300 hover:text-orange-600 transition-colors" title="Pilih ujian SKB">
                        {selectedIds.has(exam.id) ? <CheckSquare2 className="w-5 h-5 text-orange-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </TableCell>

                    {/* Ujian */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                          {exam.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {exam.durationMinutes} menit · dibuat {fmtDate(exam.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Bidang */}
                    <TableCell>
                      <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg">
                        {exam.bidang}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-bold text-[11px] uppercase ${STATUS_BADGE[exam.status]}`}
                      >
                        {exam.status}
                      </Badge>
                    </TableCell>

                    {/* Akses */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-bold text-[11px] ${TIER_BADGE[exam.accessTier]}`}
                      >
                        {exam.accessTier}
                      </Badge>
                    </TableCell>

                    {/* Soal */}
                    <TableCell className="text-center">
                      <span className="text-sm font-black text-slate-700">
                        {exam.questionCount}
                      </span>
                    </TableCell>

                    {/* Peserta */}
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-slate-500">{exam.resultCount}</span>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 text-orange-600 bg-orange-50 hover:bg-orange-100 text-xs font-bold"
                        >
                          <a href={`/admin/content/skb-exams/${exam.id}`}>
                            <Wand2 className="w-3 h-3 mr-1" />
                            Soal
                          </a>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Aksi Ujian SKB</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openEdit(exam)}
                              className="gap-2 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit Konfigurasi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(exam.id)}
                              disabled={duplicatingId === exam.id}
                              className="gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {duplicatingId === exam.id ? "Menduplikasi..." : "Duplikasi Ujian"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(exam.id)}
                              disabled={deletingId === exam.id}
                              className="text-red-600 focus:bg-red-50 focus:text-red-600 gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingId === exam.id ? "Menghapus..." : "Hapus Ujian"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* SKB Exam Editor Drawer */}
      <SKBExamEditor
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        initialData={editTarget}
        bidangList={bidangList}
      />
    </>
  )
}
