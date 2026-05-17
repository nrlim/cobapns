"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
}
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Wand2,
  Trash2,
  Plus,
  ClipboardList,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare2,
  Square,
} from "lucide-react"
import { deleteExam, deleteExams, duplicateExam } from "@/app/actions/exams"
import { ExamEditor } from "@/components/admin/exam-editor"
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

export interface ExamRow {
  id: string
  title: string
  durationMinutes: number
  passingGradeTWK: number
  passingGradeTIU: number
  passingGradeTKP: number
  status: ExamStatus
  accessTier: ExamAccessTier
  questionCount: number
  resultCount: number
  createdAt: Date
}

interface BankStats {
  TWK: number
  TIU: number
  TKP: number
}

interface ExamTableClientProps {
  exams: ExamRow[]
  bankStats: BankStats
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT:     "border-slate-200 bg-slate-50 text-slate-600",
  SCHEDULED: "border-blue-200 bg-blue-50 text-blue-700",
  PUBLISHED: "border-blue-200 bg-blue-50 text-brand-blue-deep",
}

const TIER_BADGE: Record<string, string> = {
  FREE:   "border-slate-200 bg-slate-50 text-slate-600",
  ELITE:  "border-amber-200 bg-amber-50 text-amber-700",
  MASTER: "border-violet-200 bg-violet-50 text-violet-700",
}

type SortKey = "created-desc" | "created-asc" | "title-asc" | "title-desc" | "questions-desc" | "results-desc"

export function ExamTableClient({ exams: initialExams, bankStats }: ExamTableClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ExamStatus | "ALL">("ALL")
  const [tierFilter, setTierFilter] = useState<ExamAccessTier | "ALL">("ALL")
  const [sortKey, setSortKey] = useState<SortKey>("created-desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExamRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  function openCreate() {
    setEditTarget(null)
    setDrawerOpen(true)
  }

  function openEdit(exam: ExamRow) {
    setEditTarget(exam)
    setDrawerOpen(true)
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus ujian ini beserta semua data terkait?")) return
    setDeletingId(id)
    await deleteExam(id)
    setDeletingId(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    router.refresh()
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    if (!confirm(`Hapus ${ids.length} ujian terpilih beserta semua data terkait?`)) return
    setBulkDeleting(true)
    await deleteExams(ids)
    setBulkDeleting(false)
    setSelectedIds(new Set())
    router.refresh()
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id)
    const res = await duplicateExam(id)
    setDuplicatingId(null)
    if (!res.success) alert(res.error ?? "Gagal menduplikasi ujian.")
    router.refresh()
  }

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase()
    return initialExams
      .filter((e) => {
        if (keyword && !e.title.toLowerCase().includes(keyword)) return false
        if (statusFilter !== "ALL" && e.status !== statusFilter) return false
        if (tierFilter !== "ALL" && e.accessTier !== tierFilter) return false
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
  }, [initialExams, search, statusFilter, tierFilter, sortKey])

  const visibleIds = filtered.map((exam) => exam.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id))
  const selectedCount = selectedIds.size

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  return (
    <>
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1">Exam Engine</p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Exam Builder</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Buat, konfigurasi, dan publikasikan ujian CAT untuk siswa.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold flex items-center gap-2 flex-shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Ujian Baru
        </Button>
      </div>

      {/* ── Bank Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Soal TWK", count: bankStats.TWK, cls: "text-red-600 bg-red-50 border-red-100" },
          { label: "Soal TIU", count: bankStats.TIU, cls: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Soal TKP", count: bankStats.TKP, cls: "text-purple-600 bg-purple-50 border-purple-100" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.cls}`}>
            <div className="text-2xl font-black">{s.count}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table Container ──────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama ujian..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ExamStatus | "ALL")} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-brand-blue">
                <option value="ALL">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value as ExamAccessTier | "ALL")} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-brand-blue">
                <option value="ALL">Semua Tier</option>
                <option value="FREE">Free</option>
                <option value="ELITE">Elite</option>
                <option value="MASTER">Master</option>
              </select>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-brand-blue">
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

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-10 py-4">
                  <button onClick={toggleVisible} className="text-slate-400 hover:text-brand-blue transition-colors" title="Pilih semua hasil filter">
                    {allVisibleSelected ? <CheckSquare2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Ujian
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
                <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] py-4">
                  Passing Grade
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
                      <ClipboardList className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">
                        {search ? "Tidak ada ujian yang cocok." : "Belum ada ujian. Mulai dengan membuat ujian baru."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-slate-50/80 group transition-colors">

                    <TableCell>
                      <button onClick={() => toggleOne(exam.id)} className="text-slate-300 hover:text-brand-blue transition-colors" title="Pilih ujian">
                        {selectedIds.has(exam.id) ? <CheckSquare2 className="w-5 h-5 text-brand-blue" /> : <Square className="w-5 h-5" />}
                      </button>
                    </TableCell>

                    {/* Ujian */}
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-brand-blue-deep transition-colors">
                          {exam.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {exam.durationMinutes} menit &middot; dibuat {fmtDate(exam.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="outline" className={`font-bold text-[11px] uppercase ${STATUS_BADGE[exam.status]}`}>
                        {exam.status}
                      </Badge>
                    </TableCell>

                    {/* Akses */}
                    <TableCell>
                      <Badge variant="outline" className={`font-bold text-[11px] ${TIER_BADGE[exam.accessTier]}`}>
                        {exam.accessTier}
                      </Badge>
                    </TableCell>

                    {/* Soal */}
                    <TableCell className="text-center">
                      <span className="text-sm font-black text-slate-700">{exam.questionCount}</span>
                    </TableCell>

                    {/* Peserta */}
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-slate-500">{exam.resultCount}</span>
                    </TableCell>

                    {/* Passing Grade */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                          TWK {exam.passingGradeTWK}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                          TIU {exam.passingGradeTIU}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">
                          TKP {exam.passingGradeTKP}
                        </span>
                      </div>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 text-brand-blue bg-blue-50 hover:bg-blue-100 text-xs font-bold"
                        >
                          <a href={`/admin/content/exams/${exam.id}`}>
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
                            <DropdownMenuLabel>Aksi Ujian</DropdownMenuLabel>
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

        {/* Row count */}
        {filtered.length > 0 && (
          <p className="text-sm text-slate-500">
            Menampilkan {filtered.length} dari {initialExams.length} ujian
          </p>
        )}
      </div>

      {/* ── Shared Exam Editor Drawer ─────────────────────────────── */}
      <ExamEditor
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        initialData={editTarget}
      />
    </>
  )
}
