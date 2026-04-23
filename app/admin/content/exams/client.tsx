"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
}
import {
  MoreHorizontal,
  Pencil,
  Wand2,
  Trash2,
  Plus,
  ClipboardList,
  Search,
} from "lucide-react"
import { deleteExam } from "@/app/actions/exams"
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

export function ExamTableClient({ exams: initialExams, bankStats }: ExamTableClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExamRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    setDeletingId(id)
    await deleteExam(id)
    setDeletingId(null)
    router.refresh()
  }

  const filtered = initialExams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

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
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama ujian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <p className="text-sm text-slate-500 flex-shrink-0">
            {filtered.length} ujian
          </p>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
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
                  <TableCell colSpan={7} className="h-32 text-center">
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
