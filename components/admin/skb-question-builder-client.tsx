"use client"

import { useState, useTransition, useMemo } from "react"
import { setSKBExamQuestions, smartRandomizeSKBQuestions } from "@/app/actions/skb-exams"
import {
  Wand2,
  Search,
  CheckSquare2,
  Square,
  Shuffle,
  Save,
  Loader2,
  Filter,
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type SKBCat = "TEKNIS" | "MANAJERIAL" | "SOSIAL_KULTURAL"
type Difficulty = "MUDAH" | "SEDANG" | "SULIT"

interface SKBQuestion {
  id: string
  category: SKBCat
  bidang: string
  subCategory: string
  content: string
  difficulty: Difficulty
  options: { id: string; text: string; score: number }[]
}

interface SKBExamInfo {
  id: string
  title: string
  bidang: string
  durationMinutes: number
  status: string
  accessTier: string
}

interface BankStats {
  TEKNIS: number
  MANAJERIAL: number
  SOSIAL_KULTURAL: number
}

interface SKBQuestionBuilderClientProps {
  exam: SKBExamInfo
  assignedQuestions: SKBQuestion[]
  bank: SKBQuestion[]
  bankStats: BankStats
}

const CATEGORY_BADGE: Record<SKBCat, string> = {
  TEKNIS: "border-orange-200 bg-orange-50 text-orange-700",
  MANAJERIAL: "border-purple-200 bg-purple-50 text-purple-700",
  SOSIAL_KULTURAL: "border-teal-200 bg-teal-50 text-teal-700",
}

const CATEGORY_LABELS: Record<SKBCat, string> = {
  TEKNIS: "Teknis",
  MANAJERIAL: "Manajerial",
  SOSIAL_KULTURAL: "Sosial Kultural",
}

const DIFF_BADGE: Record<Difficulty, string> = {
  MUDAH: "border-green-200 bg-green-50 text-green-700",
  SEDANG: "border-amber-200 bg-amber-50 text-amber-700",
  SULIT: "border-red-200 bg-red-50 text-red-700",
}

const PAGE_SIZE = 25

export function SKBQuestionBuilderClient({
  exam,
  assignedQuestions,
  bank,
  bankStats,
}: SKBQuestionBuilderClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(assignedQuestions.map((q) => q.id))
  )
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<SKBCat | "ALL">("ALL")
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "ALL">("ALL")
  const [filterBidang, setFilterBidang] = useState<string>("ALL")
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null)

  // Smart Randomizer settings
  const [randomCountTeknis, setRandomCountTeknis] = useState(20)
  const [randomCountManajerial, setRandomCountManajerial] = useState(25)
  const [randomCountSosial, setRandomCountSosial] = useState(20)
  const [randomDiff, setRandomDiff] = useState<Difficulty | "">("")
  const [showRandomizer, setShowRandomizer] = useState(false)

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  // All unique bidang in bank
  const allBidang = useMemo(() => {
    return Array.from(new Set(bank.map((q) => q.bidang))).sort()
  }, [bank])

  // Filtered list
  const filtered = useMemo(() => {
    return bank.filter((q) => {
      if (filterCategory !== "ALL" && q.category !== filterCategory) return false
      if (filterDifficulty !== "ALL" && q.difficulty !== filterDifficulty) return false
      if (filterBidang !== "ALL" && q.bidang !== filterBidang) return false
      if (
        search &&
        !q.content.toLowerCase().includes(search.toLowerCase()) &&
        !q.subCategory.toLowerCase().includes(search.toLowerCase()) &&
        !q.bidang.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [bank, filterCategory, filterDifficulty, filterBidang, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Category counters
  const selectedCounts = useMemo(() => {
    const counts: Record<SKBCat, number> = { TEKNIS: 0, MANAJERIAL: 0, SOSIAL_KULTURAL: 0 }
    for (const id of selectedIds) {
      const q = bank.find((x) => x.id === id)
      if (q) counts[q.category]++
    }
    return counts
  }, [selectedIds, bank])

  function toggleQuestion(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function togglePageAll() {
    const pageIds = paginated.map((q) => q.id)
    const allSelected = pageIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const res = await setSKBExamQuestions(exam.id, [...selectedIds])
      if (res.success) showToast("ok", `${res.count} soal SKB berhasil disimpan!`)
      else showToast("err", res.error ?? "Gagal menyimpan.")
    })
  }

  function handleAutoGenerate() {
    startTransition(async () => {
      const res = await smartRandomizeSKBQuestions({
        examId: exam.id,
        countTeknis: randomCountTeknis,
        countManajerial: randomCountManajerial,
        countSosialKultural: randomCountSosial,
        difficultyTeknis: randomDiff as Difficulty || undefined,
        difficultyManajerial: randomDiff as Difficulty || undefined,
        difficultySosialKultural: randomDiff as Difficulty || undefined,
        bidangFilter: exam.bidang !== "Umum" ? exam.bidang : undefined,
      })
      if (res.success) {
        showToast("ok", `Auto-generate ${res.count} soal SKB berhasil! Mengarahkan ke daftar exam...`)
        window.location.href = "/admin/content/skb-exams"
      } else {
        showToast("err", res.error ?? "Gagal auto-generate.")
      }
    })
  }

  const total = selectedIds.size
  const pageAllSelected = paginated.length > 0 && paginated.every((q) => selectedIds.has(q.id))
  const pagePartial = paginated.some((q) => selectedIds.has(q.id)) && !pageAllSelected

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold ${
            toast.type === "ok" ? "bg-orange-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/content/skb-exams"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          SKB Exam Builder
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-bold text-slate-900">{exam.title}</span>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-lg ml-1">
          {exam.bidang}
        </span>
      </div>

      {/* Summary + Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Category counters */}
          <div className="flex-1 grid grid-cols-3 gap-3">
            {(["TEKNIS", "MANAJERIAL", "SOSIAL_KULTURAL"] as SKBCat[]).map((cat) => {
              const current = selectedCounts[cat]
              const total_bank = bankStats[cat]
              return (
                <div key={cat} className={`rounded-xl px-4 py-3 border ${CATEGORY_BADGE[cat]}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  <div className="text-xl font-black">{current}</div>
                  <div className="text-[10px] font-bold mt-0.5 opacity-60">
                    dari {total_bank} tersedia
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowRandomizer(!showRandomizer)}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Smart Randomizer
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan ({total} soal)
            </Button>
          </div>
        </div>

        {/* Smart Randomizer panel */}
        {showRandomizer && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Konfigurasi Smart Randomizer
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                  Teknis
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={randomCountTeknis}
                  onChange={(e) => setRandomCountTeknis(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-orange-200 rounded-lg text-sm font-mono font-bold text-center outline-none focus:border-orange-400 bg-orange-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                  Manajerial
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={randomCountManajerial}
                  onChange={(e) => setRandomCountManajerial(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-purple-200 rounded-lg text-sm font-mono font-bold text-center outline-none focus:border-purple-400 bg-purple-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                  Sosial Kultural
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={randomCountSosial}
                  onChange={(e) => setRandomCountSosial(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-teal-200 rounded-lg text-sm font-mono font-bold text-center outline-none focus:border-teal-400 bg-teal-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Kesulitan
                </label>
                <select
                  value={randomDiff}
                  onChange={(e) => setRandomDiff(e.target.value as Difficulty | "")}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-orange-400 bg-slate-50"
                >
                  <option value="">Semua</option>
                  <option value="MUDAH">Mudah</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="SULIT">Sulit</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAutoGenerate}
                disabled={isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shuffle className="w-4 h-4" />
                )}
                Generate {randomCountTeknis + randomCountManajerial + randomCountSosial} Soal
              </Button>
              <p className="text-xs text-slate-500 font-medium">
                {exam.bidang !== "Umum"
                  ? `Soal Teknis akan difilter untuk bidang "${exam.bidang}"`
                  : "Semua bidang akan diambil untuk soal Teknis"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            className="pl-9 bg-slate-50 border-slate-100"
            placeholder="Cari konten, sub-materi, atau bidang..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(["ALL", "TEKNIS", "MANAJERIAL", "SOSIAL_KULTURAL"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilterCategory(cat); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterCategory === cat
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "ALL" ? "Semua" : cat === "TEKNIS" ? "Teknis" : cat === "MANAJERIAL" ? "Manajerial" : "Sosial"}
            </button>
          ))}
        </div>

        {/* Bidang filter */}
        {allBidang.length > 1 && (
          <select
            value={filterBidang}
            onChange={(e) => { setFilterBidang(e.target.value); setPage(1) }}
            className="h-8 px-2 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 outline-none focus:border-orange-300 cursor-pointer"
          >
            <option value="ALL">Semua Bidang</option>
            {allBidang.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}

        {/* Difficulty filter */}
        <div className="flex items-center gap-1.5">
          {(["ALL", "MUDAH", "SEDANG", "SULIT"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => { setFilterDifficulty(diff); setPage(1) }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterDifficulty === diff
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {diff === "ALL" ? "Semua" : diff}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium ml-auto">
          {filtered.length} soal ditemukan
        </span>
      </div>

      {/* Question Bank List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-4">
          <button
            onClick={togglePageAll}
            className={`flex-shrink-0 transition-colors ${
              pageAllSelected
                ? "text-orange-500"
                : pagePartial
                ? "text-orange-300"
                : "text-slate-300 hover:text-slate-400"
            }`}
            title="Pilih/batalkan semua soal di halaman ini"
          >
            {pageAllSelected ? (
              <CheckSquare2 className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Soal SKB ({paginated.length} ditampilkan)
          </span>
          <span className="ml-auto text-[11px] font-bold text-slate-400">
            {selectedIds.size} dipilih dari {bank.length} total
          </span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <BookMarked className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-bold">Tidak ada soal SKB yang cocok dengan filter.</p>
            <p className="text-xs mt-1">Coba ubah filter kategori atau bidang.</p>
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
                    isSelected ? "bg-orange-50/60 hover:bg-orange-50" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`mt-0.5 flex-shrink-0 transition-colors ${
                      isSelected
                        ? "text-orange-500"
                        : "text-slate-300 group-hover:text-slate-400"
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare2 className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-black px-2 py-0 ${CATEGORY_BADGE[q.category]}`}
                      >
                        {CATEGORY_LABELS[q.category]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold px-2 py-0 ${DIFF_BADGE[q.difficulty]}`}
                      >
                        {q.difficulty}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {q.bidang}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {q.subCategory}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      {q.content.replace(/<[^>]*>/g, "").slice(0, 200)}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {q.options.length} opsi jawaban
                    </p>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-slate-500 font-medium">
            Halaman {safePage} dari {totalPages} · {filtered.length} soal
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
