"use client"

import { useState, useTransition, useMemo } from "react"
import { setExamQuestions, smartRandomizeQuestions } from "@/app/actions/exams"
import {
  Wand2,
  Search,
  CheckSquare2,
  Square,
  Shuffle,
  Save,
  Loader2,
  Filter,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Category  = "TWK" | "TIU" | "TKP"
type Difficulty = "MUDAH" | "SEDANG" | "SULIT"

interface Question {
  id: string
  category: Category
  subCategory: string
  content: string
  difficulty: Difficulty
}

interface ExamQuestionBuilderClientProps {
  examId: string
  examStatus: string
  allQuestions: Question[]
  initialSelectedIds: string[]
}

const CATEGORY_BADGE: Record<Category, string> = {
  TWK: "border-red-200 bg-red-50 text-red-700",
  TIU: "border-blue-200 bg-blue-50 text-blue-700",
  TKP: "border-purple-200 bg-purple-50 text-purple-700",
}

const DIFF_BADGE: Record<Difficulty, string> = {
  MUDAH:  "border-green-200 bg-green-50 text-green-700",
  SEDANG: "border-amber-200 bg-amber-50 text-amber-700",
  SULIT:  "border-red-200 bg-red-50 text-red-700",
}

const TARGETS = { TWK: 30, TIU: 35, TKP: 45 }
const PAGE_SIZE = 25

export function ExamQuestionBuilderClient({
  examId,
  allQuestions,
  initialSelectedIds,
}: ExamQuestionBuilderClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds)
  )
  const [search, setSearch]                   = useState("")
  const [filterCategory, setFilterCategory]   = useState<Category | "ALL">("ALL")
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "ALL">("ALL")
  const [randomDiff, setRandomDiff]           = useState<Difficulty | "">("")
  const [isPending, startTransition]          = useTransition()
  const [page, setPage]                       = useState(1)
  const [toast, setToast]                     = useState<{ type: "ok" | "err"; msg: string } | null>(null)

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  // Reset to page 1 whenever filters/search change
  function applySearch(v: string)             { setSearch(v);           setPage(1) }
  function applyCategory(v: Category | "ALL") { setFilterCategory(v);   setPage(1) }
  function applyDifficulty(v: Difficulty | "ALL") { setFilterDifficulty(v); setPage(1) }

  // Filtered list (all matching — not paginated) — used for auto-generate too
  const filtered = useMemo(() => {
    return allQuestions.filter((q) => {
      if (filterCategory !== "ALL" && q.category !== filterCategory) return false
      if (filterDifficulty !== "ALL" && q.difficulty !== filterDifficulty) return false
      if (search && !q.content.toLowerCase().includes(search.toLowerCase()) &&
          !q.subCategory.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allQuestions, filterCategory, filterDifficulty, search])

  // Paginated slice for display
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Category counters (from ALL selected, not just current page)
  const selectedCounts = useMemo(() => {
    const counts = { TWK: 0, TIU: 0, TKP: 0 }
    for (const id of selectedIds) {
      const q = allQuestions.find((x) => x.id === id)
      if (q) counts[q.category]++
    }
    return counts
  }, [selectedIds, allQuestions])

  function toggleQuestion(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Select / deselect all on current page
  function togglePageAll() {
    const pageIds = paginated.map((q) => q.id)
    const allSelected = pageIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else             pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const res = await setExamQuestions(examId, [...selectedIds])
      if (res.success) {
        showToast("ok", `${res.count} soal berhasil disimpan! Mengarahkan ke daftar exam...`)
        window.location.href = "/admin/content/exams"
      } else {
        showToast("err", res.error ?? "Gagal menyimpan.")
      }
    })
  }

  function handleAutoGenerate() {
    startTransition(async () => {
      // Auto-generate picks from ALL questions in the bank (server-side random),
      // not limited to the current filtered/paginated view.
      const res = await smartRandomizeQuestions({
        examId,
        difficultyTWK: randomDiff as Difficulty || undefined,
        difficultyTIU: randomDiff as Difficulty || undefined,
        difficultyTKP: randomDiff as Difficulty || undefined,
      })
      if (res.success) {
        setSelectedIds(new Set(res.questionIds))
        showToast("ok", `Auto-generate ${res.count} soal berhasil dipilih. Klik Simpan untuk menerapkan.`)
      } else {
        showToast("err", res.error ?? "Gagal auto-generate.")
      }
    })
  }

  const total = selectedIds.size
  const pageAllSelected = paginated.length > 0 && paginated.every((q) => selectedIds.has(q.id))
  const pagePartial     = paginated.some((q) => selectedIds.has(q.id)) && !pageAllSelected

  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold ${
          toast.type === "ok" ? "bg-brand-blue-deep text-white" : "bg-red-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── Summary + Action Bar ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Category counters */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {(["TWK", "TIU", "TKP"] as Category[]).map((cat) => {
            const target  = TARGETS[cat]
            const current = selectedCounts[cat]
            const ok      = current === target
            return (
              <div key={cat} className={`rounded-xl px-4 py-3 border ${CATEGORY_BADGE[cat]}`}>
                <div className="text-[10px] font-black uppercase tracking-widest mb-1">{cat}</div>
                <div className="text-xl font-black">
                  {current}
                  <span className="text-[11px] opacity-60 font-bold">/{target}</span>
                </div>
                <div className={`text-[10px] font-bold mt-0.5 ${ok ? "opacity-100" : "opacity-60"}`}>
                  {ok ? "✓ Target terpenuhi" : `Butuh ${target - current} lagi`}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Auto-generate */}
          <div className="flex items-center gap-2">
            <select
              className="text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={randomDiff}
              onChange={(e) => setRandomDiff(e.target.value as Difficulty | "")}
            >
              <option value="">Semua Tingkat</option>
              <option value="MUDAH">Mudah</option>
              <option value="SEDANG">Sedang</option>
              <option value="SULIT">Sulit</option>
            </select>
            <Button
              onClick={handleAutoGenerate}
              disabled={isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2 whitespace-nowrap"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              Auto-Generate 110
            </Button>
          </div>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-brand-blue-deep hover:bg-brand-blue-deep text-white font-bold gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan ({total} soal)
          </Button>
        </div>
      </div>

      {/* ── Filter / Search Bar ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            className="pl-9 bg-slate-50 border-slate-100"
            placeholder="Cari konten atau sub-kategori..."
            value={search}
            onChange={(e) => applySearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(["ALL", "TWK", "TIU", "TKP"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => applyCategory(cat as Category | "ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterCategory === cat
                  ? "bg-brand-blue-deep text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-1.5">
          {(["ALL", "MUDAH", "SEDANG", "SULIT"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => applyDifficulty(diff as Difficulty | "ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterDifficulty === diff
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium ml-auto">
          {filtered.length} soal ditemukan
        </span>
      </div>

      {/* ── Question Bank List ────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Table header row */}
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-4">
          {/* Select-all for current page */}
          <button
            onClick={togglePageAll}
            className={`flex-shrink-0 transition-colors ${
              pageAllSelected ? "text-brand-blue" : pagePartial ? "text-brand-blue-light" : "text-slate-300 hover:text-slate-400"
            }`}
            title="Pilih/batalkan semua soal di halaman ini"
          >
            {pageAllSelected
              ? <CheckSquare2 className="w-5 h-5" />
              : <Square className="w-5 h-5" />
            }
          </button>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Soal ({paginated.length} ditampilkan)
          </span>
          <span className="ml-auto text-[11px] font-bold text-slate-400">
            {selectedIds.size} dipilih dari {allQuestions.length} total
          </span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BookOpen className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-bold">Tidak ada soal yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paginated.map((q) => {
              const isSelected = selectedIds.has(q.id)
              return (
                <button
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={`w-full flex items-start gap-4 px-5 py-4 text-left transition-colors group ${
                    isSelected ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`mt-0.5 flex-shrink-0 transition-colors ${
                    isSelected ? "text-brand-blue" : "text-slate-300 group-hover:text-slate-400"
                  }`}>
                    {isSelected
                      ? <CheckSquare2 className="w-5 h-5" />
                      : <Square className="w-5 h-5" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <Badge variant="outline" className={`text-[10px] font-black px-2 py-0 ${CATEGORY_BADGE[q.category]}`}>
                        {q.category}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${DIFF_BADGE[q.difficulty]}`}>
                        {q.difficulty}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">{q.subCategory}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      {q.content.replace(/<[^>]*>/g, "").slice(0, 180)}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-slate-500 font-medium">
            Halaman {safePage} dari {totalPages} &middot; {filtered.length} soal
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </Button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        safePage === item
                          ? "bg-brand-blue-deep text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="gap-1"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
